/**
 * Roster Import screen — premium feature.
 *
 * Flow:
 *  1. User picks a photo from their camera roll (or takes one).
 *  2. Image is compressed to JPEG and sent to Claude Vision via OCR service.
 *  3. Extracted shifts are shown for review (user can toggle individual rows).
 *  4. User confirms → shifts are saved to scheduleStore.
 */

import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, ActivityIndicator,
  Alert, TouchableOpacity, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing, Palette, Radius } from '@/constants/theme';
import { useScheduleStore } from '@/store/scheduleStore';
import { usePremiumStore } from '@/store/premiumStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/i18n';
import { extractShiftsFromImage, type ExtractedShift } from '@/services/ocr';
import { Analytics } from '@/services/analytics';
import { todayISO } from '@/utils/time';
import type { ShiftType } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function confidenceColor(c: ExtractedShift['confidence']): string {
  if (c === 'high')   return Palette.success;
  if (c === 'medium') return Palette.warning;
  return Palette.error;
}

function shiftLabel(type: ShiftType, t: ReturnType<typeof useTranslation>['t']): string {
  return t.shiftTypes[type]?.label ?? type;
}

function stripDataUriPrefix(b64: string): string {
  const idx = b64.indexOf(',');
  return idx >= 0 ? b64.slice(idx + 1) : b64;
}

