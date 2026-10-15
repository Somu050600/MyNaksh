import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { alertOnPress, defaultRegistry, RecommendationBase } from '../..';

const TYPES = ['gemstone', 'tarot', 'consultation', 'article', 'promotion'];

describe('built-in recommendations', () => {
  it.each(TYPES)('registers %s', type => {
    expect(defaultRegistry.has(type)).toBe(true);
  });

  it.each(TYPES)(
    '%s card renders title + subtitle and reports presses',
    type => {
      const item: RecommendationBase = {
        id: '1',
        type,
        title: `Title for ${type}`,
        subtitle: `Subtitle for ${type}`,
      };
      const onPress = jest.fn();
      const Card = defaultRegistry.resolve(type)!.Card;
      const { getByText, getByRole } = render(
        <Card item={item} onPress={onPress} />,
      );

      expect(getByText(item.title)).toBeTruthy();
      expect(getByText(item.subtitle!)).toBeTruthy();
      fireEvent.press(getByRole('button'));
      expect(onPress).toHaveBeenCalledWith(item);
    },
  );
});

describe('alertOnPress', () => {
  it('shows the item in an Alert', () => {
    const spy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    alertOnPress({ id: '1', type: 'tarot', title: 'Career Tarot Reading' });
    expect(spy).toHaveBeenCalledWith('Career Tarot Reading', 'Open tarot');
    spy.mockRestore();
  });
});
