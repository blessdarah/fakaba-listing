import * as Haptics from "expo-haptics";
import { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { useTheme } from "theme";

const THUMB = 28;

type RangeSliderProps = {
  min: number;
  max: number;
  step: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  accessibilityLabel?: string;
};

/** Two-thumb slider built on PanResponder (no extra native deps, works in Expo Go). */
export function RangeSlider({ min, max, step, low, high, onChange, accessibilityLabel }: RangeSliderProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const span = Math.max(max - min, step);
  const usable = Math.max(width - THUMB, 1);

  const toX = (v: number) => ((v - min) / span) * usable;
  const toValue = (x: number) => {
    const raw = min + (Math.min(Math.max(x, 0), usable) / usable) * span;
    return Math.round(raw / step) * step;
  };

  // Keep latest values reachable from the responders without recreating them.
  const live = useRef({ low, high, width, toValue, toX, onChange });
  live.current = { low, high, width, toValue, toX, onChange };

  const makeResponder = (which: "low" | "high") => {
    let startX = 0;
    let last = 0;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const s = live.current;
        startX = s.toX(which === "low" ? s.low : s.high);
        last = which === "low" ? s.low : s.high;
      },
      onPanResponderMove: (_, g) => {
        const s = live.current;
        let v = s.toValue(startX + g.dx);
        if (which === "low") v = Math.min(v, s.high - step);
        else v = Math.max(v, s.low + step);
        if (v !== last) {
          last = v;
          Haptics.selectionAsync().catch(() => {});
          which === "low" ? s.onChange(v, s.high) : s.onChange(s.low, v);
        }
      },
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lowResponder = useMemo(() => makeResponder("low"), [step]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const highResponder = useMemo(() => makeResponder("high"), [step]);

  const lowX = toX(low);
  const highX = toX(high);

  return (
    <View
      style={styles.wrap}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={[styles.track, { backgroundColor: colors.line }]} />
      {width > 0 && (
        <>
          <View
            style={[styles.fill, { left: lowX + THUMB / 2, width: Math.max(highX - lowX, 0), backgroundColor: colors.ink }]}
          />
          <View
            {...lowResponder.panHandlers}
            hitSlop={12}
            accessibilityRole="adjustable"
            style={[styles.thumb, { left: lowX, backgroundColor: colors.bg, borderColor: colors.ink }]}
          />
          <View
            {...highResponder.panHandlers}
            hitSlop={12}
            accessibilityRole="adjustable"
            style={[styles.thumb, { left: highX, backgroundColor: colors.bg, borderColor: colors.ink }]}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: THUMB + 8 },
  track: { position: "absolute", top: (THUMB + 8) / 2 - 1.5, left: THUMB / 2, right: THUMB / 2, height: 3, borderRadius: 2 },
  fill: { position: "absolute", top: (THUMB + 8) / 2 - 1.5, height: 3, borderRadius: 2 },
  thumb: {
    position: "absolute",
    top: 4,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 2,
  },
});
