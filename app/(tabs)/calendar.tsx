import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useScheduleStore } from '@/store/scheduleStore';
import { useWeeklyPlan } from '@/hooks/usePlan';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/i18n';
import {
  isToday,
  offsetDate,
  parseTime,
  todayISO,
  weekDates,
} from '@/utils/time';
import { shiftEmoji } from '@/utils/format';
import { Analytics } from '@/services/analytics';
import type { ShiftEntry, ShiftType } from '@/types';

// ─── Layout constants ─────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const TIME_COL_W  = 40;                        // time-label column width
const COL_W       = (SCREEN_W - TIME_COL_W) / 7;
const BLOCK_PAD   = 2;
const MIN_BLOCK_H = 6;

// Only label every 3 hours to keep the grid uncluttered
const MAJOR_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

// ─── Shift colours ────────────────────────────────────────────────────────────

const SHIFT_COLOR: Record<ShiftType, string> = {
  morning:    Palette.shiftMorning,
  afternoon:  Palette.shiftAfternoon,
  night:      Palette.shiftNight,
  long_day:   Palette.shiftLongDay,
  long_night: Palette.shiftLongNight,
  extended:   '#4338CA',
  off:        Palette.shiftOff,
  custom:     Palette.shiftCustom,
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Segment {
  shift: ShiftEntry;
  startMin: number;     // 0 – 1440
  endMin:   number;     // always > startMin, capped at 1440
  isContinuation: boolean;
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** Build a map of ISO-date → Segment[] for all 7 dates in the visible week. */
function buildSegments(
  shifts: ShiftEntry[],
  dates: string[],
): Map<string, Segment[]> {
  const dateSet  = new Set(dates);
  const map      = new Map<string, Segment[]>();
  for (const d of dates) map.set(d, []);

  // Include day before the week so night shifts that bleed in are captured.
  const lookback = new Set([...dates, offsetDate(dates[0], -1)]);
  const relevant = shifts.filter(
    s => lookback.has(s.date) && s.type !== 'off',
  );

  for (const shift of relevant) {
    const startMin = parseTime(shift.startTime ?? '00:00');

    let rawEnd: number;
    if (shift.endTime) {
      const parsed = parseTime(shift.endTime);
      rawEnd = parsed <= startMin ? parsed + 1440 : parsed;
    } else if (shift.durationHours) {
      rawEnd = startMin + Math.min(shift.durationHours * 60, 48 * 60);
    } else {
      rawEnd = startMin + 480;
    }

    let remaining = rawEnd - startMin;
    let segStart  = startMin;
    let dayOffset = 0;

    while (remaining > 0 && dayOffset <= 3) {
      const segDate = offsetDate(shift.date, dayOffset);
      const segEnd  = Math.min(segStart + remaining, 1440);
      const dur     = segEnd - segStart;

      if (dateSet.has(segDate) && dur > 0) {
        map.get(segDate)!.push({
          shift,
          startMin: segStart,
          endMin:   segEnd,
          isContinuation: dayOffset > 0,
        });
      }

      remaining -= dur;
      segStart   = 0;
      dayOffset++;
    }
  }

  return map;
}

function hourLabel(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

function compactTime(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ─── ShiftBlock ───────────────────────────────────────────────────────────────

interface ShiftBlockProps {
  seg:    Segment;
  colIdx: number;
  isDark: boolean;
  minH:   number;  // px per minute — computed dynamically from grid height
}

const ShiftBlock = React.memo(function ShiftBlock({
  seg,
  colIdx,
  isDark,
  minH,
}: ShiftBlockProps) {
  const { shift, startMin, endMin, isContinuation } = seg;
  const type    = shift.type;
  const color   = SHIFT_COLOR[type] ?? Palette.shiftCustom;
  const blockH  = Math.max(MIN_BLOCK_H, (endMin - startMin) * minH - BLOCK_PAD * 2);
  const bgAlpha = isDark ? '33' : '18';
  const bg      = `${color}${bgAlpha}`;

  const left = colIdx * COL_W + BLOCK_PAD;
  const width = COL_W - BLOCK_PAD * 2;
  const top   = startMin * minH + BLOCK_PAD;

  const showEmoji = blockH >= 16;
  const showTime  = blockH >= 38;

  const emoji      = shiftEmoji(type);
  const startLabel = compactTime(startMin);
  const endLabel   = compactTime(endMin === 1440 ? 0 : endMin);
  const timeStr    = `${startLabel}–${endLabel}`;

  return (
    <View
      style={[
        styles.block,
        {
          top,
          left,
          width,
          height: blockH,
          backgroundColor: bg,
          borderLeftColor: color,
          borderTopLeftRadius:     isContinuation ? 0 : Radius.sm,
          borderBottomLeftRadius:  endMin === 1440 ? 0 : Radius.sm,
          borderTopRightRadius:    isContinuation ? 0 : Radius.sm,
          borderBottomRightRadius: endMin === 1440 ? 0 : Radius.sm,
        },
      ]}
    >
      {showEmoji && (
        <Text style={[styles.blockEmoji, { color }]}>{emoji}</Text>
      )}
      {showTime && (
        <Text style={[styles.blockTime, { color }]} numberOfLines={1}>
          {timeStr}
        </Text>
      )}
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CalendarScreen() {
  const insets              = useSafeAreaInsets();
  const { colors, isDark }  = useColorScheme();
  const { t, language }     = useTranslation();
  const shifts              = useScheduleStore(s => s.shifts);
  const [weekAnchor, setWeekAnchor] = useState(todayISO());
  const [currentMin, setCurrentMin] = useState(nowMinutes);

  // The grid container height measured via onLayout — used to fit 24h exactly on screen.
  const [gridH, setGridH] = useState(0);
  const hourH = gridH > 0 ? gridH / 24 : 1;
  const minH  = hourH / 60;

  const ct = t.calendar;

  React.useEffect(() => {
    Analytics.screen('calendar');
  }, []);

  // Tick every 60 s to keep the current-time indicator live
  useEffect(() => {
    const id = setInterval(() => setCurrentMin(nowMinutes()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dates = useMemo(() => weekDates(weekAnchor), [weekAnchor]);
  const locale = language === 'pl' ? 'pl-PL' : 'en-US';

  const isCurrentWeek = useMemo(
    () => dates.includes(todayISO()),
    [dates],
  );

  // Build segments — stats are derived from the same data the grid renders.
  const segmentsByDate = useMemo(
    () => buildSegments(shifts, dates),
    [shifts, dates],
  );

  // ── Week-at-a-glance stats ─────────────────────────────────────────────────
  const nightCount = useMemo(
    () => dates.filter(d =>
      (segmentsByDate.get(d) ?? []).some(
        seg => !seg.isContinuation &&
               (seg.shift.type === 'night' || seg.shift.type === 'long_night'),
      )
    ).length,
    [segmentsByDate, dates],
  );

  const offCount = useMemo(
    () => dates.filter(d =>
      (segmentsByDate.get(d) ?? []).filter(seg => !seg.isContinuation).length === 0
    ).length,
    [segmentsByDate, dates],
  );

  const { plans } = useWeeklyPlan();
  const avgEnergy = useMemo(
    () => isCurrentWeek && plans.length > 0
      ? Math.round(plans.reduce((sum, p) => sum + p.energyScore, 0) / plans.length)
      : null,
    [plans, isCurrentWeek],
  );

  const hasAnyShift = useMemo(
    () => dates.some(d => (segmentsByDate.get(d)?.length ?? 0) > 0),
    [segmentsByDate, dates],
  );

  const goBack  = useCallback(() => setWeekAnchor(a => offsetDate(a, -7)), []);
  const goFwd   = useCallback(() => setWeekAnchor(a => offsetDate(a, +7)), []);
  const goToday = useCallback(() => setWeekAnchor(todayISO()), []);

  // Horizontal swipe → week navigation
  const swipePan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
      onPanResponderRelease: (_, gs) => {
        if      (gs.dx < -60) setWeekAnchor(a => offsetDate(a, +7));
        else if (gs.dx >  60) setWeekAnchor(a => offsetDate(a, -7));
      },
    }),
  ).current;

  // Week range label
  const weekLabel = useMemo(() => {
    const first = new Date(dates[0] + 'T12:00:00');
    const last  = new Date(dates[6] + 'T12:00:00');
    const fDay  = first.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    const lDay  = last.toLocaleDateString(locale,  { day: 'numeric', month: 'short', year: 'numeric' });
    return `${fDay} – ${lDay}`;
  }, [dates, locale]);

  const onGridLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setGridH(h);
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]} {...swipePan.panHandlers}>

      {/* ── Top header (fixed height — Today pill lives inside navRow) ── */}
      <View style={[
        styles.topHeader,
        {
          paddingTop: insets.top + Spacing.sm,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}>

        {/* Week navigation row — Today pill replaces forward-chevron space so height never changes */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={goBack} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>

          <Text variant="bodySmall" weight="semibold" style={[styles.weekLabel, { color: colors.text }]}>
            {weekLabel}
          </Text>

          {/* Today pill in-row — same space as fwd chevron so header never grows */}
          {!isCurrentWeek ? (
            <TouchableOpacity
              onPress={goToday}
              style={[styles.todayPill, { borderColor: Palette.primary }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text variant="caption" weight="semibold" style={{ color: Palette.primary }}>
                {ct.today}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navBtn} />
          )}

          <TouchableOpacity onPress={goFwd} style={styles.navBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* ── Week-at-a-glance strip ── */}
        <View style={[styles.statsStrip, { borderBottomColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: Palette.shiftNight }]}>{nightCount}</Text>
            <Text style={[styles.statLbl, { color: colors.textTertiary }]}>{t.weekly.summary.nightShifts}</Text>
          </View>
          <View style={[styles.statItem, styles.statItemBorder, { borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: Palette.shiftOff }]}>{offCount}</Text>
            <Text style={[styles.statLbl, { color: colors.textTertiary }]}>{t.weekly.summary.restDays}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[
              styles.statNum,
              { color: avgEnergy === null ? colors.textTertiary
                       : avgEnergy >= 65  ? Palette.success
                       : avgEnergy >= 40  ? Palette.warning
                                          : Palette.error },
            ]}>
              {avgEnergy ?? '–'}
            </Text>
            <Text style={[styles.statLbl, { color: colors.textTertiary }]}>{t.weekly.summary.avgEnergy}</Text>
          </View>
        </View>

        {/* ── Day header row ── */}
        <View style={[styles.dayHeaderRow, { borderBottomColor: colors.border }]}>
          <View style={{ width: TIME_COL_W }} />
          {dates.map(date => {
            const today    = isToday(date);
            const d        = new Date(date + 'T12:00:00');
            const dayAbbr  = d.toLocaleDateString(locale, { weekday: 'short' })
                              .replace('.', '')
                              .toUpperCase()
                              .slice(0, 3);
            const dayNum   = d.getDate();
            const hasShifts = (segmentsByDate.get(date)?.length ?? 0) > 0;

            return (
              <View key={date} style={[styles.dayHeader, { width: COL_W }]}>
                <Text style={[styles.dayAbbr, { color: today ? Palette.primary : colors.textSecondary }]}>
                  {dayAbbr}
                </Text>
                <View style={[styles.dayNumCircle, today && { backgroundColor: Palette.primary }]}>
                  <Text style={[styles.dayNum, { color: today ? '#fff' : colors.text }]}>
                    {dayNum}
                  </Text>
                </View>
                {hasShifts && !today && (
                  <View style={[styles.shiftDot, { backgroundColor: colors.textTertiary }]} />
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Grid area — flex: 1 fills exactly what's left, no scrolling ── */}
      {hasAnyShift ? (
        <View style={styles.gridContainer} onLayout={onGridLayout}>
          {gridH > 0 && (
            <View style={{ flexDirection: 'row', flex: 1 }}>

              {/* Time labels column */}
              <View style={{ width: TIME_COL_W, position: 'relative' }}>
                {MAJOR_HOURS.map(h => (
                  <View
                    key={h}
                    style={{
                      position: 'absolute',
                      top: h * hourH - 7,
                      left: 0,
                      width: TIME_COL_W,
                      alignItems: 'flex-end',
                      paddingRight: 5,
                    }}
                  >
                    <Text style={[styles.timeLabel, { color: colors.textTertiary }]}>
                      {hourLabel(h)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Grid: hour lines + column separators + shift blocks */}
              <View style={{ flex: 1, position: 'relative' }}>

                {/* Hour lines (one per hour) */}
                {Array.from({ length: 25 }, (_, h) => (
                  <View
                    key={h}
                    style={[
                      styles.hourLine,
                      {
                        top: h * hourH,
                        borderColor: h % 3 === 0 ? colors.border : colors.borderLight,
                        borderBottomWidth: h % 3 === 0
                          ? StyleSheet.hairlineWidth * 1.5
                          : StyleSheet.hairlineWidth,
                      },
                    ]}
                  />
                ))}

                {/* Today column highlight */}
                {isCurrentWeek && dates.map((date, i) => isToday(date) && (
                  <View
                    key={date}
                    style={[
                      styles.todayColBg,
                      {
                        left: i * COL_W,
                        width: COL_W,
                        backgroundColor: isDark
                          ? `${Palette.primary}0D`
                          : `${Palette.primary}07`,
                      },
                    ]}
                  />
                ))}

                {/* Vertical column separators */}
                {dates.map((_, i) => i > 0 && (
                  <View
                    key={i}
                    style={[styles.colSep, { left: i * COL_W, backgroundColor: colors.border }]}
                  />
                ))}

                {/* Shift blocks */}
                {dates.map((date, colIdx) =>
                  segmentsByDate.get(date)?.map((seg, j) => (
                    <ShiftBlock
                      key={`${colIdx}-${seg.shift.id}-${j}`}
                      seg={seg}
                      colIdx={colIdx}
                      isDark={isDark}
                      minH={minH}
                    />
                  )),
                )}

                {/* Current-time line (current week only) */}
                {isCurrentWeek && (
                  <>
                    <View
                      style={[
                        styles.nowLine,
                        { top: currentMin * minH, backgroundColor: Palette.error },
                      ]}
                    />
                    <View
                      style={[
                        styles.nowDot,
                        { top: currentMin * minH - 4, backgroundColor: Palette.error },
                      ]}
                    />
                  </>
                )}
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text variant="h3" weight="semibold" center style={{ color: colors.text, marginTop: Spacing.md }}>
            {ct.noShifts}
          </Text>
          <Text variant="body" color="secondary" center style={{ marginTop: Spacing.sm, paddingHorizontal: Spacing['2xl'] }}>
            {ct.noShiftsDesc}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  // ── Header ──
  topHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  navBtn: {
    padding: Spacing.sm,
    width: 36,
    alignItems: 'center',
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
  },
  todayPill: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    minWidth: 36,
    alignItems: 'center',
  },

  // ── Stats strip ──
  statsStrip: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  statItemBorder: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  statNum: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    lineHeight: 20,
  },
  statLbl: {
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
    lineHeight: 11,
  },

  // ── Day header row ──
  dayHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayHeader: {
    alignItems: 'center',
    paddingVertical: 3,
    gap: 1,
  },
  dayAbbr: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  dayNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  shiftDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // ── Grid ──
  gridContainer: {
    flex: 1,
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0,
  },
  todayColBg: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  colSep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
  },

  // ── Shift block ──
  block: {
    position: 'absolute',
    borderLeftWidth: 3,
    borderRadius: Radius.sm,
    paddingHorizontal: 3,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  blockEmoji: {
    fontSize: 10,
    lineHeight: 13,
  },
  blockTime: {
    fontSize: 9,
    fontFamily: 'Inter_500Medium',
    lineHeight: 11,
    marginTop: 1,
  },

  // ── Current time ──
  nowLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    zIndex: 10,
  },
  nowDot: {
    position: 'absolute',
    left: -4,
    width: 9,
    height: 9,
    borderRadius: 5,
    zIndex: 10,
  },

  // ── Empty state ──
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyEmoji: {
    fontSize: 52,
    lineHeight: 65,
  },

  timeLabel: {
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
  },
});
