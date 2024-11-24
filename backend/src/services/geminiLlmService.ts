import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

export class GeminiLlmService {
  private apiClient: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY environment variable');
    }

    this.apiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

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
