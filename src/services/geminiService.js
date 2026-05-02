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

export const getGeminiResponse = async (userInput, persona, history) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const sanitizedInput = sanitizeInput(userInput);

  const chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  try {
    const result = await chat.sendMessage(sanitizedInput);
    const response = await result.response;

    // Safely access the text from the response
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    return text || "Sorry, I couldn't generate a response right now.";
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Gemini API error:', error);
    }
    return "Sorry, something went wrong. Please try again later.";
  }
};
