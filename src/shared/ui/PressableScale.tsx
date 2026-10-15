import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 18, stiffness: 260, mass: 0.6 } as const;

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Scale applied while pressed. */
  scaleTo?: number;
}

/** Pressable that springs down slightly while pressed. Runs on the UI thread. */
export function PressableScale({
  style,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={e => {
        scale.value = withSpring(scaleTo, SPRING);
        onPressIn?.(e);
      }}
      onPressOut={e => {
        scale.value = withSpring(1, SPRING);
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    />
  );
}
