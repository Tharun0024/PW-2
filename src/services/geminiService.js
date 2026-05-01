/**
 * @file Service for interacting with the Google Gemini API.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { memoryCache } from '../utils/cache';
import { sanitizeInput } from '../utils/sanitizer';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generates a response from the Gemini model based on user message and persona.
 * @param {string} userMessage - The user's message.
 * @param {object} persona - The selected persona configuration.
 * @param {Array<object>} conversationHistory - The history of the conversation.
 * @returns {Promise<string>} - The generated text response.
 */
export async function generateElectionResponse(userMessage, persona, conversationHistory) {
  const sanitizedMessage = sanitizeInput(userMessage);
  const cacheKey = `${persona.id}:${sanitizedMessage}`;
  const cachedResponse = memoryCache.get(cacheKey);

  if (cachedResponse) {
    return cachedResponse;
  }

  const maxRetries = 2;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const chat = model.startChat({
        history: conversationHistory,
        generationConfig: {
          maxOutputTokens: 1000,
        },
        systemInstruction: persona.geminiSystemPrompt,
      });

      const result = await chat.sendMessage(sanitizedMessage);
      const response = await result.response;
      const text = response.text();

      memoryCache.set(cacheKey, text, 3600); // Cache for 1 hour
      return text;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Gemini API error (Attempt ${attempt + 1}):`, error);
      }
      attempt++;
      if (attempt > maxRetries) {
        throw new Error('Failed to get a response from the AI after multiple retries.');
      }
    }
  }
}

export const runChat = async (userInput, persona, history) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const sanitizedInput = sanitizeInput(userInput);

  const chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  const result = await chat.sendMessage(sanitizedInput);
  const response = await result.response;
  return response.text();
};
