/**
 * @file Service for interacting with the Google Gemini API.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from '../utils/logger';

const GOOGLE_GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

if (!GOOGLE_GEMINI_API_KEY) {
  logger.error("VITE_GOOGLE_GEMINI_API_KEY is not set. AI service will not be available.");
}

const genAI = GOOGLE_GEMINI_API_KEY ? new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY) : null;

const GEMINI_PRIMARY_MODEL = 'gemini-pro';
const GEMINI_FALLBACK_MODEL = 'gemini-1.5-flash';

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

  const maxRetries = MAX_RETRIES;
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

/**
 * Gets a streaming response from the Gemini API.
 * @param {string} userInput - The user's input.
 * @param {Array<object>} history - The conversation history.
 * @param {string} persona - The persona system prompt.
 * @param {AbortSignal} signal - Abort signal for the request.
 * @param {boolean} useFallback - Whether to use the fallback model.
 * @returns {AsyncGenerator<string, void, unknown>} An async generator that yields response chunks.
 */
export async function* getGeminiResponseStream(userInput, history, persona, signal, useFallback = false) {
  if (!genAI) {
    logger.error("Gemini AI Service not initialized due to missing API key.");
    throw new Error("AI service is not configured.");
  }

  const modelName = useFallback ? GEMINI_FALLBACK_MODEL : GEMINI_PRIMARY_MODEL;
  logger.info('Initiating Gemini Stream', { modelName });

  const model = genAI.getGenerativeModel({ model: modelName });

  const chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 1000,
    },
    systemInstruction: persona,
  });

  try {
    const result = await chat.sendMessageStream(userInput, { signal });
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield chunkText;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.warn('Gemini stream request was aborted.');
      return; // Stop generation if aborted
    }
    logger.error('Gemini stream error', { error: error.message });
    throw error; // Re-throw to be caught by the caller
  }
}

export const getGeminiResponse = async (userInput, persona, history) => {
  if (!genAI) {
    logger.error("Gemini AI Service not initialized due to missing API key.");
    throw new Error("AI service is not configured.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 100,
    },
    systemInstruction: persona,
  });

  try {
    const result = await chat.sendMessage(userInput);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    logger.error('Gemini non-stream error', { error: error.message });
    throw error;
  }
};
