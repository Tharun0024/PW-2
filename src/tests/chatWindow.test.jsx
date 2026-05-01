/**
 * @file src/tests/chatWindow.test.js
 * @description Vitest tests for the ChatWindow component. This file includes tests for sending messages,
 * displaying responses, handling loading and error states, and preventing empty submissions.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ChatWindow from '../components/Chat/ChatWindow';
import { useGemini } from '../hooks/useGemini';
import { useTranslate } from '../hooks/useTranslate';

// Mock the hooks
vi.mock('../hooks/useGemini');
vi.mock('../hooks/useTranslate');

describe('ChatWindow', () => {
  const mockSendMessage = vi.fn();
  const mockTranslateText = vi.fn((text) => Promise.resolve(text));

  beforeEach(() => {
    vi.resetAllMocks();
    useGemini.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      loading: false,
      error: null,
    });
    useTranslate.mockReturnValue({
      translateText: mockTranslateText,
      currentLanguage: 'en',
      loading: false,
      placeholders: {
        input: 'Ask anything about the Indian elections...',
        empty: "Hi! I'm ElectIQ. Choose a persona above and ask me anything about voting in India!",
        error: 'Sorry, something went wrong. Please try again later.',
      }
    });
  });

  it('renders the initial empty state message', () => {
    render(<ChatWindow currentPersona="first-time-voter" />);
    expect(screen.getByText("Hi! I'm ElectIQ.")).toBeInTheDocument();
  });

  it('prevents sending an empty message', () => {
    render(<ChatWindow currentPersona="first-time-voter" />);
    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).toBeDisabled();
    fireEvent.click(sendButton);
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('allows user to type and send a message', async () => {
    render(<ChatWindow currentPersona="first-time-voter" />);
    const input = screen.getByLabelText('Chat input');
    const sendButton = screen.getByLabelText('Send message');

    fireEvent.change(input, { target: { value: 'Hello there' } });
    expect(sendButton).not.toBeDisabled();

    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Hello there', 'first-time-voter', 'Hello there');
    });
    // Input should be cleared after sending
    expect(input.value).toBe('');
  });

  it('displays user and model messages correctly', () => {
    useGemini.mockReturnValue({
      messages: [
        { role: 'user', parts: 'Hello' },
        { role: 'model', parts: 'Hi, how can I help?' },
      ],
      sendMessage: mockSendMessage,
      loading: false,
      error: null,
    });
    render(<ChatWindow currentPersona="first-time-voter" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi, how can I help?')).toBeInTheDocument();
  });

  it('shows a loading indicator when sending a message', () => {
    useGemini.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      loading: true,
      error: null,
    });
    render(<ChatWindow currentPersona="first-time-voter" />);
    // The loading indicator is a set of pulsing divs, we check for their parent container
    const loadingIndicator = screen.getByText(/(\s*•\s*){3}/i, { selector: 'div' });
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('displays an error message when the API call fails', () => {
    useGemini.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      loading: false,
      error: 'API Error',
    });
    useTranslate.mockReturnValue({
        translateText: mockTranslateText,
        currentLanguage: 'en',
        loading: false,
        placeholders: {
          input: 'Ask anything about the Indian elections...',
          empty: "Hi! I'm ElectIQ. Choose a persona above and ask me anything about voting in India!",
          error: 'Sorry, something went wrong. Please try again later.',
        }
      });
    render(<ChatWindow currentPersona="first-time-voter" />);
    expect(screen.getByText('Sorry, something went wrong. Please try again later.')).toBeInTheDocument();
  });
});
