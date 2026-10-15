import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, spacing } from '../../../../shared/theme';
import type { GroupPos } from '../../model/buildTimeline';

const ROUND = 18;
const JOINED = 5;
const TAIL = 6;

interface Props {
  align: 'left' | 'right';
  backgroundColor: string;
  groupPos: GroupPos;
  children: ReactNode;
}

/** Rounded bubble whose corners tighten where it joins its neighbours in a group. */
export function BubbleFrame({
  align,
  backgroundColor,
  groupPos,
  children,
}: Props) {
  const joinsAbove = groupPos === 'middle' || groupPos === 'last';
  const joinsBelow = groupPos === 'first' || groupPos === 'middle';
  const top = joinsAbove ? JOINED : ROUND;
  const bottom = joinsBelow ? JOINED : TAIL;

  const corners: ViewStyle =
    align === 'right'
      ? { borderTopRightRadius: top, borderBottomRightRadius: bottom }
      : { borderTopLeftRadius: top, borderBottomLeftRadius: bottom };

  return (
    <View style={[styles.bubble, { backgroundColor }, corners]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '84%',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: ROUND,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
