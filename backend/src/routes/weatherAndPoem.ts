import { WeatherPoem } from '../types/WeatherPoem';
import { Router, Request, Response } from 'express';
import { GeminiLlmService } from '../services/geminiLlmService';
import { WeatherService } from '../services/weatherService'; // Import WeatherService
import { PromptGenerator } from '../utils/promptGenerator'; // Import PromptGenerator
import { Cache } from '../cache';

const router: Router = Router();
const geminiLlmService = new GeminiLlmService();
const weatherService = new WeatherService(); // Initialize WeatherService
const promptGenerator = new PromptGenerator(); // Initialize PromptGenerator
const cache = new Cache();

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

      const cacheKey = `weather-poem-${zipCode}`; // Include "weather" in the cache key

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
