/**
 * @file Custom React hook for interacting with the Gemini service.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getGeminiResponseStream } from '../services/geminiService.js';
import { quickResponses } from '../constants/quickResponses.js';
import { getCachedResponse, saveResponse } from '../utils/responseCache.js';
import { logger } from '../utils/logger';
import { trackAIQuery } from '../utils/analytics';
import { getAllMessages, addMessage, addMessages, clearAllMessages } from '../utils/db';

const MAX_RETRIES = 1; // Reduced retries for streaming

export const useGemini = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Load messages from IndexedDB first, then fallback to localStorage
    const loadMessages = async () => {
        try {
            const dbMessages = await getAllMessages();
            if (dbMessages && dbMessages.length > 0) {
                setMessages(dbMessages);
                logger.info("Loaded chat history from IndexedDB.");
            } else {
                const storedMessages = localStorage.getItem('chatHistory');
                if (storedMessages) {
                    const parsedMessages = JSON.parse(storedMessages);
                    if (Array.isArray(parsedMessages)) {
                        setMessages(parsedMessages);
                        await addMessages(parsedMessages); // Sync localStorage to IndexedDB
                        logger.info("Loaded chat history from localStorage and synced to IndexedDB.");
                    }
                }
            }
        } catch (e) {
            logger.error("Failed to load chat history", { error: e.message });
            // Fallback to localStorage one last time
            try {
                const storedMessages = localStorage.getItem('chatHistory');
                if (storedMessages) setMessages(JSON.parse(storedMessages));
            } catch (localError) {
                logger.error("Failed to load from localStorage fallback", { error: localError.message });
            }
        }
    };
    loadMessages();
  }, []);

  useEffect(() => {
    // This effect now primarily serves as a backup or for non-IndexedDB environments.
    // The primary source of truth is now the component's state, persisted to IndexedDB on change.
    try {
      if (Array.isArray(messages) && messages.length > 0) {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
      }
    } catch(e) {
      logger.error("Failed to save chat history to localStorage", { error: e.message });
    }
  }, [messages]);

  const sendMessage = useCallback(async (userInput, persona, originalUserInput = null) => {
    const correlationId = logger.generateCorrelationId();
    logger.info('sendMessage initiated', { correlationId, userInput });

    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        logger.warn('Aborted previous AI request.', { correlationId });
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const safeUserInput = userInput || "";
    if (!safeUserInput) return;

    const userMessage = { role: 'user', parts: originalUserInput ?? safeUserInput, id: `msg_${Date.now()}` };
    setMessages(prev => [...(Array.isArray(prev) ? prev : []), userMessage]);
    addMessage(userMessage); // Persist to IndexedDB
    setLoading(true);
    setError(null);

    const startTime = Date.now();

    // Step 1: Intent Classification
    const quickResponse = quickResponses[safeUserInput.toLowerCase().trim()];
    if (quickResponse) {
        const aiMessage = { role: 'model', parts: quickResponse.answer, id: `msg_${Date.now()}_quick` };
        setMessages(prev => [...prev, aiMessage]);
        addMessage(aiMessage); // Persist to IndexedDB
        setLoading(false);
        trackAIQuery(safeUserInput, Date.now() - startTime, true, 'intent');
        logger.info('Responded from quick intent.', { correlationId });
        return;
    }

    // Step 2: Intelligent Caching
    const cachedResponse = getCachedResponse(safeUserInput);
    if (cachedResponse) {
        const aiMessage = { role: 'model', parts: cachedResponse, id: `msg_${Date.now()}_cached` };
        setMessages(prev => [...prev, aiMessage]);
        addMessage(aiMessage); // Persist to IndexedDB
        setLoading(false);
        trackAIQuery(safeUserInput, Date.now() - startTime, true, 'cache_hit');
        logger.info('Responded from cache.', { correlationId });
        return;
    }
    
    trackAIQuery(safeUserInput, null, false, 'api_call');
    const chatHistory = messages.slice(-5).map(m => ({ role: m.role, parts: [{ text: m.parts }] }));

    let fullResponse = '';
    let messageId = `msg_${Date.now()}_ai`;
    let messageAdded = false;

    try {
      const stream = getGeminiResponseStream(safeUserInput, chatHistory, persona, signal);
      for await (const chunk of stream) {
        if (signal.aborted) return;
        fullResponse += chunk;
        if (!messageAdded) {
          const initialMessage = { role: 'model', parts: fullResponse, id: messageId };
          setMessages(prev => [...prev, initialMessage]);
          messageAdded = true;
        } else {
          setMessages(prev => prev.map(m => m.id === messageId ? { ...m, parts: fullResponse } : m));
        }
        setLoading(false); // Stop loading skeleton once first chunk arrives
      }

      if (fullResponse) {
        const finalMessage = { role: 'model', parts: fullResponse, id: messageId };
        addMessage(finalMessage); // Persist final message to IndexedDB
        saveResponse(safeUserInput, fullResponse);
        trackAIQuery(safeUserInput, Date.now() - startTime, false, 'api_success');
        logger.info('Stream completed successfully.', { correlationId });
      } else {
          throw new Error("Received an empty response from the AI.");
      }

    } catch (err) {
        if (err.name !== 'AbortError') {
            logger.error('AI stream failed.', { correlationId, error: err.message });
            setError('⚠️ AI is temporarily unavailable. Please try again.');
            // Remove the empty model message if it was added
            if(messageAdded) {
                setMessages(prev => prev.filter(m => m.id !== messageId));
            }
        }
        setLoading(false);
    } finally {
        if (abortControllerRef.current?.signal === signal) {
            abortControllerRef.current = null;
        }
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
    clearAllMessages(); // Clear from IndexedDB
    logger.info("Chat history cleared from state, localStorage, and IndexedDB.");
  }, []);

  return { messages, loading, error, sendMessage, clearMessages };
};
