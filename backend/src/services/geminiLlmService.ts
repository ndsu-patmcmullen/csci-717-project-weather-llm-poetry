import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

export class GeminiLlmService {
  private apiClient: GoogleGenerativeAI;

  constructor(apiClient: GoogleGenerativeAI) {
    this.apiClient = apiClient;
  }

  /**
   * Generates a poem using the Gemini LLM based on the provided prompt.
   *
   * @param prompt The prompt to use for poem generation.
   * @returns A Promise that resolves to the generated poem as a string.
   * @throws An error if the API request fails.
   */
  async generatePoem(prompt: string): Promise<string> {
    try {
      const model: GenerativeModel = this.apiClient.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      const result = await model.generateContent(prompt);
      console.log(result);
      const poem: string = result.response.text();

      return poem;
    } catch (error) {
      console.error('Error generating poem:', error);
      throw error;
    }
  }
}
