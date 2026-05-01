/**
 * @file Tests for sanitizer utility functions.
 */
import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeHtml } from '../utils/sanitizer';

describe('Sanitizer Utilities', () => {
  // Tests for sanitizeInput
  it('should remove XSS script tags', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
  });

  it('should pass through normal, safe input', () => {
    const normalInput = 'This is a normal sentence.';
    expect(sanitizeInput(normalInput)).toBe(normalInput);
  });

  it('should trim whitespace from input', () => {
    const spacedInput = '  hello world  ';
    expect(sanitizeInput(spacedInput)).toBe('hello world');
  });

  // Tests for sanitizeHtml
  it('should strip dangerous HTML tags like <script>', () => {
    const html = '<p>Hello</p><script>alert("danger")</script><b>World</b>';
    const sanitized = sanitizeHtml(html);
    expect(sanitized).toBe('<p>Hello</p><b>World</b>');
  });

  it('should allow safe tags like <b> and <i>', () => {
    const html = '<b>Bold</b> and <i>italic</i> text.';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('should handle empty or non-string input gracefully', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });
});
