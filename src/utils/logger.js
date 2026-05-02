/**
 * @file src/utils/logger.js
 * @description A simple structured logger utility for client-side event tracking.
 * This helps in debugging and monitoring application behavior in a structured format.
 */

/**
 * Generates a unique correlation ID for tracking a request flow.
 * @returns {string} A short unique identifier.
 */
const generateCorrelationId = () => `req_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;

/**
 * Formats a log message with a timestamp, level, and optional correlation ID.
 * @param {'INFO' | 'WARN' | 'ERROR'} level - The log level.
 * @param {string} message - The main log message.
 * @param {object} [context] - Additional context for the log.
 * @returns {void}
 */
const log = (level, message, context = {}) => {
  const { correlationId, ...restContext } = context;
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    correlationId: correlationId || 'N/A',
    message,
    ...restContext,
    userAgent: navigator.userAgent,
  };

  // In a real app, this would send to a logging service (e.g., Datadog, Sentry).
  // For this project, we log to the console in a structured way.
  switch (level) {
    case 'INFO':
      console.log(JSON.stringify(logEntry, null, 2));
      break;
    case 'WARN':
      console.warn(JSON.stringify(logEntry, null, 2));
      break;
    case 'ERROR':
      console.error(JSON.stringify(logEntry, null, 2));
      break;
    default:
      console.log(JSON.stringify(logEntry, null, 2));
  }
};

export const logger = {
  info: (message, context) => log('INFO', message, context),
  warn: (message, context) => log('WARN', message, context),
  error: (message, context) => log('ERROR', message, context),
  generateCorrelationId,
};
