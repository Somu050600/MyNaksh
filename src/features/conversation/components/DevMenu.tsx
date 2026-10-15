import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { BottomSheet, SheetButton } from '../../../shared/ui/BottomSheet';
import { colors, spacing } from '../../../shared/theme';
import type { Scenario } from '../api/types';
import { conversationStore, mockApi } from '../store/instance';

const SCENARIOS: Array<{ scenario: Scenario; label: string; emoji: string }> = [
  { scenario: 'ok', label: 'Reload: normal conversation', emoji: '✅' },
  { scenario: 'empty', label: 'Reload: empty conversation', emoji: '🫥' },
  { scenario: 'error', label: 'Reload: network failure', emoji: '📡' },
];

/** Header button for demos: forces a reload under a chosen mock scenario. */
export function DevMenuButton() {
  const [open, setOpen] = useState(false);

  const reload = (scenario: Scenario) => {
    mockApi.setScenario(scenario);
    setOpen(false);
    conversationStore.getState().load();
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Demo scenarios"
        hitSlop={10}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.icon}>⚙︎</Text>
      </Pressable>
      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Demo scenarios"
      >
        {SCENARIOS.map(({ scenario, label, emoji }) => (
          <SheetButton
            key={scenario}
            label={label}
            emoji={emoji}
            onPress={() => reload(scenario)}
          />
        ))}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  icon: { fontSize: 22, color: colors.primary, paddingHorizontal: spacing.sm },
});
