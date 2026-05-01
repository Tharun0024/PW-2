/**
 * @file src/hooks/useAccessibility.js
 * @description A custom hook to provide common accessibility features, such as focus trapping
 * and keyboard event handling. This helps ensure components are usable by everyone,
 * including those who rely on assistive technologies.
 */
import { useEffect, useRef, useCallback } from 'react';

/**
 * A hook for trapping focus within a specified element.
 * @param {React.RefObject<HTMLElement>} ref The ref of the container element to trap focus within.
 * @param {boolean} isActive Whether the focus trap should be active.
 */
export const useFocusTrap = (ref, isActive) => {
  const firstFocusableElement = useRef(null);
  const lastFocusableElement = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === firstFocusableElement.current) {
        lastFocusableElement.current.focus();
        e.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === lastFocusableElement.current) {
        firstFocusableElement.current.focus();
        e.preventDefault();
      }
    }
  }, []);

  useEffect(() => {
    if (isActive && ref.current) {
      const focusableElements = ref.current.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        firstFocusableElement.current = focusableElements[0];
        lastFocusableElement.current = focusableElements[focusableElements.length - 1];
        firstFocusableElement.current.focus();
        
        ref.current.addEventListener('keydown', handleKeyDown);
      }
    }

    return () => {
      if (ref.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        ref.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isActive, ref, handleKeyDown]);
};

/**
 * Announces a message to screen readers.
 * Creates and appends a visually hidden element with aria-live="polite".
 * @param {string} message The message to be announced.
 */
export const announceToScreenReader = (message) => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('style', 'position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;');
  announcer.textContent = message;
  document.body.appendChild(announcer);
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
};
