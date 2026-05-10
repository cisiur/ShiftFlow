import React, { useState } from 'react';
import {
  View, TouchableOpacity, StyleSheet, Modal, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { SelectOption } from '@/components/ui/SelectOption';
import { TimeWheelPicker } from '@/components/ui/TimeWheelPicker';
import { Spacing, Palette, Radius } from '@/constants/theme';
import { useScheduleStore } from '@/store/scheduleStore';
import { usePlanStore } from '@/store/planStore';
import { useUserStore } from '@/store/userStore';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  weekDates, todayISO, formatDateLabel, isToday, offsetDate, relativeDayLabel,
} from '@/utils/time';
import { shiftEmoji } from '@/utils/format';
import { formatShiftHours, shiftDurationHours } from '@/domain/schedule/helpers';
import { getEffectiveShiftTimes } from '@/constants/shifts';
import type { ShiftType, ShiftEntry } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Analytics } from '@/services/analytics';
import { useTranslation } from '@/i18n';

// ─── Constants ────────────────────────────────────────────────────────────────

const SHIFT_COLORS: Record<string, string> = {
  morning:    Palette.shiftMorning,
  afternoon:  Palette.shiftAfternoon,
  night:      Palette.shiftNight,
  long_day:   Palette.shiftLongDay,
  long_night: Palette.shiftLongNight,
  extended:   Palette.primary,
  off:        Palette.shiftOff,
  custom:     Palette.shiftCustom,
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ScheduleScreen() {
  const router = useRouter();
  const { colors } = useColorScheme();
  const { t, language } = useTranslation();
  const profile = useUserStore(s => s.profile);

  const [weekAnchor,  setWeekAnchor]  = useState(todayISO());
  const [editingDate, setEditingDate] = useState<string | null>(null);

  // The shift type currently selected in the "add" picker (null = nothing picked yet)
  const [pickedType, setPickedType] = useState<ShiftType | null>(null);
  const [activeTab,  setActiveTab]  = useState<'start' | 'end'>('start');
  const [customStart, setCustomStart] = useState('09:00');
  const [customEnd,   setCustomEnd]   = useState('17:00');

  const {
    getShiftsForWeek,
    getShiftsForDate,
    setShiftForDate,
    addShiftForDate,
    removeShift,
  } = useScheduleStore();
  const { generateToday, generateWeek } = usePlanStore();

  const dates  = weekDates(weekAnchor);
  const shifts = getShiftsForWeek(dates); // primary shift per date (for row accent)

  // Visible options — never show 'extended' (replaced by multi-shift)
  const visibleOptions = (Object.keys(t.shiftTypes) as ShiftType[])
    .filter(k => k !== 'extended')
    .map(k => ({ value: k, label: t.shiftTypes[k].label, icon: getShiftIcon(k) }));

  React.useEffect(() => { Analytics.screen('schedule'); }, []);

  // Shifts already saved for the day being edited
  const dayShifts: ShiftEntry[] = editingDate ? getShiftsForDate(editingDate) : [];

  // ── Open / close ──

  const openEdit = (date: string) => {
    setPickedType(null);
    setActiveTab('start');
    setCustomStart('09:00');
    setCustomEnd('17:00');
    setEditingDate(date);
  };

  const handleTypeChange = (type: ShiftType) => {
    setPickedType(type);
    setActiveTab('start');
    if (type !== 'custom') {
      const times = getEffectiveShiftTimes(type, profile?.shiftTimeDefaults);
      setCustomStart(times.startTime || '09:00');
      setCustomEnd(times.endTime     || '17:00');
    }
  };

  // ── Add / save ──

  const handleAdd = () => {
    if (!editingDate || pickedType === null) return;

    if (pickedType === 'off') {
      // 'Day off' replaces everything for the date
      setShiftForDate(editingDate, 'off');
      setEditingDate(null);
    } else if (pickedType === 'custom') {
      addShiftForDate(editingDate, 'custom', customStart, customEnd);
      setPickedType(null); // reset picker, stay in modal
    } else {
      const times = getEffectiveShiftTimes(pickedType, profile?.shiftTimeDefaults);
      addShiftForDate(
        editingDate, pickedType,
        times.startTime || undefined,
        times.endTime   || undefined,
      );
      setPickedType(null); // reset picker, stay in modal
    }

    generateToday();
    generateWeek(weekAnchor);
    Analytics.track('shift_updated', { type: pickedType });
  };

  const prevWeek = () => setWeekAnchor(o => offsetDate(o, -7));
  const nextWeek = () => setWeekAnchor(o => offsetDate(o, 7));

  // ── Render ──

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h2" weight="bold">{t.tabs.schedule}</Text>
        <TouchableOpacity
          onPress={() => router.push('/roster-import')}
          style={styles.importBtn}
        >
          <Text style={{ fontSize: 18 }}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* Week navigation */}
      <View style={styles.weekNav}>
        <TouchableOpacity onPress={prevWeek} style={styles.navBtn}>
          <Text variant="body" style={{ color: Palette.primary }}>‹</Text>
        </TouchableOpacity>
        <Text variant="body" weight="semibold">
          {formatDateLabel(dates[0], language === 'pl' ? 'pl-PL' : 'en-US')} – {formatDateLabel(dates[6], language === 'pl' ? 'pl-PL' : 'en-US')}
        </Text>
        <TouchableOpacity onPress={nextWeek} style={styles.navBtn}>
          <Text variant="body" style={{ color: Palette.primary }}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Days list */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {dates.map((date, i) => {
          const primaryShift = shifts[i];
          const today        = isToday(date);
          const allForDay    = getShiftsForDate(date);
          const hasMultiple  = allForDay.filter(s => s.type !== 'off').length > 1;

          return (
            <TouchableOpacity
              key={date}
              onPress={() => openEdit(date)}
              activeOpacity={0.8}
              style={[
                styles.dayRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: today ? Palette.primary : colors.border,
                  borderWidth: today ? 1.5 : 1,
                },
              ]}
            >
              {/* Date pill */}
              <View style={[styles.datePill, { backgroundColor: today ? Palette.primaryLight : colors.surfaceSecondary }]}>
                <Text variant="caption" weight="semibold" style={{ color: today ? Palette.primary : colors.textSecondary }}>
                  {new Date(date + 'T12:00:00').toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US', { weekday: 'short' }).toUpperCase()}
                </Text>
                <Text variant="h3" weight="bold" style={{ color: today ? Palette.primary : colors.text }}>
                  {new Date(date + 'T12:00:00').getDate()}
                </Text>
              </View>

              {/* Shift info */}
              <View style={{ flex: 1, paddingHorizontal: Spacing.md, gap: 3 }}>
                {hasMultiple
                  ? allForDay.filter(s => s.type !== 'off').map(s => (
                      <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                        <Text style={{ fontSize: 14 }}>{shiftEmoji(s.type)}</Text>
                        <Text
                          variant="bodySmall"
                          weight="semibold"
                          style={{ color: SHIFT_COLORS[s.type] ?? Palette.shiftCustom }}
                        >
                          {t.shiftTypes[s.type]?.label ?? s.type}
                        </Text>
                        <Text variant="caption" color="tertiary">
                          {effectiveShiftHours(s, profile?.shiftTimeDefaults, t.schedule.dayOff)}
                        </Text>
                      </View>
                    ))
                  : (
                    <>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                        <Text style={{ fontSize: 18 }}>{shiftEmoji(primaryShift.type)}</Text>
                        <Text
                          variant="body"
                          weight="semibold"
                          style={{ color: SHIFT_COLORS[primaryShift.type] ?? Palette.shiftCustom }}
                        >
                          {t.shiftTypes[primaryShift.type]?.label ?? primaryShift.type}
                        </Text>
                      </View>
                      <Text variant="bodySmall" color="secondary">
                        {effectiveShiftHours(primaryShift, profile?.shiftTimeDefaults, t.schedule.dayOff)}
                        {effectiveDurationHours(primaryShift, profile?.shiftTimeDefaults) > 0
                          ? ` · ${effectiveDurationHours(primaryShift, profile?.shiftTimeDefaults)}h`
                          : ''}
                      </Text>
                    </>
                  )
                }
              </View>

              <Text variant="body" color="tertiary" style={{ paddingRight: Spacing.sm }}>›</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ══════════════════════════════════════════════
          Edit modal
      ══════════════════════════════════════════════ */}
      <Modal visible={!!editingDate} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text variant="h3" weight="bold">
              {editingDate ? relativeDayLabel(editingDate, {
                locale: language === 'pl' ? 'pl-PL' : 'en-US',
                today: t.days.today,
                tomorrow: t.days.tomorrow,
                yesterday: t.days.yesterday,
              }) : ''}
            </Text>
            <TouchableOpacity onPress={() => setEditingDate(null)}>
              <Text variant="body" style={{ color: Palette.primary }}>{t.common.done}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Existing shifts for this day ── */}
          {dayShifts.filter(s => s.type !== 'off').length > 0 && (
            <View style={[styles.todayShiftsSection, { borderColor: colors.border }]}>
              <Text variant="caption" weight="semibold" color="tertiary" style={styles.sectionLabel}>
                {t.schedule.modal.todaysShifts}
              </Text>
              {dayShifts.filter(s => s.type !== 'off').map(s => {
                const accent = SHIFT_COLORS[s.type] ?? Palette.shiftCustom;
                return (
                  <View key={s.id} style={[styles.shiftChip, { backgroundColor: colors.surfaceSecondary, borderColor: accent }]}>
                    <Text style={{ fontSize: 18 }}>{shiftEmoji(s.type)}</Text>
                    <View style={{ flex: 1 }}>
                      <Text variant="body" weight="semibold" style={{ color: accent }}>
                        {t.shiftTypes[s.type]?.label ?? s.type}
                      </Text>
                      <Text variant="caption" color="secondary">
                        {effectiveShiftHours(s, profile?.shiftTimeDefaults, t.schedule.dayOff)}
                        {effectiveDurationHours(s, profile?.shiftTimeDefaults) > 0
                          ? ` · ${effectiveDurationHours(s, profile?.shiftTimeDefaults)}h`
                          : ''}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        removeShift(s.id);
                        generateToday();
                        generateWeek(weekAnchor);
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.removeBtn}
                    >
                      <Text style={{ color: Palette.error, fontSize: 20, lineHeight: 20 }}>×</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* ── Add shift picker ── */}
          <Text variant="caption" weight="semibold" color="tertiary" style={styles.sectionLabel}>
            {dayShifts.filter(s => s.type !== 'off').length === 0
              ? t.schedule.modal.selectType
              : t.schedule.modal.addAnotherShift}
          </Text>

          {/* Shift-type options — compact when custom time picker is visible */}
          <ScrollView
            contentContainerStyle={styles.modalList}
            showsVerticalScrollIndicator={false}
            style={pickedType === 'custom' ? styles.optionsListCompact : styles.optionsListFull}
          >
            {visibleOptions.map(opt => (
              <SelectOption
                key={opt.value}
                label={opt.label}
                description={optionDescription(opt.value, t.shiftTypes[opt.value]?.description, profile?.shiftTimeDefaults)}
                icon={opt.icon}
                selected={pickedType === opt.value}
                onPress={() => handleTypeChange(opt.value)}
              />
            ))}
            <View style={{ height: 8 }} />
          </ScrollView>

          {/* ── Custom time picker ── */}
          {pickedType === 'custom' && (
            <View style={[styles.timeBox, { borderColor: colors.border }]}>
              <TimeTabs
                activeTab={activeTab} onTabChange={setActiveTab}
                startTime={customStart} endTime={customEnd}
                colors={colors}
                startLabel={t.settings.modal.startTime}
                endLabel={t.settings.modal.endTime}
              />
              {activeTab === 'start'
                ? <TimeWheelPicker key={`c-s-${editingDate}`} value={customStart} onChange={setCustomStart} />
                : <TimeWheelPicker key={`c-e-${editingDate}`} value={customEnd}   onChange={setCustomEnd} />
              }
              <Text variant="caption" color="tertiary" style={styles.timeHint}>
                24h · overnight
              </Text>
            </View>
          )}

          {/* Add button — only shown when something is picked */}
          {pickedType !== null && (
            <View style={styles.modalFooter}>
              <Button
                label={pickedType === 'off' ? t.schedule.modal.setDayOff : t.schedule.modal.addButton}
                fullWidth
                size="lg"
                onPress={handleAdd}
              />
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getShiftIcon(type: ShiftType): string {
  const icons: Record<ShiftType, string> = {
    morning:    '🌅',
    afternoon:  '🌆',
    night:      '🌙',
    long_day:   '☀️',
    long_night: '🌃',
    extended:   '🔄',
    off:        '🏖️',
    custom:     '⚙️',
  };
  return icons[type] ?? '📋';
}

function optionDescription(
  type: ShiftType,
  fallback: string | undefined,
  shiftTimeDefaults: import('@/types').ShiftTimeDefaults | undefined,
): string | undefined {
  if (type === 'off' || type === 'custom' || type === 'extended') return fallback;
  const times     = getEffectiveShiftTimes(type, shiftTimeDefaults);
  const hasOverride = !!(shiftTimeDefaults?.[type]);
  return `${hasOverride ? '' : '~'}${times.startTime} – ${times.endTime}`;
}

function effectiveShiftHours(
  shift: ShiftEntry,
  shiftTimeDefaults: import('@/types').ShiftTimeDefaults | undefined,
  dayOffLabel = 'Day off',
): string {
  if (shift.type === 'off')    return dayOffLabel;
  if (shift.type === 'custom' || shift.type === 'extended') return formatShiftHours(shift);
  const times = getEffectiveShiftTimes(shift.type, shiftTimeDefaults);
  return `${times.startTime || shift.startTime || '?'} – ${times.endTime || shift.endTime || '?'}`;
}

function effectiveDurationHours(
  shift: ShiftEntry,
  shiftTimeDefaults: import('@/types').ShiftTimeDefaults | undefined,
): number {
  if (shift.type === 'off')    return 0;
  if (shift.type === 'extended') return shift.durationHours ?? 0;
  if (shift.type === 'custom')   return shiftDurationHours(shift);
  const times = getEffectiveShiftTimes(shift.type, shiftTimeDefaults);
  if (!times.startTime || !times.endTime) return 0;
  const [sh, sm] = times.startTime.split(':').map(Number);
  const [eh, em] = times.endTime.split(':').map(Number);
  const startMin = sh * 60 + sm;
  const endMin   = eh * 60 + em;
  const diff     = endMin >= startMin ? endMin - startMin : 1440 - startMin + endMin;
  return Math.round((diff / 60) * 10) / 10;
}

function TimeTabs({
  activeTab, onTabChange, startTime, endTime, colors, startLabel, endLabel,
}: {
  activeTab: 'start' | 'end';
  onTabChange: (t: 'start' | 'end') => void;
  startTime: string;
  endTime: string;
  colors: any;
  startLabel: string;
  endLabel: string;
}) {
  return (
    <View style={[tabStyles.tabs, { backgroundColor: colors.surfaceSecondary }]}>
      {(['start', 'end'] as const).map(tab => {
        const active = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={[tabStyles.tab, active && { backgroundColor: colors.background }]}
            onPress={() => onTabChange(tab)}
            activeOpacity={0.7}
          >
            <Text variant="bodySmall" weight={active ? 'semibold' : 'regular'}
              style={{ color: active ? colors.text : colors.textSecondary }}>
              {tab === 'start' ? startLabel : endLabel}
            </Text>
            <Text variant="caption" style={{ color: active ? Palette.primary : colors.textTertiary }}>
              {tab === 'start' ? startTime : endTime}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    gap: 1,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  importBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  navBtn: { padding: Spacing.sm },
  list: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    minHeight: 64,
    paddingVertical: Spacing.sm,
  },
  datePill: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    alignSelf: 'stretch',
    gap: 2,
  },
  // Modal
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    paddingTop: Spacing.xl,
  },
  // Existing shifts section
  todayShiftsSection: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    paddingBottom: Spacing.sm,
  },
  sectionLabel: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  shiftChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.sm,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  removeBtn: {
    padding: Spacing.xs,
  },
  // Shift type picker
  modalList: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  optionsListFull: { flex: 1 },
  optionsListCompact: { maxHeight: 210 },
  // Custom time box
  timeBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.xs,
  },
  timeHint: {
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  // Add button
  modalFooter: {
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
});
