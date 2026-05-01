/**
 * @file Custom React hook for interacting with the Gemini service.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { runChat } from '../services/geminiService.js';

const MAX_RETRIES = 2;

export const useGemini = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatCache = useRef(new Map());

  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem('chatHistory');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (e) {
      console.error("Failed to parse chat history from localStorage", e);
      localStorage.removeItem('chatHistory');
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    } catch(e) {
      console.error("Failed to save chat history to localStorage", e);
    }
  }, [messages]);

  const sendMessage = useCallback(async (userInput, persona, originalUserInput = null) => {
    if (!userInput) return;

    const userMessage = { role: 'user', parts: originalUserInput ?? userInput };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    const cacheKey = `${persona}:${userInput}`;
    if (chatCache.current.has(cacheKey)) {
      const cachedResponse = chatCache.current.get(cacheKey);
      setMessages(prev => [...prev, { role: 'model', parts: cachedResponse }]);
      setLoading(false);
      return;
    }

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await runChat(userInput, persona, chatHistory);
        chatCache.current.set(cacheKey, response);
        setMessages(prev => [...prev, { role: 'model', parts: response }]);
        setLoading(false);
        return;
      } catch (err) {
        if (attempt === MAX_RETRIES) {
          setError(err.message || 'An unknown error occurred.');
          setLoading(false);
        } else {
          // Optional: add a delay before retrying
          await new Promise(res => setTimeout(res, 1000));
        }
      }
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
    chatCache.current.clear();
  }, []);

  return { messages, loading, error, sendMessage, clearMessages };
};
