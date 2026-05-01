/**
 * @file Service for interacting with the Google Translate API.
 */

import axios from 'axios';

const API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
const API_URL = `https://translation.googleapis.com/language/translate/v2`;

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'bn', name: 'Bengali' },
];

/**
 * Translates text to a target language using the Google Translate API.
 * @param {string} text - The text to translate.
 * @param {string} targetLanguage - The target language code (e.g., 'hi').
 * @returns {Promise<string>} - A promise that resolves with the translated text.
 */
export async function translateText(text, targetLanguage) {
  if (!API_KEY) {
    if (import.meta.env.DEV) {
      console.warn('Translate API key is missing. Returning original text.');
    }
    return text; // Return original text if key is not set
  }

  try {
    const response = await axios.post(API_URL, {
      q: text,
      target: targetLanguage,
      key: API_KEY,
    });
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Google Translate API error:', error);
    }
    // In case of error, return the original text to not break the UI
    return text;
  }
}

/**
 * Returns the list of supported languages for translation.
 * @returns {Array<object>} - An array of supported language objects.
 */
export function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}
