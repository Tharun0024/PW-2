/**
 * @file src/tests/useTranslate.test.js
 * @description Vitest tests for the useTranslate hook. This file tests the hook's state management,
 * caching logic, and interaction with the mocked translateService.
 */
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTranslate, TranslateProvider } from '../hooks/useTranslate';
import * as translateService from '../services/translateService';

// Mock the service
vi.mock('../services/translateService');

const wrapper = ({ children }) => <TranslateProvider>{children}</TranslateProvider>;

describe('useTranslate Hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    translateService.translateText.mockClear();
  });

  it('initial language should be "en"', () => {
    const { result } = renderHook(() => useTranslate(), { wrapper });
    expect(result.current.currentLanguage).toBe('en');
  });

  it('setLanguage should update the currentLanguage state', () => {
    const { result } = renderHook(() => useTranslate(), { wrapper });
    act(() => {
      result.current.setLanguage('hi');
    });
    expect(result.current.currentLanguage).toBe('hi');
  });

  it('translateText should return cached result on second call', async () => {
    translateService.translateText.mockResolvedValue('नमस्ते');
    const { result } = renderHook(() => useTranslate(), { wrapper });

    await act(async () => {
      const res1 = await result.current.translateText('Hello', 'hi');
      expect(res1).toBe('नमस्ते');
    });
    expect(translateService.translateText).toHaveBeenCalledTimes(1);

    // Call again
    await act(async () => {
      const res2 = await result.current.translateText('Hello', 'hi');
      expect(res2).toBe('नमस्ते');
    });
    // Should not be called again because of cache
    expect(translateService.translateText).toHaveBeenCalledTimes(1);
  });

  it('translateText calls API only once per unique text+lang combination', async () => {
    translateService.translateText.mockResolvedValue('नमस्ते');
    const { result } = renderHook(() => useTranslate(), { wrapper });

    await act(async () => {
      await result.current.translateText('Hello', 'hi');
    });
    expect(translateService.translateText).toHaveBeenCalledTimes(1);
    
    translateService.translateText.mockResolvedValue('வணக்கம்');
    await act(async () => {
      await result.current.translateText('Hello', 'ta');
    });
    expect(translateService.translateText).toHaveBeenCalledTimes(2);
  });

  it('translateContent translates all strings in object', async () => {
    translateService.translateText
      .mockResolvedValueOnce('नमस्ते दुनिया')
      .mockResolvedValueOnce('यह एक परीक्षण है');
      
    const { result } = renderHook(() => useTranslate(), { wrapper });
    
    act(() => {
        result.current.setLanguage('hi');
    });

    const content = {
      title: 'Hello World',
      description: 'This is a test',
      count: 1,
    };

    let translatedContent;
    await act(async () => {
      translatedContent = await result.current.translateContent(content);
    });

    expect(translatedContent).toEqual({
      title: 'नमस्ते दुनिया',
      description: 'यह एक परीक्षण है',
      count: 1,
    });
    expect(translateService.translateText).toHaveBeenCalledTimes(2);
  });

  it('returns original text on API error', async () => {
    translateService.translateText.mockRejectedValue(new Error('API Error'));
    const { result } = renderHook(() => useTranslate(), { wrapper });

    let translatedText;
    await act(async () => {
      translatedText = await result.current.translateText('Hello', 'hi');
    });

    expect(translatedText).toBe('Hello');
    expect(result.current.error).toBe('Translation failed');
  });
});
