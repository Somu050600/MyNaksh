import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import {
  createRegistry,
  defineRecommendation,
  RecommendationBase,
  RecommendationCardProps,
  RecommendationCarousel,
  RecommendationProvider,
} from '..';

type DemoRecommendation = RecommendationBase & { type: 'demo' };

function DemoCard({
  item,
  onPress,
}: RecommendationCardProps<DemoRecommendation>) {
  return (
    <Pressable testID={`demo-${item.id}`} onPress={() => onPress(item)}>
      <Text>demo:{item.title}</Text>
    </Pressable>
  );
}

const demoDef = defineRecommendation<DemoRecommendation>({
  type: 'demo',
  Card: DemoCard,
});

function renderCarousel(
  items: RecommendationBase[],
  onPress: jest.Mock = jest.fn(),
) {
  const utils = render(
    <RecommendationProvider
      registry={createRegistry([demoDef])}
      onPress={onPress}
    >
      <RecommendationCarousel messageId="m1" items={items} />
    </RecommendationProvider>,
  );
  return { ...utils, onPress };
}

describe('createRegistry', () => {
  it('resolves registered definitions and returns undefined for unknown types', () => {
    const registry = createRegistry([demoDef]);
    expect(registry.resolve('demo')).toBe(demoDef);
    expect(registry.has('demo')).toBe(true);
    expect(registry.resolve('nope')).toBeUndefined();
    expect(registry.has('nope')).toBe(false);
  });

  it('supports registering after creation and overriding an existing type', () => {
    const registry = createRegistry();
    registry.register(demoDef);
    expect(registry.resolve('demo')).toBe(demoDef);

    const override = defineRecommendation<DemoRecommendation>({
      type: 'demo',
      Card: DemoCard,
    });
    registry.register(override);
    expect(registry.resolve('demo')).toBe(override);
  });
});

describe('RecommendationCarousel', () => {
  it('renders one registered card per item', () => {
    const { getByText } = renderCarousel([
      { id: '1', type: 'demo', title: 'One' },
      { id: '2', type: 'demo', title: 'Two' },
    ]);
    expect(getByText('demo:One')).toBeTruthy();
    expect(getByText('demo:Two')).toBeTruthy();
  });

  it('falls back to the generic card for unknown types instead of crashing', () => {
    const { getByText } = renderCarousel([
      {
        id: '9',
        type: 'horoscope',
        title: 'Daily Horoscope',
        subtitle: 'Aries',
      },
    ]);
    expect(getByText('Daily Horoscope')).toBeTruthy();
    expect(getByText('Aries')).toBeTruthy();
    expect(getByText('Horoscope')).toBeTruthy();
  });

  it('renders nothing for an empty list', () => {
    const { toJSON } = renderCarousel([]);
    expect(toJSON()).toBeNull();
  });

  it('calls the provider onPress with the pressed item', () => {
    const item = { id: '1', type: 'demo', title: 'One' };
    const { getByTestId, onPress } = renderCarousel([item]);
    fireEvent.press(getByTestId('demo-1'));
    expect(onPress).toHaveBeenCalledWith(item);
  });

  it('keeps items with the same id but different types', () => {
    const { getByText } = renderCarousel([
      { id: '1', type: 'demo', title: 'Demo one' },
      { id: '1', type: 'other', title: 'Other one' },
    ]);
    expect(getByText('demo:Demo one')).toBeTruthy();
    expect(getByText('Other one')).toBeTruthy();
  });
});
