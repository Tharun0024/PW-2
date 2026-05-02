/**
 * @file src/utils/responseCache.js
 * @description Manages caching of AI responses in localStorage to improve performance
 * and reduce redundant API calls. Includes logic for exact and similarity-based matching.
 */

import { logger } from './logger';

const CACHE_KEY = 'electiq_ai_cache';
const MAX_CACHE_SIZE = 50;
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Retrieves the entire cache from localStorage.
 * @returns {Array<object>} The parsed cache array.
 */
function getCache() {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    return cachedData ? JSON.parse(cachedData) : [];
  } catch (error) {
    logger.error('Failed to read from response cache', { error });
    return [];
  }
}

/**
 * Saves the updated cache to localStorage and enforces size limits.
 * @param {Array<object>} cache - The cache array to save.
 */
function saveCache(cache) {
  try {
    // Enforce size limit by removing the oldest items
    if (cache.length > MAX_CACHE_SIZE) {
      cache.sort((a, b) => a.timestamp - b.timestamp); // Sort oldest first
      cache.splice(0, cache.length - MAX_CACHE_SIZE);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    logger.error('Failed to save to response cache', { error });
  }
}

/**
 * Saves a new question and answer to the cache.
 * @param {string} question - The user's question.
 * @param {string} answer - The AI's answer.
 */
export function saveResponse(question, answer) {
  if (!question || !answer || typeof question !== 'string' || typeof answer !== 'string') {
    return;
  }

  const cache = getCache();
  const normalizedQuestion = question.trim().toLowerCase();
  const existingIndex = cache.findIndex(item => item.question === normalizedQuestion);

  if (existingIndex !== -1) {
    // Update existing entry
    cache[existingIndex].timestamp = Date.now();
    cache[existingIndex].usageCount += 1;
  } else {
    // Add new entry
    cache.push({
      question: normalizedQuestion,
      answer,
      timestamp: Date.now(),
      usageCount: 1,
    });
  }

  saveCache(cache);
}

/**
 * Finds a cached response for a given question.
 * Checks for an exact match first, then a similarity match.
 * @param {string} question - The user's question.
 * @returns {string|null} The cached answer or null if not found.
 */
export function getCachedResponse(question) {
  if (!question || typeof question !== 'string') return null;

  const cache = getCache().filter(item => (Date.now() - item.timestamp) < CACHE_EXPIRATION_MS);
  const normalizedQuestion = question.trim().toLowerCase();

  // 1. Exact match check
  const exactMatch = cache.find(item => item.question === normalizedQuestion);
  if (exactMatch) {
    logger.info('Exact cache hit found', { question: normalizedQuestion });
    return exactMatch.answer;
  }

  // 2. Similarity match check
  const similarMatch = getSimilarResponse(normalizedQuestion, cache);
  if (similarMatch) {
    logger.info('Similar cache hit found', { question: normalizedQuestion, similarTo: similarMatch.question });
    return similarMatch.answer;
  }

  return null;
}

/**
 * Finds a response in the cache based on keyword similarity.
 * @param {string} question - The normalized user question.
 * @param {Array<object>} cache - The active cache entries.
 * @returns {object|null} The most similar cached item or null.
 */
function getSimilarResponse(question, cache) {
  const questionWords = new Set(question.split(/\s+/));
  if (questionWords.size === 0) return null;

  let bestMatch = null;
  let highestSimilarity = 0;

  for (const item of cache) {
    const cachedWords = new Set(item.question.split(/\s+/));
    const intersection = new Set([...questionWords].filter(word => cachedWords.has(word)));
    
    // Jaccard similarity index
    const similarity = intersection.size / (questionWords.size + cachedWords.size - intersection.size);

    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = item;
    }
  }

  // Use a threshold to avoid weak matches
  if (highestSimilarity >= 0.7) {
    return bestMatch;
  }

  return null;
}
