import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import {
  alertOnPress,
  defaultRegistry,
  RecommendationProvider,
} from '../../../../recommendations';
import { conversationStore } from '../../store/instance';
import { seedStore } from '../../testing/seed';
import { MessageList } from '../MessageList';

function renderList(onMessageLongPress = jest.fn()) {
  render(
    <RecommendationProvider registry={defaultRegistry} onPress={alertOnPress}>
      <MessageList onMessageLongPress={onMessageLongPress} />
    </RecommendationProvider>,
  );
  return onMessageLongPress;
}

beforeEach(seedStore);

describe('MessageList', () => {
  it('renders every message type and the recommendation cards', () => {
    renderList();
    expect(
      screen.getByText('Your session with AI Astrologer has started.'),
    ).toBeTruthy();
    expect(
      screen.getByText('Can you tell me about my career this year?'),
    ).toBeTruthy();
    expect(screen.getByText(/strong Saturn influence/)).toBeTruthy();
    expect(
      screen.getByText(
        'I also recommend focusing on your upcoming Jupiter transit.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Blue Sapphire')).toBeTruthy();
    expect(screen.getByText('Career Tarot Reading')).toBeTruthy();
    expect(screen.getByText('Talk to an Astrologer')).toBeTruthy();
    expect(screen.getByText('Understanding Saturn Mahadasha')).toBeTruthy();
  });

  it('shows date separators for yesterday and today', () => {
    renderList();
    expect(screen.getByText('Yesterday')).toBeTruthy();
    expect(screen.getByText('Today')).toBeTruthy();
  });

  it('long-press on an ai message reports it, but not on a system event', () => {
    const onLongPress = renderList();
    fireEvent(screen.getByTestId('message-3'), 'longPress');
    expect(onLongPress).toHaveBeenCalledWith(
      expect.objectContaining({ id: '3', type: 'ai' }),
    );

    onLongPress.mockClear();
    fireEvent(screen.getByTestId('message-1'), 'longPress');
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('shows the typing indicator while the ai is replying', () => {
    conversationStore.setState({ aiTyping: true });
    renderList();
    expect(screen.getByLabelText('AI Astrologer is typing')).toBeTruthy();
  });

  it('drops a message from the list when it is removed from the store', () => {
    renderList();
    expect(
      screen.getByText('Can you tell me about my career this year?'),
    ).toBeTruthy();
    act(() => conversationStore.getState().remove('2'));
    expect(
      screen.queryByText('Can you tell me about my career this year?'),
    ).toBeNull();
    expect(screen.getByText('Blue Sapphire')).toBeTruthy();
  });
});
