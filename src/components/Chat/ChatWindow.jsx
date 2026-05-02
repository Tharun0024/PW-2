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
    emptyBody: 'Start asking about elections 🚀',
    error: '⚠️ AI is temporarily unavailable. Please try again.',
    translating: 'Translating...',
    greetingEmoji: '👋',
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

  if (loading) {
    return <p className="text-gray-500 p-4">{t('thinking')}</p>;
  }

  if (!messages.length) {
    return <p className="text-gray-400 p-4">{t('emptyBody')}</p>;
  }
};

ChatWindow.propTypes = {
  currentPersona: PropTypes.string,
};

export default ChatWindow;
