// src/services/localLlmService.ts

import { LlmService } from './llmService';
import dotenv from 'dotenv';
dotenv.config();

export class LocalLlmService implements LlmService {
  private baseUrl: string;

  constructor() {
    // Falls back to LM Studio's default port if not defined in .env
    this.baseUrl = process.env.LOCAL_LLM_URL || 'http://localhost:1234';
  }

  /**
   * Dynamically query LM Studio to find out which model is currently loaded.
   */
  private async getActiveModel(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`);
      if (!response.ok) throw new Error('Local model registry unreachable');

      const data = await response.json();
      return data.data[0]?.id || 'local-model';
    } catch (error) {
      console.warn(
        'Could not query active local model, defaulting to "local-model":',
        error,
      );
      return 'local-model';
    }
  }

  /**
   * Generates a poem using LM Studio's OpenAI-compatible completions endpoint.
   */
  async generatePoem(prompt: string): Promise<string> {
    try {
      const activeModel = await this.getActiveModel();

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7, // Bit higher temp for creativity
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LM Studio error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const poem = data.choices?.[0]?.message?.content;

      if (!poem) {
        throw new Error('Empty response received from LM Studio');
      }

      return poem;
    } catch (error) {
      console.error('Error generating poem locally:', error);
      throw error;
    }
  }
}
