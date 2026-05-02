/**
 * @file Custom React hook for interacting with the Gemini service.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getGeminiResponse } from '../services/geminiService.js';

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
        const parsedMessages = JSON.parse(storedMessages);
        // Failsafe: ensure we always have an array
        setMessages(Array.isArray(parsedMessages) ? parsedMessages : []);
      }
    } catch (e) {
      console.error("Failed to parse chat history from localStorage", e);
      localStorage.removeItem('chatHistory');
      setMessages([]); // Reset to empty array on error
    }
  }, []);

  useEffect(() => {
    try {
      // Only save if messages is a valid array
      if (Array.isArray(messages)) {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
      }
    } catch(e) {
      console.error("Failed to save chat history to localStorage", e);
    }
  }, [messages]);

  const sendMessage = useCallback(async (userInput, persona, originalUserInput = null) => {
    const safeUserInput = userInput || "";
    const safePersona = persona || "default";
    if (!safeUserInput) return;

    const userMessage = { role: 'user', parts: originalUserInput ?? safeUserInput };

    // Ensure messages is always an array before spreading
    const currentMessages = Array.isArray(messages) ? messages : [];
    const newMessages = [...currentMessages, userMessage];

    setMessages(newMessages);
    setLoading(true);
    setError(null);

    const cacheKey = `${safePersona}:${safeUserInput}`;
    if (chatCache.current.has(cacheKey)) {
      const cachedResponse = chatCache.current.get(cacheKey);
      setMessages(prev => [...(Array.isArray(prev) ? prev : []), { role: 'model', parts: cachedResponse }]);
      setLoading(false);
      return;
    }

    const chatHistory = newMessages.slice(0, -1); // All messages except the latest user input

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await getGeminiResponse(safeUserInput, safePersona, chatHistory);
        chatCache.current.set(cacheKey, response);
        setMessages(prev => [...(Array.isArray(prev) ? prev : []), { role: 'model', parts: response }]);
        setLoading(false);
        return;
      } catch (err) {
        if (attempt === MAX_RETRIES) {
          const errorMessage = err?.message || 'An unknown error occurred.';
          setError(errorMessage);
          setLoading(false);
        } else {
          await new Promise(res => setTimeout(res, 1000));
        }
      }
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
    chatCache.current.clear();
  }, []);

  return { messages, loading, error, sendMessage, clearMessages };
};
