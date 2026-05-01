/**
 * @file src/hooks/useDebounce.js
 * @description A custom hook that debounces a value. This is useful for delaying the processing
 * of a rapidly changing value, such as user input in a text field, to improve performance.
 */
import { useState, useEffect } from 'react';

/**
 * Debounces a value.
 * @param {*} value The value to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {*} The debounced value.
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to cancel the timeout if the value changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
