/**
 * TimeWheelPicker — drum-roll style time picker.
 *
 * Performance strategy
 * ─────────────────────
 * REPEAT = 3 → only 252 items total (72 hours + 180 minutes).
 * After every scroll-snap we silently re-centre to the middle repetition,
 * so the user never hits an edge yet we never render more than 252 Views.
 *
 * Animation runs entirely on the native thread (useNativeDriver: true).
 */

import React, { useRef, useCallback, memo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_HEIGHT   = 56;
const SIDE_ITEMS    = 2;
const VISIBLE_ITEMS = SIDE_ITEMS * 2 + 1;          // 5
export const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 280 px — exported for layout use

/** Small repeat keeps item count low: 24×3=72 hours, 60×3=180 minutes */
const REPEAT        = 3;
const CENTER_REP    = 1; // index of the "middle" repetition

// ─── WheelItem ────────────────────────────────────────────────────────────────

interface WheelItemProps {
  label        : string;
  absoluteIndex: number;
  scrollAnim   : Animated.Value;
  textColor    : string;
}

const WheelItem = memo(function WheelItem({
  label, absoluteIndex, scrollAnim, textColor,
}: WheelItemProps) {
  const c = absoluteIndex * ITEM_HEIGHT;

  const opacity = scrollAnim.interpolate({
    inputRange : [c - 2.5 * ITEM_HEIGHT, c - 1.1 * ITEM_HEIGHT, c, c + 1.1 * ITEM_HEIGHT, c + 2.5 * ITEM_HEIGHT],
    outputRange: [0.07, 0.34, 1, 0.34, 0.07],
    extrapolate: 'clamp',
  });

  const scale = scrollAnim.interpolate({
    inputRange : [c - 2 * ITEM_HEIGHT, c, c + 2 * ITEM_HEIGHT],
    outputRange: [0.72, 1.08, 0.72],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.item, { opacity, transform: [{ scale }] }]}>
      <Text style={[styles.itemText, { color: textColor }]}>{label}</Text>
    </Animated.View>
  );
});

// ─── WheelColumn ──────────────────────────────────────────────────────────────

interface WheelColumnProps {
  values    : string[];
  selected  : number;
  onSelect  : (idx: number) => void;
  textColor : string;
}

function WheelColumn({ values, selected, onSelect, textColor }: WheelColumnProps) {
  const count         = values.length;
  const initialIndex  = CENTER_REP * count + selected;
  const initialOffset = initialIndex * ITEM_HEIGHT;

  const scrollAnim = useRef(new Animated.Value(initialOffset)).current;
  const scrollRef  = useRef<ScrollView>(null);

  // Position the ScrollView at the correct offset after first layout
  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: initialOffset, animated: false });
    }, 60);
    return () => clearTimeout(t);
  }, [initialOffset]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollAnim } } }],
    { useNativeDriver: true },
  );

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y        = e.nativeEvent.contentOffset.y;
      const rawIndex = Math.round(y / ITEM_HEIGHT);
      const repIndex = Math.floor(rawIndex / count);
      const index    = ((rawIndex % count) + count) % count;

      onSelect(index);

      // Silently re-centre so the user never scrolls off the edge
      if (repIndex !== CENTER_REP) {
        const centred = (CENTER_REP * count + index) * ITEM_HEIGHT;
        scrollRef.current?.scrollTo({ y: centred, animated: false });
        scrollAnim.setValue(centred);
      }
    },
    [count, onSelect, scrollAnim],
  );

  // Build the small repeated item list
  const items = Array.from({ length: count * REPEAT }, (_, i) => ({
    key          : String(i),
    label        : values[i % count],
    absoluteIndex: i,
  }));

  return (
    <View style={styles.column}>
      <Animated.ScrollView
        // @ts-ignore – Animated.ScrollView forwards scrollTo via its internal ref
        ref={scrollRef}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={onScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * SIDE_ITEMS }}
      >
        {items.map(item => (
          <WheelItem
            key={item.key}
            label={item.label}
            absoluteIndex={item.absoluteIndex}
            scrollAnim={scrollAnim}
            textColor={textColor}
          />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

// ─── TimeWheelPicker ──────────────────────────────────────────────────────────

export interface TimeWheelPickerProps {
  value   : string; // "HH:MM" 24-hour
  onChange: (value: string) => void;
}

export function TimeWheelPicker({ value, onChange }: TimeWheelPickerProps) {
  const { colors } = useColorScheme();

  const parts  = value.split(':');
  const hour   = Math.min(23, Math.max(0, parseInt(parts[0] ?? '0', 10) || 0));
  const minute = Math.min(59, Math.max(0, parseInt(parts[1] ?? '0', 10) || 0));

  const hours   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const onHour = useCallback(
    (h: number) => onChange(`${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`),
    [minute, onChange],
  );
  const onMin = useCallback(
    (m: number) => onChange(`${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`),
    [hour, onChange],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Thin selection-highlight lines at the centre row */}
      <View
        pointerEvents="none"
        style={[
          styles.selectionBar,
          { top: ITEM_HEIGHT * SIDE_ITEMS, borderColor: 'rgba(255,255,255,0.16)' },
        ]}
      />

      <WheelColumn values={hours}   selected={hour}   onSelect={onHour} textColor={colors.text} />
      <View style={styles.colonWrap}>
        <Text style={[styles.colonText, { color: colors.text }]}>:</Text>
      </View>
      <WheelColumn values={minutes} selected={minute} onSelect={onMin}  textColor={colors.text} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flexDirection : 'row',
    alignItems    : 'center',
    justifyContent: 'center',
    height        : WHEEL_HEIGHT,
    overflow      : 'hidden',
  },
  column: {
    width   : 90,
    height  : WHEEL_HEIGHT,
    overflow: 'hidden',
  },
  item: {
    height        : ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems    : 'center',
  },
  itemText: {
    fontSize   : 36,
    fontFamily : 'Inter_400Regular',
    fontVariant: ['tabular-nums'],
  },
  colonWrap: {
    width         : 26,
    alignItems    : 'center',
    justifyContent: 'center',
    paddingBottom : 4,
  },
  colonText: {
    fontSize  : 32,
    fontFamily: 'Inter_400Regular',
  },
  selectionBar: {
    position         : 'absolute',
    left             : 14,
    right            : 14,
    height           : ITEM_HEIGHT,
    borderTopWidth   : StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
