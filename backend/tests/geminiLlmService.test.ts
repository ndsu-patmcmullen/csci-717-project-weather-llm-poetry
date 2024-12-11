import { GeminiLlmService } from '../src/services/geminiLlmService';
import { GoogleGenerativeAI } from '@google/generative-ai';

describe('GeminiLlmService', () => {
  let service: GeminiLlmService;
  let mockApiClient: GoogleGenerativeAI;

  beforeEach(() => {
    mockApiClient = {
      getGenerativeModel: jest.fn(),
    } as unknown as GoogleGenerativeAI;

    service = new GeminiLlmService(mockApiClient);
  });

  it('should generate a poem for a given prompt', async () => {
    const prompt = 'Write a short poem about the weather.';

    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () =>
          'The sun shines bright,\nClouds drift in the sky,\nA gentle breeze blows by.',
      },
    });
    mockApiClient.getGenerativeModel = jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    });

    const poem = await service.generatePoem(prompt);

    expect(poem).toBeDefined();
    expect(typeof poem).toBe('string');
    expect(poem).toBe(
      'The sun shines bright,\nClouds drift in the sky,\nA gentle breeze blows by.',
    );
  });

  it('should throw an error if the API request fails', async () => {
    const prompt = 'This will fail';

    mockApiClient.getGenerativeModel = jest.fn().mockImplementation(() => {
      throw new Error('API request failed');
    });

    await expect(service.generatePoem(prompt)).rejects.toThrow(
      'API request failed',
    );
  });
});
