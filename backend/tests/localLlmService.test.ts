import { LocalLlmService } from '../src/services/localLlmService';

describe('LocalLlmService', () => {
  let service: LocalLlmService;
  let fetchSpy: jest.SpyInstance;
  let originalEnvUrl: string | undefined;

  beforeAll(() => {
    originalEnvUrl = process.env.LOCAL_LLM_URL;
  });

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
    service = new LocalLlmService();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    process.env.LOCAL_LLM_URL = originalEnvUrl;
  });

  it('should successfully generate a poem', async () => {
    const prompt = 'Write a poem about the sea.';
    const expectedPoem = 'The waves crash low,\nThe water blue...';

    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ id: 'loaded-llama-3' }] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: expectedPoem } }],
        }),
      } as Response);

    const result = await service.generatePoem(prompt);

    expect(result).toBe(expectedPoem);
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const [, options] = fetchSpy.mock.calls[1];
    expect(JSON.parse(options?.body as string)).toEqual({
      model: 'loaded-llama-3',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
  });

  it('should fall back to "local-model" if model retrieval fails entirely (API error)', async () => {
    const prompt = 'Test prompt';
    const expectedPoem = 'Fallback model poem';

    fetchSpy
      .mockResolvedValueOnce({
        ok: false,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: expectedPoem } }],
        }),
      } as Response);

    const result = await service.generatePoem(prompt);

    expect(result).toBe(expectedPoem);
    
    const [, options] = fetchSpy.mock.calls[1];
    expect(JSON.parse(options?.body as string).model).toBe('local-model');
  });

  it('should default to "local-model" if /v1/models returns an empty list', async () => {
    const prompt = 'Test empty model list';
    const expectedPoem = 'Fallback poem';

    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: expectedPoem } }],
        }),
      } as Response);

    await service.generatePoem(prompt);

    const [, options] = fetchSpy.mock.calls[1];
    expect(JSON.parse(options?.body as string).model).toBe('local-model');
  });

  it('should throw an error if the completions endpoint returns a non-OK response', async () => {
    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ id: 'loaded-llama-3' }] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);

    await expect(service.generatePoem('Fail me')).rejects.toThrow(
      'LM Studio error: 500 - Internal Server Error'
    );
  });

  it('should throw an error if choices is completely missing from response', async () => {
    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ id: 'loaded-llama-3' }] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Missing 'choices' entirely
      } as Response);

    await expect(service.generatePoem('Fail format')).rejects.toThrow(
      'Empty response received from LM Studio'
    );
  });

  it('should throw an error if choices array is empty', async () => {
    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ id: 'loaded-llama-3' }] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [] }), // Empty choices list
      } as Response);

    await expect(service.generatePoem('Fail format')).rejects.toThrow(
      'Empty response received from LM Studio'
    );
  });

  it('should throw an error if message is missing from choice response', async () => {
    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ id: 'loaded-llama-3' }] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{}] }), // Missing 'message'
      } as Response);

    await expect(service.generatePoem('Fail format')).rejects.toThrow(
      'Empty response received from LM Studio'
    );
  });

  it('should throw an error if content is missing from message response', async () => {
    fetchSpy
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ id: 'loaded-llama-3' }] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: {} }] }), // Missing 'content'
      } as Response);

    await expect(service.generatePoem('Fail format')).rejects.toThrow(
      'Empty response received from LM Studio'
    );
  });

  // --- Configuration / Environment Tests ---

  it('should fall back to the default LM Studio URL when LOCAL_LLM_URL is undefined', () => {
    delete process.env.LOCAL_LLM_URL;
    const localService = new LocalLlmService();
    
    expect((localService as any).baseUrl).toBe('http://localhost:1234');
  });

  it('should adopt custom URL when LOCAL_LLM_URL is defined', () => {
    process.env.LOCAL_LLM_URL = 'http://192.168.1.50:9999';
    const localService = new LocalLlmService();
    
    expect((localService as any).baseUrl).toBe('http://192.168.1.50:9999');
  });
});