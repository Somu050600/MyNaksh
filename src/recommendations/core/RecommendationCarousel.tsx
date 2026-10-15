import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { CARD_GAP, CARD_WIDTH } from './CardShell';
import { GenericCard } from './GenericCard';
import { useRecommendationContext } from './RecommendationProvider';
import type { RecommendationBase } from './types';

interface Props {
  messageId: string;
  items: RecommendationBase[];
}

const ITEM_SPAN = CARD_WIDTH + CARD_GAP;

const keyExtractor = (item: RecommendationBase) => `${item.type}:${item.id}`;

const getItemLayout = (_: unknown, index: number) => ({
  length: ITEM_SPAN,
  offset: ITEM_SPAN * index,
  index,
});

const Separator = () => <View style={styles.separator} />;

/**
 * Horizontal snap list. Knows nothing about individual types: each item is
 * resolved through the registry, with GenericCard as the safety net.
 */
export function RecommendationCarousel({ messageId, items }: Props) {
  const { registry, onPress } = useRecommendationContext();

  const renderItem = useCallback<ListRenderItem<RecommendationBase>>(
    ({ item }) => {
      const Card = registry.resolve(item.type)?.Card ?? GenericCard;
      return <Card item={item} onPress={onPress} />;
    },
    [registry, onPress],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <FlatList
      testID={`recommendations-${messageId}`}
      horizontal
      data={items}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      ItemSeparatorComponent={Separator}
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_SPAN}
      decelerationRate="fast"
      contentContainerStyle={styles.content}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 0 },
  content: { paddingVertical: 2 },
  separator: { width: CARD_GAP },
});
