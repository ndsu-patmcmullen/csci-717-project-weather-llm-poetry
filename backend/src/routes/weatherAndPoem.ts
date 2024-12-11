import { WeatherPoem } from '../types/WeatherPoem';
import { Router, Request, Response } from 'express';
import { GeminiLlmService } from '../services/geminiLlmService';
import { WeatherService } from '../services/weatherService';
import { PromptGenerator } from '../utils/promptGenerator';
import { Cache } from '../cache';
import { GeocodingService } from '../services/geocodingService';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const router: Router = Router();
const geminiLlmService = new GeminiLlmService(
  new GoogleGenerativeAI(process.env.GEMINI_API_KEY),
);
const geocodingService = new GeocodingService();
const weatherService = new WeatherService(geocodingService);
const promptGenerator = new PromptGenerator();
const cache = new Cache();

/**
 * GET /weather-and-poem/:zipCode
 *
 * Fetches weather data and an AI-generated poem for the given zip code.
 *
 * @param zipCode The zip code to fetch data for. Must be a 5-digit number.
 * @returns A JSON response containing the weather and poem data.
 *          If successful: { temperature: number, condition: string, imageUrl: string, cityTown: string, poem: string }
 *          If error: { error: string }
 */
router.get(
  '/weather-and-poem/:zipCode',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const zipCode = req.params.zipCode;

      // Validate the zip code
      if (!/^\d{5}$/.test(zipCode)) {
        res
          .status(400)
          .json({ error: 'Invalid zip code format, please make 5 digits' });
        return;
      }

      const cacheKey = `weather-poem-${zipCode}`;

      // Check if the data is already in the cache
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      // Fetch weather data from Open-Meteo API
      const weatherData = await weatherService.getWeather(zipCode);

      // Generate the prompt using the fetched weather data
      const prompt = promptGenerator.generatePrompt(weatherData);

      // Generate the poem using the Gemini LLM
      const poem = await geminiLlmService.generatePoem(prompt);

      // Combine weather and poem data
      const weatherPoem: WeatherPoem = {
        temperature: weatherData.temperature,
        condition: weatherData.condition,
        imageUrl: weatherData.imageUrl,
        cityTown: weatherData.cityTown,
        poem: poem,
      };

      // Store the combined data in the cache
      cache.set(cacheKey, weatherPoem);

      res.json(weatherPoem);
    } catch (error) {
      console.error('Error in /api/weather-and-poem/:zipCode:', error);
      res
        .status(500)
        .json({ error: 'Failed to generate poem and weather data' });
    }
  },
);

export default router;
