import React, { useState, useCallback } from 'react';
import {
  View, Switch, Alert, StyleSheet, TouchableOpacity,
  Modal, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SelectOption } from '@/components/ui/SelectOption';
import { TimeWheelPicker } from '@/components/ui/TimeWheelPicker';
import { Spacing, Palette, Radius, Spacing as S } from '@/constants/theme';
import {
  SHIFT_DEFAULTS, EDITABLE_SHIFT_TYPES, getEffectiveShiftTimes,
} from '@/constants/shifts';
import { useUserStore } from '@/store/userStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useCheckInStore } from '@/store/checkInStore';
import { usePremiumStore } from '@/store/premiumStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/i18n';
import type { AppLanguage } from '@/store/languageStore';
import { Analytics } from '@/services/analytics';
import { presentCustomerCenter } from '@/services/purchases';
import type { ShiftType, WorkRole, ShiftPattern, Goal, CaffeineSensitivity, SleepDifficulty } from '@/types';

// ─── Small reusable pieces ────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text variant="caption" weight="semibold" color="tertiary" style={styles.sectionTitle}>
      {title.toUpperCase()}
    </Text>
  );
}

function SettingRow({
  label, value, onPress, last = false,
}: { label: string; value?: string; onPress?: () => void; last?: boolean }) {
  const { colors } = useColorScheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.row, { borderBottomColor: last ? 'transparent' : colors.borderLight }]}
      activeOpacity={0.7}
    >
      <Text variant="body">{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
        {value !== undefined && (
          <Text variant="body" color="secondary" style={{ maxWidth: 180 }} numberOfLines={1}>
            {value}
          </Text>
        )}
        {onPress && <Text color="tertiary" style={{ fontSize: 18 }}>›</Text>}
      </View>
    </TouchableOpacity>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

function ModalShell({
  visible, title, onClose, children, onSave,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  onSave?: () => void;
}) {
  const { colors } = useColorScheme();
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text variant="body" style={{ color: Palette.primary }}>{t.settings.modal.cancel}</Text>
          </TouchableOpacity>
          <Text variant="body" weight="semibold">{title}</Text>
          {onSave ? (
            <TouchableOpacity onPress={onSave}>
              <Text variant="body" weight="semibold" style={{ color: Palette.primary }}>{t.settings.modal.save}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 50 }} />
          )}
        </View>
        {children}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Profile field labels ─────────────────────────────────────────────────────

const SLEEP_HOUR_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

