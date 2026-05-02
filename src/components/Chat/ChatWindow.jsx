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
  const { t, translateContent, currentLanguage, loading: translationLoading, translateText } = useTranslate() || {};
  const [userInput, setUserInput] = useState('');
  const debouncedUserInput = useDebounce(userInput, 300);
  const [validationError, setValidationError] = useState(null);
  const messagesEndRef = useRef(null);

  const uiContent = useMemo(() => ({
    inputPlaceholder: 'Ask anything about the Indian elections...',
    emptyHeader: "Hi! I'm ElectIQ.",
    emptyBody: 'Choose a persona above and ask me anything about voting in India!',
    error: '⚠️ Unable to connect to AI right now. Please try again.',
    translating: 'Translating...',
    greetingEmoji: '👋',
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
      
      const translatedInputForGemini = currentLanguage !== 'en'
        ? await (translateText(originalUserInput, 'en') || Promise.resolve(originalUserInput))
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
              <p className="text-xl mb-2">{t('greetingEmoji')}</p>
              <p className="font-semibold">{t('emptyHeader')}</p>
              <p>{t('emptyBody')}</p>
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
                    <p className="text-xs italic">{t('translating')}</p>
                </div>
            </div>
        )}

        {error && (
          <div className="flex justify-start mb-4">
            <div className="max-w-lg md:max-w-2xl px-4 py-3 rounded-2xl shadow-md bg-red-100 text-red-700 rounded-bl-none">
              <p>{t('error')}</p>
              {import.meta.env.DEV && <p className="text-xs mt-1">{error}</p>}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="relative">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={t('inputPlaceholder')}
            className={`w-full px-4 py-3 pr-12 text-base border ${validationError ? 'border-red-500' : 'border-gray-300'} rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow`}
            aria-label="Chat input"
            aria-invalid={!!validationError}
            aria-describedby="validation-error"
            disabled={loading}
          />
          <button
            type="submit"
            className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            disabled={loading || !!validationError || !userInput.trim()}
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        {validationError && (
            <p id="validation-error" className="text-red-600 text-sm mt-2 pl-4">
                {validationError}
            </p>
        )}
      </form>
    </div>
  );
};

ChatWindow.propTypes = {
  currentPersona: PropTypes.string,
};

export default ChatWindow;
