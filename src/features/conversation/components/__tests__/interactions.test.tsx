import React from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import {
  alertOnPress,
  defaultRegistry,
  RecommendationProvider,
} from '../../../../recommendations';
import { ChatScreen } from '../../../../app/screens/ChatScreen';
import type { AiMessage } from '../../model/types';
import {
  conversationStore,
  mockApi,
  useConversationStore,
} from '../../store/instance';
import { mockMessages, resetStore, seedStore } from '../../testing/seed';
import { ActionSheet } from '../ActionSheet';
import { Composer } from '../Composer';
import { FeedbackBar } from '../FeedbackBar';
import { MessageList } from '../MessageList';
import { ReplyPreview } from '../ReplyPreview';

const state = () => conversationStore.getState();
const aiOf = (id: string) => state().byId[id] as AiMessage;

function withProviders(ui: React.ReactElement) {
  return (
    <RecommendationProvider registry={defaultRegistry} onPress={alertOnPress}>
      {ui}
    </RecommendationProvider>
  );
}

beforeEach(() => {
  seedStore();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('FeedbackBar', () => {
  function Harness() {
    const message = useConversationStore(s => s.byId['3']) as AiMessage;
    return <FeedbackBar messageId="3" feedback={message.feedback} />;
  }

  it('shows like and dislike, and only dislike reveals the reason chips', () => {
    render(<Harness />);
    expect(screen.getByLabelText('Like')).toBeTruthy();
    expect(screen.getByLabelText('Dislike')).toBeTruthy();
    expect(screen.queryByText('Too Long')).toBeNull();

    fireEvent.press(screen.getByLabelText('Dislike'));
    ['Inaccurate', 'Too Generic', "Didn't Help", 'Too Long'].forEach(label =>
      expect(screen.getByText(label)).toBeTruthy(),
    );
    expect(aiOf('3').feedback.rating).toBe('dislike');
  });

  it('selecting chips updates state and can be undone', () => {
    render(<Harness />);
    fireEvent.press(screen.getByLabelText('Dislike'));
    fireEvent.press(screen.getByText('Too Long'));
    fireEvent.press(screen.getByText('Inaccurate'));
    expect(aiOf('3').feedback.reasons).toEqual(['too_long', 'inaccurate']);
    fireEvent.press(screen.getByText('Too Long'));
    expect(aiOf('3').feedback.reasons).toEqual(['inaccurate']);
  });

  it('switching to like hides the chips and clears reasons', () => {
    render(<Harness />);
    fireEvent.press(screen.getByLabelText('Dislike'));
    fireEvent.press(screen.getByText('Too Generic'));
    fireEvent.press(screen.getByLabelText('Like'));
    expect(screen.queryByText('Too Generic')).toBeNull();
    expect(aiOf('3').feedback).toEqual({ rating: 'like', reasons: [] });
  });
});

describe('ReplyPreview', () => {
  it('shows the target, and cancel clears it', () => {
    act(() => state().setReply('3'));
    render(<ReplyPreview />);
    expect(screen.getByText('Replying to AI Astrologer')).toBeTruthy();
    expect(screen.getByText(/strong Saturn influence/)).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Cancel reply'));
    expect(state().replyToId).toBeNull();
    expect(screen.queryByText('Replying to AI Astrologer')).toBeNull();
  });

  it('renders nothing without a pending reply', () => {
    render(<ReplyPreview />);
    expect(screen.toJSON()).toBeNull();
  });
});

describe('ActionSheet', () => {
  const ai = () => state().byId['3'];

  it('offers reply, copy and delete for an ai message', () => {
    render(<ActionSheet message={ai()} onClose={jest.fn()} />);
    expect(screen.getByLabelText('Reply')).toBeTruthy();
    expect(screen.getByLabelText('Copy')).toBeTruthy();
    expect(screen.getByLabelText('Delete')).toBeTruthy();
  });

  it('reply sets the pending reply and closes', () => {
    const onClose = jest.fn();
    render(<ActionSheet message={ai()} onClose={onClose} />);
    fireEvent.press(screen.getByLabelText('Reply'));
    expect(state().replyToId).toBe('3');
    expect(onClose).toHaveBeenCalled();
  });

  it('copy writes the message text to the clipboard', () => {
    const onClose = jest.fn();
    render(<ActionSheet message={ai()} onClose={onClose} />);
    fireEvent.press(screen.getByLabelText('Copy'));
    expect(Clipboard.setString).toHaveBeenCalledWith(ai().text);
    expect(onClose).toHaveBeenCalled();
  });

  it('delete removes the message from state and keeps the others in order', () => {
    const onClose = jest.fn();
    render(<ActionSheet message={ai()} onClose={onClose} />);
    fireEvent.press(screen.getByLabelText('Delete'));
    expect(state().byId['3']).toBeUndefined();
    expect(state().ids).toEqual(['1', '2', '4']);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders no actions when closed', () => {
    render(<ActionSheet message={null} onClose={jest.fn()} />);
    expect(screen.queryByLabelText('Reply')).toBeNull();
  });
});

describe('Composer + list', () => {
  const aiReply: AiMessage = {
    id: 'reply-x',
    type: 'ai',
    text: 'A mocked reply',
    createdAt: Date.now(),
    recommendations: [],
    feedback: { rating: null, reasons: [] },
  };

  function renderChat() {
    render(
      withProviders(
        <>
          <MessageList onMessageLongPress={jest.fn()} />
          <Composer />
        </>,
      ),
    );
  }

  it('disables send until there is text', () => {
    renderChat();
    fireEvent.press(screen.getByLabelText('Send'));
    expect(state().ids).toHaveLength(4);
    expect(
      screen.getByLabelText('Send').props.accessibilityState.disabled,
    ).toBe(true);
  });

  it('adds the message optimistically as "Sending…" and clears the input', () => {
    jest.spyOn(mockApi, 'sendMessage').mockReturnValue(new Promise(() => {}));
    renderChat();
    fireEvent.changeText(
      screen.getByTestId('composer-input'),
      'What about love?',
    );
    fireEvent.press(screen.getByLabelText('Send'));

    expect(screen.getByText('What about love?')).toBeTruthy();
    expect(screen.getByText('Sending…')).toBeTruthy();
    expect(screen.getByTestId('composer-input').props.value).toBe('');
  });

  it('goes Sending… -> Sent, then shows the ai reply', async () => {
    jest.spyOn(mockApi, 'sendMessage').mockResolvedValue(undefined);
    jest.spyOn(mockApi, 'fetchAiReply').mockResolvedValue(aiReply);
    renderChat();
    fireEvent.changeText(screen.getByTestId('composer-input'), 'Hello');
    fireEvent.press(screen.getByLabelText('Send'));

    expect(await screen.findByText(/^Sent ·/)).toBeTruthy();
    expect(await screen.findByText('A mocked reply')).toBeTruthy();
  });

  it('shows Failed + Retry, and Retry recovers', async () => {
    jest
      .spyOn(mockApi, 'sendMessage')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(undefined);
    jest.spyOn(mockApi, 'fetchAiReply').mockResolvedValue(aiReply);
    renderChat();
    fireEvent.changeText(screen.getByTestId('composer-input'), 'Hello');
    fireEvent.press(screen.getByLabelText('Send'));

    expect(await screen.findByText('Failed to send')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Retry sending message'));
    expect(await screen.findByText(/^Sent ·/)).toBeTruthy();
    expect(screen.queryByText('Failed to send')).toBeNull();
  });

  it('a reply carries a quote of the original message', () => {
    jest.spyOn(mockApi, 'sendMessage').mockReturnValue(new Promise(() => {}));
    act(() => state().setReply('4'));
    renderChat();
    fireEvent.changeText(screen.getByTestId('composer-input'), 'Thanks!');
    fireEvent.press(screen.getByLabelText('Send'));

    expect(state().replyToId).toBeNull();
    const sent = state().byId[state().ids[state().ids.length - 1]];
    expect(sent.replyToId).toBe('4');
    expect(screen.getAllByText(/Jupiter transit/).length).toBeGreaterThan(0);
  });
});

describe('ChatScreen states', () => {
  beforeEach(() => resetStore([], 'idle'));

  it('shows the loading state while fetching', async () => {
    jest
      .spyOn(mockApi, 'fetchConversation')
      .mockReturnValue(new Promise(() => {}));
    render(withProviders(<ChatScreen />));
    expect(await screen.findByText('Loading conversation...')).toBeTruthy();
    expect(screen.queryByLabelText('Send')).toBeNull();
  });

  it('shows the error state with Retry, which reloads', async () => {
    const fetch = jest
      .spyOn(mockApi, 'fetchConversation')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(mockMessages());
    render(withProviders(<ChatScreen />));

    expect(
      await screen.findByText('Unable to load conversation.'),
    ).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Retry'));
    expect(await screen.findByText('Blue Sapphire')).toBeTruthy();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('shows the empty state, with the composer ready to use', async () => {
    jest.spyOn(mockApi, 'fetchConversation').mockResolvedValue([]);
    render(withProviders(<ChatScreen />));
    expect(await screen.findByText('Start your conversation.')).toBeTruthy();
    expect(screen.getByLabelText('Send')).toBeTruthy();
  });

  it('long-press then Delete removes the message from the screen', async () => {
    jest.spyOn(mockApi, 'fetchConversation').mockResolvedValue(mockMessages());
    render(withProviders(<ChatScreen />));
    expect(await screen.findByText('Blue Sapphire')).toBeTruthy();

    fireEvent(screen.getByTestId('message-3'), 'longPress');
    fireEvent.press(await screen.findByLabelText('Delete'));
    await waitFor(() => expect(screen.queryByText('Blue Sapphire')).toBeNull());
    expect(
      screen.getByText(
        'I also recommend focusing on your upcoming Jupiter transit.',
      ),
    ).toBeTruthy();
  });
});
