/**
 * @file src/components/Chat/ChatWindow.jsx
 * @description This component provides a complete chat interface for users to interact with the Gemini AI.
 * It handles message display, user input, loading states, and error handling. It integrates with the
 * useGemini and useTranslate hooks to provide a multilingual chat experience.
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useGemini } from '../../hooks/useGemini';
import { useTranslate } from '../../hooks/useTranslate.jsx';
import { sanitizeInput, validateTextInput } from '../../utils/security';
import { useDebounce } from '../../hooks/useDebounce';
import { trackUserFeedback } from '../../utils/analytics';

/**
 * A loading skeleton for the chat message.
 */
const MessageSkeleton = () => (
    <div className="flex justify-start mb-4">
        <div className="max-w-lg md:max-w-2xl px-4 py-3 rounded-2xl shadow-md bg-gray-200 text-gray-800 rounded-bl-none">
            <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full [animation-delay:-0.3s]"></div>
            </div>
        </div>
    </div>
);

/**
 * A single chat message component with feedback buttons.
 * @param {{ message: { role: string; parts: string; }; }} props
 * @returns {JSX.Element}
 */
const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedback = (rating) => {
      trackUserFeedback(message.id, rating);
      setFeedbackSent(true);
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-2`}>
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
            <div
                className={`max-w-lg md:max-w-2xl px-4 py-3 rounded-2xl shadow-md ${
                isUser
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
            >
                <p className="text-sm md:text-base whitespace-pre-wrap">{message.parts}</p>
            </div>
        </div>
        {!isUser && message.id && (
             <div className="mt-1.5 flex items-center space-x-2">
                {feedbackSent ? (
                    <p className="text-xs text-gray-500">Thanks for your feedback!</p>
                ) : (
                    <>
                        <button onClick={() => handleFeedback('up')} aria-label="Good response" className="p-1 rounded-full hover:bg-gray-200">👍</button>
                        <button onClick={() => handleFeedback('down')} aria-label="Bad response" className="p-1 rounded-full hover:bg-gray-200">👎</button>
                    </>
                )}
            </div>
        )}
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.shape({
    role: PropTypes.string.isRequired,
    parts: PropTypes.string.isRequired,
  }).isRequired,
};

/**
 * The main chat window component.
 * @param {{ currentPersona: string; }} props
 * @returns {JSX.Element}
 */
const ChatWindow = ({ currentPersona }) => {
  const { messages = [], sendMessage, loading, error } = useGemini();
  const { t, translateContent, currentLanguage, loading: translationLoading, translateText } = useTranslate() ?? {};
  const [userInput, setUserInput] = useState('');
  const debouncedUserInput = useDebounce(userInput, 300);
  const [validationError, setValidationError] = useState(null);
  const messagesEndRef = useRef(null);

  const uiContent = useMemo(() => ({
    inputPlaceholder: 'Ask anything about the Indian elections...',
    emptyBody: 'Start asking about elections 🚀',
    error: '⚠️ AI is temporarily unavailable. Please try again.',
    translating: 'Translating...',
    thinking: 'Thinking...',
  }), []);

  useEffect(() => {
    translateContent(uiContent);
  }, [currentLanguage, translateContent, uiContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const validation = validateTextInput(debouncedUserInput);
    if (!validation.isValid && debouncedUserInput) {
        setValidationError(validation.message);
    } else {
        setValidationError(null);
    }
  }, [debouncedUserInput]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, translationLoading]);

  const translatedMessages = useMemo(() => {
    const safeMessages = Array.isArray(messages) ? messages : [];
    return safeMessages.map(msg => {
      const safeMsg = msg || {};
      if (safeMsg.role === 'model' && currentLanguage !== 'en') {
        // The useTranslate hook now handles caching, so we can call translateText directly.
        // This is a simplified approach. For performance, you might want to
        // memoize the translated messages array itself.
      }
      return safeMsg;
    });
  }, [messages, currentLanguage]);

  /**
   * Handles the submission of a new chat message.
   * @param {React.FormEvent<HTMLFormElement>} e - The form event.
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const sanitizedInput = sanitizeInput(userInput);
    const validation = validateTextInput(sanitizedInput);

    if (!validation.isValid) {
        setValidationError(validation.message);
        return;
    }

    if (sanitizedInput.trim() && !loading) {
      const originalUserInput = sanitizedInput;
      setUserInput('');
      setValidationError(null);
      
      // Translation is now handled within the hook if needed, but for simplicity we send English.
      // In a more complex app, you might translate here.
      await sendMessage(originalUserInput, currentPersona?.geminiSystemPrompt, originalUserInput);
    }
  }, [userInput, loading, sendMessage, currentPersona, sanitizeInput, validateTextInput]);

  return (
    <div className="flex flex-col h-[70vh] bg-gray-50 rounded-lg">
      <div
        className="flex-grow p-4 sm:p-6 overflow-y-auto"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <p>{t('emptyBody')}</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && <MessageSkeleton />}
        
        {error && (
          <div className="flex justify-start mb-4">
            <div className="max-w-lg md:max-w-2xl px-4 py-3 rounded-2xl shadow-md bg-red-100 text-red-700 rounded-bl-none">
              <p>{error}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-center">
          <input
            type="text"
            className="flex-grow p-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={uiContent.inputPlaceholder}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            aria-describedby="validation-error"
            disabled={loading}
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            disabled={loading || !!validationError || !userInput.trim()}
            aria-label="Send message"
          >
            <span className="sr-only">Send message</span>
          </button>
        </div>
        {validationError && (
          <div className="mt-2 text-sm text-red-500">{validationError}</div>
        )}
      </form>
    </div>
  );
};

ChatWindow.propTypes = {
  currentPersona: PropTypes.string,
};

export default ChatWindow;
