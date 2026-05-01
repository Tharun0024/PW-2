/**
 * @file Tests for the Gemini service.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateElectionResponse } from '../services/geminiService';
import { memoryCache } from '../utils/cache';

// Mock the entire @google/generative-ai module
vi.mock('@google/generative-ai', () => {
  const mockChat = {
    sendMessage: vi.fn(),
  };
  const mockModel = {
    startChat: vi.fn(() => mockChat),
  };
  const mockGenAI = {
    getGenerativeModel: vi.fn(() => mockModel),
  };
  return {
    GoogleGenerativeAI: vi.fn(() => mockGenAI),
  };
});

// We need to get the mocked instances to control them in tests
const { GoogleGenerativeAI } = await import('@google/generative-ai');
const genAI = new GoogleGenerativeAI();
const model = genAI.getGenerativeModel();
const chat = model.startChat();


describe('Gemini Service', () => {
  const persona = { id: 'TEST', geminiSystemPrompt: 'Test prompt' };

  beforeEach(() => {
    vi.clearAllMocks();
    memoryCache.clear();
  });

  it('should use cache on repeated identical calls', async () => {
    const userMessage = 'Hello';
    const aiResponse = 'Hi there!';
    chat.sendMessage.mockResolvedValueOnce({
      response: { text: () => aiResponse },
    });

    // First call - should call the API
    await generateElectionResponse(userMessage, persona, []);
    expect(chat.sendMessage).toHaveBeenCalledTimes(1);

    // Second call - should hit the cache
    const response = await generateElectionResponse(userMessage, persona, []);
    expect(chat.sendMessage).toHaveBeenCalledTimes(1); // Not called again
    expect(response).toBe(aiResponse);
  });

  it('should retry on API failure', async () => {
    const userMessage = 'Test retry';
    const finalResponse = 'Success after retry';

    chat.sendMessage
      .mockRejectedValueOnce(new Error('API Error')) // First call fails
      .mockResolvedValueOnce({ response: { text: () => finalResponse } }); // Second call succeeds

    const response = await generateElectionResponse(userMessage, persona, []);

    expect(chat.sendMessage).toHaveBeenCalledTimes(2);
    expect(response).toBe(finalResponse);
  });

  it('should throw an error after all retries fail', async () => {
    const userMessage = 'Test failure';

    chat.sendMessage.mockRejectedValue(new Error('Persistent API Error'));

    await expect(generateElectionResponse(userMessage, persona, [])).rejects.toThrow(
      'Failed to get a response from the AI after multiple retries.'
    );
    expect(chat.sendMessage).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('should handle successful API call correctly', async () => {
    const userMessage = 'Successful call';
    const expectedResponse = 'This is a success.';
    chat.sendMessage.mockResolvedValue({
      response: { text: () => expectedResponse },
    });

    const response = await generateElectionResponse(userMessage, persona, []);
    expect(response).toBe(expectedResponse);
    expect(chat.sendMessage).toHaveBeenCalledWith(userMessage);
  });
});
