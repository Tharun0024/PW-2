/**
 * @file src/utils/analytics.js
 * @description A privacy-first analytics tracking system.
 * Events are stored locally in localStorage and are not sent to any external server.
 */
import { logger } from './logger';

const ANALYTICS_KEY = 'electiq_analytics_events';
const MAX_EVENTS = 200;

/**
 * Retrieves all analytics events from localStorage.
 * @returns {Array<object>} The list of events.
 */
export function getAnalyticsEvents() {
  try {
    const events = localStorage.getItem(ANALYTICS_KEY);
    return events ? JSON.parse(events) : [];
  } catch (error) {
    logger.error('Failed to retrieve analytics events', { error: error.message });
    return [];
  }
}

/**
 * Adds a new event to the analytics log.
 * @param {object} event - The event object to track.
 */
function trackEvent(event) {
  try {
    const events = getAnalyticsEvents();
    events.push({ ...event, id: `evt_${Date.now()}`, timestamp: new Date().toISOString() });

    // Enforce storage limit
    if (events.length > MAX_EVENTS) {
      events.splice(0, events.length - MAX_EVENTS);
    }

    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events));
  } catch (error) {
    logger.error('Failed to track analytics event', { error: error.message });
  }
}

/**
 * Tracks a page view event.
 * @param {string} pageName - The name of the page being viewed.
 */
export const trackPageView = (pageName) => {
  trackEvent({ type: 'PAGE_VIEW', pageName });
};

/**
 * Tracks an AI query event.
 * @param {string} question - The user's question.
 * @param {number} responseTime - The time taken to get the response in ms.
 * @param {boolean} cached - Whether the response was from the cache.
 * @param {string} queryType - 'intent', 'cache_hit', 'api_call'
 */
export const trackAIQuery = (question, responseTime, cached, queryType) => {
  trackEvent({ type: 'AI_QUERY', question, responseTime, cached, queryType });
};

/**
 * Tracks user feedback on an AI response.
 * @param {string} messageId - The unique ID of the message.
 * @param {'up' | 'down'} rating - The user's rating.
 */
export const trackUserFeedback = (messageId, rating) => {
  trackEvent({ type: 'USER_FEEDBACK', messageId, rating });
};

/**
 * Tracks a generic application error.
 * @param {string} errorType - The type of error (e.g., 'API_ERROR', 'COMPONENT_ERROR').
 * @param {string} errorMessage - The error message.
 */
export const trackError = (errorType, errorMessage) => {
  trackEvent({ type: 'ERROR', errorType, errorMessage });
};

/**
 * Tracks the usage of a specific feature.
 * @param {string} featureName - The name of the feature used (e.g., 'EligibilityCheck', 'BoothSearch').
 */
export const trackFeatureUsage = (featureName) => {
  trackEvent({ type: 'FEATURE_USAGE', featureName });
};

/**
 * Clears all stored analytics data.
 */
export function clearAnalyticsData() {
    try {
        localStorage.removeItem(ANALYTICS_KEY);
        logger.info('Analytics data cleared');
    } catch (error) {
        logger.error('Failed to clear analytics data', { error: error.message });
    }
}
