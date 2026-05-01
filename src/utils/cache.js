/**
 * @file A simple in-memory cache to reduce redundant API calls.
 */

class Cache {
  constructor() {
    this.cache = new Map();
    if (import.meta.env.DEV) {
      console.log('Cache initialized');
    }
  }

  /**
   * Stores a value in the cache with an optional Time-To-Live (TTL).
   * @param {string} key - The key to store the value under.
   * @param {*} value - The value to store.
   * @param {number} [ttlSeconds] - Optional TTL in seconds.
   */
  set(key, value, ttlSeconds) {
    const expires = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expires });
    if (import.meta.env.DEV) {
      console.log(`Cache SET for key: ${key}`);
    }
  }

  /**
   * Retrieves a value from the cache.
   * Returns null if the key is not found or the item has expired.
   * @param {string} key - The key to retrieve.
   * @returns {*} - The cached value or null.
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      if (import.meta.env.DEV) {
        console.log(`Cache MISS for key: ${key}`);
      }
      return null;
    }

    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      if (import.meta.env.DEV) {
        console.log(`Cache EXPIRED for key: ${key}`);
      }
      return null;
    }

    if (import.meta.env.DEV) {
      console.log(`Cache HIT for key: ${key}`);
    }
    return item.value;
  }

  /**
   * Clears the entire cache.
   */
  clear() {
    this.cache.clear();
    if (import.meta.env.DEV) {
      console.log('Cache cleared');
    }
  }
}

// Export a singleton instance
export const memoryCache = new Cache();
