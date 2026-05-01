/**
 * @file src/components/Chat/ChatWindow.jsx
 * @description This component provides a complete chat interface for users to interact with the Gemini AI.
 * It handles message display, user input, loading states, and error handling. It integrates with the
 * useGemini and useTranslate hooks to provide a multilingual chat experience.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useGemini } from '../../hooks/useGemini';
import { useTranslate } from '../../hooks/useTranslate.jsx';
import { sanitizeInput, validateTextInput } from '../../utils/security';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * A single chat message component.
 * @param {{ message: { role: string; parts: string; }; }} props
 * @returns {JSX.Element}
 */
const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-lg md:max-w-2xl px-4 py-3 rounded-2xl shadow-md ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="text-sm md:text-base">{message.parts}</p>
      </div>
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
  const { translateText, currentLanguage, loading: translationLoading } = useTranslate() || {};
  const [userInput, setUserInput] = useState('');
  const [translatedMessages, setTranslatedMessages] = useState([]);
  const debouncedUserInput = useDebounce(userInput, 300);
  const [validationError, setValidationError] = useState(null);
  const [placeholders, setPlaceholders] = useState({
    input: 'Ask anything about the Indian elections...',
    empty: "Hi! I'm ElectIQ. Choose a persona above and ask me anything about voting in India!",
    error: 'Sorry, something went wrong. Please try again later.',
  });
  const messagesEndRef = useRef(null);

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
  }, [translatedMessages, loading, translationLoading]);

  useEffect(() => {
    const translateUI = async () => {
      if (currentLanguage !== 'en') {
        const [translatedInput, translatedEmpty, translatedError] = await Promise.all([
          translateText('Ask anything about the Indian elections...', currentLanguage),
          translateText("Hi! I'm ElectIQ. Choose a persona above and ask me anything about voting in India!", currentLanguage),
          translateText('Sorry, something went wrong. Please try again later.', currentLanguage),
        ]);
        setPlaceholders({
          input: translatedInput,
          empty: translatedEmpty,
          error: translatedError,
        });
      } else {
        setPlaceholders({
          input: 'Ask anything about the Indian elections...',
          empty: "Hi! I'm ElectIQ. Choose a persona above and ask me anything about voting in India!",
          error: 'Sorry, something went wrong. Please try again later.',
        });
      }
    };
    translateUI();
  }, [currentLanguage, translateText]);

  useEffect(() => {
    const translateMessages = async () => {
      if (currentLanguage === 'en') {
        setTranslatedMessages(messages);
        return;
      }
      const newTranslated = await Promise.all(
        messages.map(async (msg) => {
          // We only translate model responses. User messages are stored in their original language.
          if (msg.role === 'model') {
            const translatedText = await translateText(msg.parts, currentLanguage);
            return { ...msg, parts: translatedText };
          }
          return msg;
        })
      );
      setTranslatedMessages(newTranslated);
    };
    translateMessages();
  }, [messages, currentLanguage, translateText]);

  /**
   * Handles the submission of a new chat message.
   * @param {React.FormEvent<HTMLFormElement>} e - The form event.
   */
  const handleSubmit = async (e) => {
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
      
      // We send the user's message in their original language to the message history
      const translatedInputForGemini = currentLanguage !== 'en'
        ? await translateText(originalUserInput, 'en')
        : originalUserInput;
      
      await sendMessage(translatedInputForGemini, currentPersona, originalUserInput);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-gray-50 rounded-lg">
      <div
        className="flex-grow p-4 sm:p-6 overflow-y-auto"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Chat messages"
      >
        {translatedMessages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-xl mb-2">👋</p>
              <p className="font-semibold">Hi! I'm ElectIQ.</p>
              <p>{placeholders.empty}</p>
            </div>
          </div>
        )}

        {translatedMessages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="max-w-lg md:max-w-2xl px-4 py-3 rounded-2xl shadow-md bg-gray-200 text-gray-800 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        
        {translationLoading && (
            <div className="flex justify-start mb-4">
                <div className="max-w-lg md:max-w-2xl px-4 py-3 rounded-2xl shadow-md bg-gray-200 text-gray-800 rounded-bl-none">
                    <p className="text-xs italic">Translating...</p>
                </div>
            </div>
        )}

        {error && (
          <div className="flex justify-start mb-4">
            <div className="max-w-lg md:max-w-2xl px-4 py-3 rounded-2xl shadow-md bg-red-100 text-red-700 rounded-bl-none">
              <p>{placeholders.error}</p>
              {import.meta.env.DEV && <p className="text-xs mt-1">{error}</p>}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <div className="flex-grow">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={placeholders.input}
              aria-label="Chat input"
              aria-invalid={!!validationError}
              aria-describedby="chat-error"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
              rows="1"
              disabled={loading || translationLoading}
              maxLength="500"
            />
            {validationError && <p id="chat-error" className="text-red-600 text-xs mt-1">{validationError}</p>}
          </div>
          <button
            type="submit"
            disabled={loading || translationLoading || !userInput.trim() || !!validationError}
            aria-label="Send message"
            className="px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

ChatWindow.propTypes = {
  currentPersona: PropTypes.string,
};

export default ChatWindow;