function detectMimeType(base64: string): 'image/jpeg' | 'image/png' {
  const clean = stripDataUriPrefix(base64);
  if (clean.startsWith('iVBOR')) return 'image/png';
  return 'image/jpeg';
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type Step = 'pick' | 'processing' | 'review' | 'done';

export default function RosterImportScreen() {
  const router      = useRouter();
  const { colors }  = useColorScheme();
  const { t, language } = useTranslation();
  const ri          = t.rosterImport;
  const { isPremium } = usePremiumStore();
  const { addShiftForDate, setShiftForDate } = useScheduleStore();

  const locale = language === 'pl' ? 'pl-PL' : 'en-US';

  const [step,         setStep]         = useState<Step>('pick');
  const [imageUri,     setImageUri]     = useState<string | null>(null);
  const [extracted,    setExtracted]    = useState<ExtractedShift[]>([]);
  const [notes,        setNotes]        = useState('');
  const [selected,     setSelected]     = useState<Set<number>>(new Set());
  const [saving,       setSaving]       = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    Analytics.screen('roster_import');
    if (!isPremium()) {
      Alert.alert(
        ri.premiumTitle,
        ri.premiumMessage,
        [
          { text: ri.premiumCta, onPress: () => router.replace('/paywall') },
          { text: t.common.cancel, onPress: () => router.back(), style: 'cancel' },
        ],
      );
    }
  }, []);

  // ── Step 1: Pick image ──

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(ri.permissionLibrary);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const b64 = asset.base64 ?? '';
    setImageUri(asset.uri);
    await runOCR(b64, detectMimeType(b64));
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(ri.permissionCamera);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6, base64: true });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const b64 = asset.base64 ?? '';
    setImageUri(asset.uri);
    await runOCR(b64, detectMimeType(b64));
  };

  // ── Step 2: OCR ──

  const runOCR = async (rawBase64: string, mime: 'image/jpeg' | 'image/png') => {
    setStep('processing');
    setErrorMessage(null);
    try {
      const b64 = stripDataUriPrefix(rawBase64);
      const result = await extractShiftsFromImage(b64, mime);

      if (result.shifts.length === 0) {
        setErrorMessage(ri.noShiftsError);
        setStep('pick');
        return;
      }

      setExtracted(result.shifts);
      setNotes(result.notes);
      const preSelected = new Set(
        result.shifts.map((_, i) => i).filter(i => result.shifts[i].confidence !== 'low'),
      );
      setSelected(preSelected);
      setStep('review');
      Analytics.track('roster_ocr_success', { count: result.shifts.length });
    } catch (err: any) {
      console.error('[OCR]', err);
      const msg = err?.message?.includes('API key')
        ? 'API key not configured. Please add EXPO_PUBLIC_ANTHROPIC_API_KEY.'
        : (err?.message ?? 'Failed to process image. Please try again.');
      setErrorMessage(msg);
      setStep('pick');
      Analytics.track('roster_ocr_error', { error: err?.message ?? '' });
    }
  };

  // ── Step 3: Save confirmed shifts ──

  const saveShifts = async () => {
    setSaving(true);
    const toSave = extracted.filter((_, i) => selected.has(i));
    for (const shift of toSave) {
      if (shift.type === 'off') {
        setShiftForDate(shift.date, 'off');
      } else {
        addShiftForDate(shift.date, shift.type, shift.startTime ?? undefined, shift.endTime ?? undefined);
      }
    }
    setSaving(false);
    setStep('done');
    Analytics.track('roster_imported', { count: toSave.length });
  };

  const toggleRow = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const today = todayISO();

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h3" weight="bold">{ri.title}</Text>
        <Button label={ri.close} variant="ghost" size="sm" onPress={() => router.back()} />
      </View>

      {/* ── Step: pick ── */}
      {step === 'pick' && (
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.card}>
            <Text style={{ fontSize: 40, textAlign: 'center' }}>📷</Text>
            <Text variant="h3" weight="semibold" center style={{ marginTop: Spacing.sm }}>
              {ri.pickTitle}
            </Text>
            <Text variant="body" color="secondary" center>
              {ri.pickDesc}
            </Text>
          </Card>

          {errorMessage && (
            <Card style={[styles.card, { borderColor: Palette.error, borderWidth: 1 }]}>
              <Text variant="bodySmall" style={{ color: Palette.error }}>
                ⚠️ {errorMessage}
              </Text>
            </Card>
          )}

          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
          )}

          <View style={styles.btnGroup}>
            <Button
              label={ri.takePhoto}
              fullWidth
              size="lg"
              onPress={takePhoto}
            />
            {/* Secondary button rendered manually so it's always visible regardless of theme */}
            <TouchableOpacity
              onPress={pickImage}
              activeOpacity={0.75}
              style={[styles.outlineBtn, { borderColor: Palette.primary }]}
            >
              <Text variant="body" weight="semibold" style={{ color: Palette.primary }}>
                {ri.chooseLibrary}
              </Text>
            </TouchableOpacity>
          </View>

          <Card style={[styles.card, { marginTop: 0 }]}>
            <Text variant="caption" color="secondary">{ri.tipsTitle}</Text>
            <Text variant="caption" color="tertiary">{ri.tips}</Text>
          </Card>
        </ScrollView>
      )}

      {/* ── Step: processing ── */}
      {step === 'processing' && (
        <View style={styles.centred}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.previewSmall} resizeMode="contain" />
          )}
          <ActivityIndicator size="large" color={Palette.primary} style={{ marginTop: Spacing.xl }} />
          <Text variant="body" color="secondary" center style={{ marginTop: Spacing.md }}>
            {ri.analysing}
          </Text>
          <Text variant="caption" color="tertiary" center style={{ marginTop: Spacing.xs }}>
            {ri.analysingSub}
          </Text>
        </View>
      )}

      {/* ── Step: review ── */}
      {step === 'review' && (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text variant="body" color="secondary" center>{ri.reviewHint}</Text>

            {notes ? (
              <Card style={[styles.card, { borderColor: Palette.warning, borderWidth: 1 }]}>
                <Text variant="caption" color="secondary">📝 {notes}</Text>
              </Card>
            ) : null}

            {extracted.map((shift, i) => {
              const isSelected = selected.has(i);
              const isPast     = shift.date < today;
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.7}
                  onPress={() => toggleRow(i)}
                  style={[
                    styles.shiftRow,
                    {
                      backgroundColor: isSelected ? colors.surface : colors.surfaceSecondary,
                      borderColor:     isSelected ? Palette.primary : colors.border,
                      borderWidth:     isSelected ? 1.5 : 1,
                      opacity:         isPast ? 0.6 : 1,
                    },
                  ]}
                >
                  <View style={[
                    styles.checkbox,
                    { backgroundColor: isSelected ? Palette.primary : 'transparent',
                      borderColor:     isSelected ? Palette.primary : colors.border },
                  ]}>
                    {isSelected && <Text style={{ color: '#fff', fontSize: 11, lineHeight: 14 }}>✓</Text>}
                  </View>

                  <View style={styles.dateCol}>
                    <Text variant="caption" weight="semibold" color="secondary">
                      {new Date(shift.date + 'T12:00').toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()}
                    </Text>
                    <Text variant="body" weight="bold">
                      {new Date(shift.date + 'T12:00').toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text variant="body" weight="semibold">{shiftLabel(shift.type, t)}</Text>
                    {(shift.startTime || shift.endTime) && (
                      <Text variant="caption" color="secondary">
                        {shift.startTime ?? '?'} – {shift.endTime ?? '?'}
                      </Text>
                    )}
                  </View>

                  <View style={[styles.dot, { backgroundColor: confidenceColor(shift.confidence) }]} />
                </TouchableOpacity>
              );
            })}

            {/* Confidence legend */}
            <View style={styles.legend}>
              {([
                ['high',   ri.confidenceHigh],
                ['medium', ri.confidenceMed],
                ['low',    ri.confidenceLow],
              ] as const).map(([c, label]) => (
                <View key={c} style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: confidenceColor(c) }]} />
                  <Text variant="caption" color="tertiary">{label}</Text>
                </View>
              ))}
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
            <Text variant="caption" color="secondary" center style={{ marginBottom: Spacing.sm }}>
              {ri.selected(selected.size, extracted.length)}
            </Text>
            <Button
              label={saving ? ri.saving : ri.importBtn(selected.size)}
              fullWidth
              size="lg"
              loading={saving}
              disabled={selected.size === 0}
              onPress={saveShifts}
            />
            <Button
              label={ri.tryAnother}
              variant="ghost"
              fullWidth
              size="sm"
              onPress={() => { setStep('pick'); setExtracted([]); setSelected(new Set()); }}
              style={{ marginTop: Spacing.xs }}
            />
          </View>
        </>
      )}

      {/* ── Step: done ── */}
      {step === 'done' && (
        <View style={styles.centred}>
          <Text style={{ fontSize: 64, textAlign: 'center' }}>✅</Text>
          <Text variant="h2" weight="bold" center style={{ marginTop: Spacing.md }}>
            {ri.doneTitle}
          </Text>
          <Text variant="body" color="secondary" center style={{ marginTop: Spacing.sm }}>
            {ri.doneDesc(selected.size)}
          </Text>
          <Button
            label={ri.goToSchedule}
            size="lg"
            onPress={() => router.replace('/(tabs)/schedule')}
            style={{ marginTop: Spacing.xl }}
          />
          <Button
            label={ri.importAnother}
            variant="ghost"
            size="sm"
            onPress={() => {
              setStep('pick');
              setExtracted([]);
              setSelected(new Set());
              setImageUri(null);
              setNotes('');
            }}
            style={{ marginTop: Spacing.sm }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    padding:        Spacing.base,
    paddingTop:     Spacing.xl,
  },
  content: {
    paddingHorizontal: Spacing.base,
    gap:               Spacing.md,
    paddingBottom:     20,
  },
  card:    { gap: Spacing.sm },
  centred: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        Spacing.xl,
  },
  preview: {
    width:           '100%',
    height:          200,
    borderRadius:    Radius.md,
    backgroundColor: '#000',
  },
  previewSmall: {
    width:           240,
    height:          160,
    borderRadius:    Radius.md,
    backgroundColor: '#000',
  },
  btnGroup: { gap: Spacing.sm },
  // Explicit outline button — avoids theme-dependent text colour on ghost/outline variants
  outlineBtn: {
    borderWidth:    2,
    borderRadius:   Radius.lg,
    paddingVertical: 14,
    alignItems:     'center',
    justifyContent: 'center',
  },
  shiftRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing.md,
    borderRadius:   Radius.md,
    padding:        Spacing.md,
  },
  checkbox: {
    width:          22,
    height:         22,
    borderRadius:   6,
    borderWidth:    2,
    alignItems:     'center',
    justifyContent: 'center',
  },
  dateCol: {
    width:      52,
    alignItems: 'flex-start',
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
  legend: {
    flexDirection:  'row',
    gap:            Spacing.md,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.xs,
  },
  footer: {
    position:       'absolute',
    bottom: 0, left: 0, right: 0,
    padding:        Spacing.base,
    paddingBottom:  Spacing.xl,
    borderTopWidth: 1,
  },
});
