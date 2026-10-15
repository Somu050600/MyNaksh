import React, { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { colors, radius, spacing } from '../theme';
import { PressableScale } from './PressableScale';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** Modal bottom sheet with a dimmed backdrop; backdrop tap and Android back both close it. */
export function BottomSheet({ visible, onClose, title, children }: SheetProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View entering={FadeIn.duration(150)} style={styles.backdrop}>
        <Pressable
          accessibilityLabel="Close"
          accessibilityRole="button"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <Animated.View
          entering={SlideInDown.duration(220)}
          style={styles.sheet}
        >
          <View style={styles.grabber} />
          {title ? (
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
          ) : null}
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

interface SheetButtonProps {
  label: string;
  emoji?: string;
  destructive?: boolean;
  onPress: () => void;
}

export function SheetButton({
  label,
  emoji,
  destructive = false,
  onPress,
}: SheetButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.button}
    >
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={[styles.buttonLabel, destructive && styles.destructive]}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  emoji: { fontSize: 18 },
  buttonLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  destructive: { color: colors.danger },
});
