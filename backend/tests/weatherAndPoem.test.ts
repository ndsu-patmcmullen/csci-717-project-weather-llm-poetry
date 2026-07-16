import { WeatherPoem } from '../src/types/WeatherPoem';
import request from 'supertest';
import express, { Application } from 'express';
import { GeocodingService } from '../src/services/geocodingService';
import { WeatherService } from '../src/services/weatherService';
import { GeminiLlmService } from '../src/services/geminiLlmService';
import { LocalLlmService } from '../src/services/localLlmService';
import { Cache } from '../src/cache';

jest.mock('../src/services/geocodingService');
jest.mock('../src/services/weatherService');
jest.mock('../src/services/geminiLlmService');
jest.mock('../src/services/localLlmService');
jest.mock('../src/cache');

describe('weatherAndPoem router', () => {
  const mockGeocodingService = jest.mocked(GeocodingService.prototype);
  const mockWeatherService = jest.mocked(WeatherService.prototype);
  const mockGeminiLlmService = jest.mocked(GeminiLlmService.prototype);
  const mockLocalLlmService = jest.mocked(LocalLlmService.prototype);
  const mockCache = jest.mocked(Cache.prototype);

  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  beforeEach(() => {
    mockGeocodingService.getLocation.mockReset();
    mockWeatherService.getWeather.mockReset();
    mockGeminiLlmService.generatePoem.mockReset();
    mockLocalLlmService.generatePoem.mockReset();
    mockCache.get.mockReset();
    mockCache.set.mockReset();
  });

  /**
   * Helper utility to dynamically load a fresh router config
   */
  function setupApp(envOverrides: Record<string, string | undefined>): Application {
    Object.entries(envOverrides).forEach(([key, val]) => {
      if (val === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = val;
      }
    });

    const appInstance = express();
    appInstance.use(express.json());

    // Force Node to re-compile the router module with new env vars
    jest.isolateModules(() => {
      const weatherAndPoemRoutes = require('../src/routes/weatherAndPoem').default;
      appInstance.use('/api', weatherAndPoemRoutes);
    });

    return appInstance;
  }

  describe('when USE_LOCAL_LLM is true', () => {
    let app: Application;

    beforeEach(() => {
      app = setupApp({ USE_LOCAL_LLM: 'true' });
    });

    it('should return weather and poem data using the local service', async () => {
      const zipCode = '10001';
      const mockWeatherPoem: WeatherPoem = {
        temperature: 65,
        condition: 'Sunny',
        imageUrl: 'http://openweathermap.org/img/wn/01d@2x.png',
        cityTown: 'New York',
        poem: 'A sunny day in New York...',
      };

      mockWeatherService.getWeather.mockResolvedValue({
        temperature: 65,
        condition: 'Sunny',
        imageUrl: 'http://openweathermap.org/img/wn/01d@2x.png',
        cityTown: 'New York',
      });
      mockLocalLlmService.generatePoem.mockResolvedValue(mockWeatherPoem.poem as string);

      const response = await request(app).get(`/api/weather-and-poem/${zipCode}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockWeatherPoem);
      expect(mockWeatherService.getWeather).toHaveBeenCalledWith(zipCode);

      expect(mockLocalLlmService.generatePoem).toHaveBeenCalled();
      expect(mockGeminiLlmService.generatePoem).not.toHaveBeenCalled();
      
      expect(mockCache.set).toHaveBeenCalledWith(
        `weather-poem-local-${zipCode}`,
        mockWeatherPoem,
      );
    });
  });

  describe('when USE_LOCAL_LLM is false', () => {
    let app: Application;

    beforeEach(() => {
      app = setupApp({ 
        USE_LOCAL_LLM: 'false', 
        GEMINI_API_KEY: 'mock-gemini-key' 
      });
    });

    it('should return weather and poem data using the Gemini service', async () => {
      const zipCode = '10001';
      const mockWeatherPoem: WeatherPoem = {
        temperature: 65,
        condition: 'Sunny',
        imageUrl: 'http://openweathermap.org/img/wn/01d@2x.png',
        cityTown: 'New York',
        poem: 'A sunny day in New York...',
      };

      mockWeatherService.getWeather.mockResolvedValue({
        temperature: 65,
        condition: 'Sunny',
        imageUrl: 'http://openweathermap.org/img/wn/01d@2x.png',
        cityTown: 'New York',
      });
      mockGeminiLlmService.generatePoem.mockResolvedValue(mockWeatherPoem.poem as string);

      const response = await request(app).get(`/api/weather-and-poem/${zipCode}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockWeatherPoem);
      expect(mockWeatherService.getWeather).toHaveBeenCalledWith(zipCode);
      
      expect(mockGeminiLlmService.generatePoem).toHaveBeenCalled();
      expect(mockLocalLlmService.generatePoem).not.toHaveBeenCalled();

      expect(mockCache.set).toHaveBeenCalledWith(
        `weather-poem-gemini-${zipCode}`,
        mockWeatherPoem,
      );
    });
  });

  describe('common behaviors', () => {
    let app: Application;

    beforeEach(() => {
      app = setupApp({ USE_LOCAL_LLM: 'true' });
    });

    it('should return an error for an invalid zip code', async () => {
      const zipCode = 'invalid';
      const response = await request(app).get(`/api/weather-and-poem/${zipCode}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid zip code format, please make 5 digits',
      });
    });

    it('should return cached data if available', async () => {
      const zipCode = '10001';
      const mockWeatherPoem: WeatherPoem = {
        temperature: 65,
        condition: 'Sunny',
        imageUrl: 'http://openweathermap.org/img/wn/01d@2x.png',
        cityTown: 'New York',
        poem: 'A sunny day in New York...',
      };

      mockCache.get.mockReturnValue(mockWeatherPoem);

      const response = await request(app).get(`/api/weather-and-poem/${zipCode}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockWeatherPoem);
      expect(mockWeatherService.getWeather).not.toHaveBeenCalled();
    });

    it('should handle errors during weather fetching', async () => {
      const zipCode = '10001';
      mockWeatherService.getWeather.mockRejectedValue(new Error('Weather API error'));

      const response = await request(app).get(`/api/weather-and-poem/${zipCode}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to generate poem and weather data',
      });
    });
  });

  describe('routing initialization guards', () => {
    it('should throw an error if the GEMINI_API_KEY is missing and USE_LOCAL_LLM is false', () => {
      process.env.GEMINI_API_KEY = undefined;
      process.env.USE_LOCAL_LLM = 'false';

      jest.isolateModules(() => {
        expect(() => {
          require('../src/routes/weatherAndPoem');
        }).toThrow('Missing GEMINI_API_KEY environment variable');
      });
    });
  });
});
