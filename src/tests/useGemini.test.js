/**
 * @file src/tests/useGemini.test.js
 * @description Vitest tests for the useGemini hook. This file tests the hook's interaction with the
 * Gemini API service, including successful message sending, caching, retry logic, and error handling.
 */
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useGemini } from '../hooks/useGemini';
import * as geminiService from '../services/geminiService';

// Mock the service
vi.mock('../services/geminiService');

describe('useGemini Hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Reset localStorage mock
    localStorage.clear();
    geminiService.runChat.mockClear();
  });

  it('initial state is correct', () => {
    const { result } = renderHook(() => useGemini());
    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('sendMessage successfully sends a message and receives a response', async () => {
    const mockResponse = 'This is a test response.';
    geminiService.runChat.mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.sendMessage('Test message', 'test-persona');
    });

    expect(geminiService.runChat).toHaveBeenCalledTimes(1);
    expect(result.current.messages.length).toBe(2);
    expect(result.current.messages[0]).toEqual({ role: 'user', parts: 'Test message' });
    expect(result.current.messages[1]).toEqual({ role: 'model', parts: mockResponse });
    expect(result.current.loading).toBe(false);
  });

  it('uses cached response for identical messages within the same session', async () => {
    geminiService.runChat.mockResolvedValue('Cached response');
    const { result } = renderHook(() => useGemini());

    // First call
    await act(async () => {
      await result.current.sendMessage('Repeat message', 'test-persona');
    });
    expect(geminiService.runChat).toHaveBeenCalledTimes(1);

    // Second call with same message
    await act(async () => {
      await result.current.sendMessage('Repeat message', 'test-persona');
    });
    // API should not be called again
    expect(geminiService.runChat).toHaveBeenCalledTimes(1);
    expect(result.current.messages.length).toBe(4); // 2 user, 2 model
  });

  it('handles API errors gracefully', async () => {
    const errorMessage = 'API call failed';
    geminiService.runChat.mockRejectedValue(new Error(errorMessage));
    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.sendMessage('This will fail', 'test-persona');
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
    // Only the user's message should be in the history
    expect(result.current.messages.length).toBe(1);
  });

  it('implements retry logic on failure', async () => {
    geminiService.runChat
      .mockRejectedValueOnce(new Error('First fail'))
      .mockRejectedValueOnce(new Error('Second fail'))
      .mockResolvedValue('Success on third try');

    const { result } = renderHook(() => useGemini());

    await act(async () => {
      await result.current.sendMessage('Retry test', 'test-persona');
    });

    // Called 3 times (1 initial + 2 retries)
    expect(geminiService.runChat).toHaveBeenCalledTimes(3);
    expect(result.current.messages[1].parts).toBe('Success on third try');
    expect(result.current.error).toBe(null);
  });
});
