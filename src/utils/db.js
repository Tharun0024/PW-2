/**
 * @file src/utils/db.js
 * @description A simple IndexedDB wrapper for storing chat messages.
 */
import { openDB } from 'idb';
import { logger } from './logger';

const DB_NAME = 'ElectIQ-DB';
const STORE_NAME = 'messages';
const DB_VERSION = 1;
const MAX_MESSAGES = 100; // Store a bit more than just the last 20 conversations for context

let dbPromise;

function getDbPromise() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp');
                }
            },
        });
    }
    return dbPromise;
}


/**
 * Retrieves all messages from IndexedDB, sorted by timestamp.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of messages.
 */
export async function getAllMessages() {
  try {
    const db = await getDbPromise();
    return await db.getAllFromIndex(STORE_NAME, 'timestamp');
  } catch (error) {
    logger.error('Failed to get messages from IndexedDB', { error: error.message });
    return [];
  }
}

/**
 * Adds a message to IndexedDB.
 * @param {object} message - The message object to add.
 */
export async function addMessage(message) {
  try {
    const db = await getDbPromise();
    await db.add(STORE_NAME, { ...message, timestamp: new Date().getTime() });
    await trimOldMessages(db);
  } catch (error) {
    logger.error('Failed to add message to IndexedDB', { error: error.message });
  }
}

/**
 * Adds multiple messages to IndexedDB.
 * @param {Array<object>} messages - An array of message objects to add.
 */
export async function addMessages(messages) {
    try {
        const db = await getDbPromise();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const message of messages) {
            store.put({ ...message, timestamp: new Date().getTime() });
        }
        await tx.done;
        await trimOldMessages(db);
    } catch (error) {
        logger.error('Failed to add multiple messages to IndexedDB', { error: error.message });
    }
}


/**
 * Trims the number of messages in the store to MAX_MESSAGES.
 * @param {IDBDatabase} db - The database instance.
 */
async function trimOldMessages(db) {
    try {
        const count = await db.count(STORE_NAME);
        if (count > MAX_MESSAGES) {
            const keysToDelete = await db.getAllKeysFromIndex(STORE_NAME, 'timestamp');
            const deleteCount = count - MAX_MESSAGES;
            const tx = db.transaction(STORE_NAME, 'readwrite');
            for (let i = 0; i < deleteCount; i++) {
                tx.store.delete(keysToDelete[i]);
            }
            await tx.done;
        }
    } catch (error) {
        logger.error('Failed to trim old messages from IndexedDB', { error: error.message });
    }
}

/**
 * Clears all messages from the store.
 * @returns {Promise<void>}
 */
export async function clearAllMessages() {
  try {
    const db = await getDbPromise();
    await db.clear(STORE_NAME);
  } catch (error) {
    logger.error('Failed to clear messages from IndexedDB', { error: error.message });
  }
}
