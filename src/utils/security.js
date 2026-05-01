/**
 * @file src/utils/security.js
 * @description Provides utility functions for input sanitization and validation to enhance application security.
 * This module helps prevent common web vulnerabilities like Cross-Site Scripting (XSS).
 */

/**
 * A strict regex for validating general text input.
 * Allows alphanumeric characters, spaces, and common punctuation.
 * Disallows characters often used in injection attacks (<, >, &, ", ').
 */
const VALID_TEXT_REGEX = /^[a-zA-Z0-9\s.,!?'"-]*$/;

/**
 * Strips potentially dangerous HTML tags and attributes from a string.
 * This is a basic sanitizer and should be used for defense-in-depth.
 * @param {string} str The input string to sanitize.
 * @returns {string} The sanitized string.
 */
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

/**
 * Validates a string against a strict regex and length constraints.
 * @param {string} str The string to validate.
 * @param {number} maxLength The maximum allowed length of the string.
 * @returns {{isValid: boolean, message: string}} An object indicating if the string is valid and an error message if not.
 */
export const validateTextInput = (str, maxLength = 500) => {
  if (typeof str !== 'string' || str.trim() === '') {
    return { isValid: false, message: 'Input cannot be empty.' };
  }
  if (str.length > maxLength) {
    return { isValid: false, message: `Input cannot exceed ${maxLength} characters.` };
  }
  if (!VALID_TEXT_REGEX.test(str)) {
    return { isValid: false, message: 'Input contains invalid characters.' };
  }
  return { isValid: true, message: '' };
};

/**
 * A more aggressive sanitization function that blocks anything that looks like a script tag.
 * @param {string} str The input string.
 * @returns {string} The sanitized string with script tags neutralized.
 */
export const blockScriptInjection = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '');
};
