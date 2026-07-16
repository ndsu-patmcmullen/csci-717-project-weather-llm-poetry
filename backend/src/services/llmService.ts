export interface LlmService {
  generatePoem(prompt: string): Promise<string>;
}