type ProfileField =
  | 'role' | 'pattern' | 'sleep' | 'caffeine' | 'difficulty' | 'goals' | 'prepTime';

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useColorScheme();
  const { t, language, setLanguage } = useTranslation();

  const profile        = useUserStore(s => s.profile);
  const updateProfile  = useUserStore(s => s.updateProfile);
  const resetUser      = useUserStore(s => s.reset);
  const resetSchedule  = useScheduleStore(s => s.reset);
  const resetCheckIns  = useCheckInStore(s => s.reset);
  const { isPremium, activatePremium, deactivatePremium } = usePremiumStore();

  // ── Profile editing modal ──
  const [editingField, setEditingField] = useState<ProfileField | null>(null);
  const [draftGoals, setDraftGoals] = useState<Goal[]>([]);

  const openField = (field: ProfileField) => {
    if (field === 'goals') setDraftGoals(profile?.goals ?? []);
    setEditingField(field);
  };

  const saveGoals = () => {
    updateProfile({ goals: draftGoals });
    setEditingField(null);
  };

  // ── Shift time defaults modal ──
  const [editingShift,  setEditingShift]  = useState<ShiftType | null>(null);
  const [shiftTab,      setShiftTab]      = useState<'start' | 'end'>('start');
  const [shiftStart,    setShiftStart]    = useState('06:00');
  const [shiftEnd,      setShiftEnd]      = useState('14:00');

  const openShiftDefault = (type: ShiftType) => {
    const times = getEffectiveShiftTimes(type, profile?.shiftTimeDefaults);
    setShiftStart(times.startTime || '06:00');
    setShiftEnd(times.endTime   || '14:00');
    setShiftTab('start');
    setEditingShift(type);
  };

  const saveShiftDefault = () => {
    if (!editingShift) return;
    updateProfile({
      shiftTimeDefaults: {
        ...(profile?.shiftTimeDefaults ?? {}),
        [editingShift]: { startTime: shiftStart, endTime: shiftEnd },
      },
    });
    setEditingShift(null);
  };

  const resetShiftDefault = () => {
    if (!editingShift) return;
    const next = { ...(profile?.shiftTimeDefaults ?? {}) };
    delete next[editingShift];
    updateProfile({ shiftTimeDefaults: next });
    setEditingShift(null);
  };

  const notificationsEnabled = profile?.notifications.enabled ?? false;
  const toggleNotifications = () =>
    updateProfile({ notifications: { ...(profile?.notifications as any), enabled: !notificationsEnabled } });

  React.useEffect(() => { Analytics.screen('settings'); }, []);

  const confirmReset = () =>
    Alert.alert(
      t.settings.reset.title,
      t.settings.reset.message,
      [
        { text: t.settings.reset.cancel, style: 'cancel' },
        {
          text: t.settings.reset.confirm, style: 'destructive',
          onPress: () => { resetUser(); resetSchedule(); resetCheckIns(); router.replace('/onboarding'); },
        },
      ],
    );

  // ── Helpers ──
  const roleLabel    = profile?.role ? t.roles[profile.role as WorkRole]?.label : t.common.notSet;
  const patternLabel = profile?.shiftPattern ? t.patterns[profile.shiftPattern as ShiftPattern]?.label : t.common.notSet;
  const goalLabels   = (profile?.goals ?? [])
    .map(g => t.goalOptions[g as Goal]?.label ?? g)
    .join(', ') || t.common.none;
  const prepTimeLabel = t.prepTimeOptions.find(o => o.value === (profile?.prepTimeMinutes ?? 30))?.label ?? '30 min';

  const LANG_OPTIONS: { code: AppLanguage; label: string; flag: string }[] = [
    { code: 'en', label: t.settings.language.en, flag: '🇬🇧' },
    { code: 'pl', label: t.settings.language.pl, flag: '🇵🇱' },
  ];

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="h2" weight="bold" style={styles.heading}>{t.settings.title}</Text>

        {/* ── Premium ── */}
        {!isPremium() && (
          <TouchableOpacity
            onPress={() => { Analytics.premiumPaywallViewed('settings'); router.push('/paywall'); }}
            style={[styles.premiumBanner, { backgroundColor: `${Palette.primary}15` }]}
          >
            <Text style={{ fontSize: 22 }}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="semibold" style={{ color: Palette.primary }}>{t.settings.premium.upgrade}</Text>
              <Text variant="bodySmall" color="secondary">{t.settings.premium.upgradeDesc}</Text>
            </View>
            <Text style={{ color: Palette.primary }}>›</Text>
          </TouchableOpacity>
        )}
        {isPremium() && (
          <Card style={{ gap: S.sm, marginBottom: S.base }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.md }}>
              <Text style={{ fontSize: 22 }}>⭐</Text>
              <Text variant="body" weight="semibold" style={{ color: Palette.primary, flex: 1 }}>{t.settings.premium.active}</Text>
              <Badge label="PRO" variant="premium" />
            </View>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await presentCustomerCenter();
                } catch (err: any) {
                  Alert.alert('Subscription', err?.message ?? 'Could not open subscription management.');
                }
              }}
              style={[styles.manageSubBtn, { borderColor: Palette.primary }]}
              activeOpacity={0.7}
            >
              <Text variant="bodySmall" weight="semibold" style={{ color: Palette.primary }}>
                {t.settings.premium.manageSubscription}
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* ── Profile ── */}
        <SectionHeader title={t.settings.sections.profile} />
        <Card style={styles.section}>
          <SettingRow label={t.settings.fields.role}                 value={roleLabel}                                 onPress={() => openField('role')} />
          <SettingRow label={t.settings.fields.shiftPattern}         value={patternLabel}                              onPress={() => openField('pattern')} />
          <SettingRow label={t.settings.fields.sleepGoal}            value={`${profile?.targetSleepHours ?? 8}h`}      onPress={() => openField('sleep')} />
          <SettingRow label={t.settings.fields.caffeineSensitivity}  value={profile?.caffeineSensitivity ?? 'medium'}  onPress={() => openField('caffeine')} />
          <SettingRow label={t.settings.fields.sleepDifficulty}      value={profile?.sleepDifficulty ?? 'moderate'}    onPress={() => openField('difficulty')} />
          <SettingRow label={t.settings.fields.prepTime}             value={prepTimeLabel}                             onPress={() => openField('prepTime')} />
          <SettingRow label={t.settings.fields.goals}                value={goalLabels}                                onPress={() => openField('goals')} last />
        </Card>

        {/* ── Shift time defaults ── */}
        <SectionHeader title={t.settings.sections.shiftDefaults} />
        <Text variant="caption" color="tertiary" style={{ marginHorizontal: S.xs, marginBottom: S.sm }}>
          {t.settings.shiftDefaultsDesc}
        </Text>
        <Card style={styles.section}>
          {EDITABLE_SHIFT_TYPES.map((type, i) => {
            const base   = SHIFT_DEFAULTS[type];
            const custom = profile?.shiftTimeDefaults?.[type];
            const start  = custom?.startTime ?? base.startTime;
            const end    = custom?.endTime   ?? base.endTime;
            const isCustom = !!custom;
            return (
              <SettingRow
                key={type}
                label={`${base.emoji}  ${t.shiftTypes[type]?.label ?? base.label}`}
                value={isCustom ? `${start} – ${end} ✎` : `${start} – ${end}`}
                onPress={() => openShiftDefault(type)}
                last={i === EDITABLE_SHIFT_TYPES.length - 1}
              />
            );
          })}
        </Card>

        {/* ── Notifications ── */}
        <SectionHeader title={t.settings.sections.notifications} />
        <Card style={styles.section}>
          <View style={[styles.row, { borderBottomColor: 'transparent' }]}>
            <Text variant="body">{t.settings.fields.enableNotifications}</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border, true: Palette.primary }}
              thumbColor="#FFF"
            />
          </View>
        </Card>

        {/* ── Language ── */}
        <SectionHeader title={t.settings.sections.language} />
        <Card style={[styles.section, { padding: S.base }]}>
          <View style={styles.langRow}>
            {LANG_OPTIONS.map(lang => {
              const active = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => setLanguage(lang.code)}
                  style={[
                    styles.langChip,
                    {
                      backgroundColor: active ? Palette.primary : colors.surfaceSecondary,
                      borderColor: active ? Palette.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 18 }}>{lang.flag}</Text>
                  <Text
                    variant="body"
                    weight={active ? 'semibold' : 'regular'}
                    style={{ color: active ? '#fff' : colors.text }}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* ── Time Format ── */}
        <SectionHeader title={t.settings.sections.timeFormat} />
        <Card style={[styles.section, { padding: Spacing.base }]}>
          <View style={styles.langRow}>
            {(['24h', '12h'] as const).map(fmt => {
              const active = (profile?.timeFormat ?? '24h') === fmt;
              return (
                <TouchableOpacity
                  key={fmt}
                  onPress={() => updateProfile({ timeFormat: fmt })}
                  style={[
                    styles.langChip,
                    {
                      backgroundColor: active ? Palette.primary : colors.surfaceSecondary,
                      borderColor: active ? Palette.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    variant="body"
                    weight={active ? 'semibold' : 'regular'}
                    style={{ color: active ? '#fff' : colors.text }}
                  >
                    {fmt === '24h' ? t.settings.timeFormat.h24 : t.settings.timeFormat.h12}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* ── Dev tools ── */}
        {__DEV__ && (
          <>
            <SectionHeader title={t.settings.sections.developer} />
            <Card style={styles.section}>
              <SettingRow
                label={t.settings.fields.premiumStatus}
                value={isPremium() ? 'Active' : 'Free'}
                onPress={() => { if (isPremium()) deactivatePremium(); else activatePremium(); }}
                last
              />
            </Card>
          </>
        )}

        {/* ── Data ── */}
        <SectionHeader title={t.settings.sections.data} />
        <Card style={styles.section}>
          <View style={[styles.row, { borderBottomColor: 'transparent' }]}>
            <View>
              <Text variant="body">{t.settings.fields.dataStorage}</Text>
              <Text variant="caption" color="tertiary">{t.settings.fields.dataStorageDesc}</Text>
            </View>
          </View>
        </Card>

        {/* ── About ── */}
        <SectionHeader title={t.settings.sections.about} />
        <Card style={styles.section}>
          <SettingRow label={t.settings.fields.version} value="1.0.0 (MVP)" last />
        </Card>

        {/* ── Danger ── */}
        <Button
          label={t.settings.reset.buttonLabel}
          variant="destructive"
          fullWidth
          size="md"
          onPress={confirmReset}
          style={{ marginTop: S.xl, marginBottom: S['2xl'] }}
        />
      </ScrollView>

      {/* ══════════════════════════════════════════════
          Profile field editing modal
      ══════════════════════════════════════════════ */}
      <ModalShell
        visible={editingField !== null && editingField !== 'goals'}
        title={
          editingField === 'role'       ? t.settings.modal.yourRole :
          editingField === 'pattern'    ? t.settings.modal.shiftPattern :
          editingField === 'sleep'      ? t.settings.modal.sleepGoal :
          editingField === 'caffeine'   ? t.settings.modal.caffeineSensitivity :
          editingField === 'difficulty' ? t.settings.modal.sleepDifficulty :
          editingField === 'prepTime'   ? t.settings.modal.prepTime : ''
        }
        onClose={() => setEditingField(null)}
      >
        <ScrollView contentContainerStyle={styles.modalList}>
          {editingField === 'role' && (Object.keys(t.roles) as WorkRole[]).map(key => (
            <SelectOption
              key={key}
              label={t.roles[key].label}
              icon={getRoleIcon(key)}
              selected={profile?.role === key}
              onPress={() => { updateProfile({ role: key }); setEditingField(null); }}
            />
          ))}

          {editingField === 'pattern' && (Object.keys(t.patterns) as ShiftPattern[]).map(key => (
            <SelectOption
              key={key}
              label={t.patterns[key].label}
              description={t.patterns[key].description}
              selected={profile?.shiftPattern === key}
              onPress={() => { updateProfile({ shiftPattern: key }); setEditingField(null); }}
            />
          ))}

          {editingField === 'sleep' && SLEEP_HOUR_OPTIONS.map(h => (
            <SelectOption
              key={String(h)}
              label={t.settings.sleepHours.hoursLabel(h)}
              description={
                h < 7 ? t.settings.sleepHours.shortSleeper :
                h >= 9 ? t.settings.sleepHours.longSleeper :
                t.settings.sleepHours.recommended
              }
              selected={profile?.targetSleepHours === h}
              onPress={() => { updateProfile({ targetSleepHours: h }); setEditingField(null); }}
            />
          ))}

          {editingField === 'caffeine' && t.caffeineOptions.map(opt => (
            <SelectOption
              key={opt.value}
              label={opt.label}
              description={opt.description}
              selected={profile?.caffeineSensitivity === opt.value as CaffeineSensitivity}
              onPress={() => { updateProfile({ caffeineSensitivity: opt.value as CaffeineSensitivity }); setEditingField(null); }}
            />
          ))}

          {editingField === 'difficulty' && t.sleepDiffOptions.map(opt => (
            <SelectOption
              key={opt.value}
              label={opt.label}
              description={opt.description}
              selected={profile?.sleepDifficulty === opt.value as SleepDifficulty}
              onPress={() => { updateProfile({ sleepDifficulty: opt.value as SleepDifficulty }); setEditingField(null); }}
            />
          ))}

          {editingField === 'prepTime' && (
            <>
              <Text variant="caption" color="secondary" style={{ paddingHorizontal: S.xs, marginBottom: S.sm }}>
                {t.settings.modal.prepTimeDesc}
              </Text>
              {t.prepTimeOptions.map(opt => (
                <SelectOption
                  key={opt.value}
                  label={opt.label}
                  description={opt.desc}
                  selected={(profile?.prepTimeMinutes ?? 30) === opt.value}
                  onPress={() => { updateProfile({ prepTimeMinutes: opt.value }); setEditingField(null); }}
                />
              ))}
            </>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </ModalShell>

      {/* Goals multi-select (needs explicit Save) */}
      <ModalShell
        visible={editingField === 'goals'}
        title={t.settings.modal.goals}
        onClose={() => setEditingField(null)}
        onSave={saveGoals}
      >
        <ScrollView contentContainerStyle={styles.modalList}>
          {(Object.keys(t.goalOptions) as Goal[]).map(key => {
            const active = draftGoals.includes(key);
            return (
              <SelectOption
                key={key}
                label={t.goalOptions[key].label}
                description={t.goalOptions[key].description}
                icon={getGoalIcon(key)}
                selected={active}
                onPress={() => {
                  setDraftGoals(prev =>
                    active ? prev.filter(g => g !== key) : [...prev, key],
                  );
                }}
              />
            );
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
      </ModalShell>

      {/* ══════════════════════════════════════════════
          Shift time defaults modal
      ══════════════════════════════════════════════ */}
      <Modal
        visible={editingShift !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditingShift(null)}>
              <Text variant="body" style={{ color: Palette.primary }}>{t.settings.modal.cancel}</Text>
            </TouchableOpacity>
            <Text variant="body" weight="semibold">
              {editingShift
                ? `${SHIFT_DEFAULTS[editingShift].emoji}  ${t.shiftTypes[editingShift]?.label ?? SHIFT_DEFAULTS[editingShift].label} ${t.settings.modal.shiftDefaults}`
                : ''}
            </Text>
            <TouchableOpacity onPress={saveShiftDefault}>
              <Text variant="body" weight="semibold" style={{ color: Palette.primary }}>{t.settings.modal.save}</Text>
            </TouchableOpacity>
          </View>

          {/* Start / End tabs */}
          <View style={[styles.tabs, { backgroundColor: colors.surfaceSecondary, margin: S.base }]}>
            {(['start', 'end'] as const).map(tab => {
              const active = shiftTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, active && { backgroundColor: colors.background }]}
                  onPress={() => setShiftTab(tab)}
                  activeOpacity={0.7}
                >
                  <Text variant="bodySmall" weight={active ? 'semibold' : 'regular'}
                    style={{ color: active ? colors.text : colors.textSecondary }}>
                    {tab === 'start' ? t.settings.modal.startTime : t.settings.modal.endTime}
                  </Text>
                  <Text variant="caption" style={{ color: active ? Palette.primary : colors.textTertiary }}>
                    {tab === 'start' ? shiftStart : shiftEnd}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Wheel picker */}
          {shiftTab === 'start' ? (
            <TimeWheelPicker
              key={`sd-start-${editingShift}`}
              value={shiftStart}
              onChange={setShiftStart}
            />
          ) : (
            <TimeWheelPicker
              key={`sd-end-${editingShift}`}
              value={shiftEnd}
              onChange={setShiftEnd}
            />
          )}

          {/* Summary + reset */}
          <View style={{ padding: S.base, gap: S.md }}>
            <View style={[styles.summaryRow, { backgroundColor: colors.surface }]}>
              <Text variant="body" color="secondary">{t.settings.modal.defaultHours}</Text>
              <Text variant="body" weight="semibold">{shiftStart} – {shiftEnd}</Text>
            </View>
            {profile?.shiftTimeDefaults?.[editingShift!] && (
              <Button
                label={t.settings.modal.resetToDefault}
                variant="ghost"
                size="sm"
                fullWidth
                onPress={resetShiftDefault}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRoleIcon(role: WorkRole): string {
  const icons: Record<WorkRole, string> = {
    nurse:          '🏥',
    doctor:         '⚕️',
    paramedic:      '🚑',
    factory_worker: '🏭',
    retail:         '🛒',
    security:       '🔐',
    driver:         '🚛',
    hospitality:    '🏨',
    warehouse:      '📦',
    other:          '💼',
  };
  return icons[role];
}

function getGoalIcon(goal: Goal): string {
  const icons: Record<Goal, string> = {
    better_sleep:   '😴',
    less_fatigue:   '⚡',
    shift_recovery: '🔄',
    stable_routine: '📅',
  };
  return icons[goal];
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  heading: {
    marginTop: Spacing.base,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  section: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    minHeight: 52,
  },
  manageSubBtn: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    marginBottom: Spacing.base,
  },
  langRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  langChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  // Modal
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.xl,
  },
  modalList: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  // Shift defaults modal
  tabs: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    gap: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: Radius.lg,
  },
});
