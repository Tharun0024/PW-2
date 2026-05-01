/**
 * @file Input and output sanitization functions.
 */

/**
 * Removes potentially malicious characters and trims whitespace from a string.
 * This is a basic sanitizer to prevent XSS.
 * @param {string} text - The input text to sanitize.
 * @returns {string} The sanitized text.
 */
export function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  const sanitized = text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  return sanitized.trim();
}

/**
 * Strips dangerous HTML tags including their inner content.
 * Allows a limited set of safe tags: b, strong, i, em, p, br.
 * @param {string} html - The HTML string to sanitize.
 * @returns {string} The sanitized HTML string.
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*on\w+="[^"]*"[^>]*>/gi, '')
    .replace(/<(?!\/?(?:b|strong|i|em|p|br)\b)[^>]*>/gi, '')
    .trim();
}

/**
 * Sanitizes a response from an API.
 * Stringifies the response and sanitizes the resulting string.
 * @param {any} response - The API response.
 * @returns {string} The sanitized string representation of the response.
 */
export function sanitizeApiResponse(response) {
  const stringified = JSON.stringify(response);
  return sanitizeInput(stringified);
}