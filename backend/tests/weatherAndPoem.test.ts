import { WeatherPoem } from '../src/types/WeatherPoem';
import request from 'supertest';
import express, { Application } from 'express'; // Import Express types
import weatherAndPoemRoutes from '../src/routes/weatherAndPoem';
import { GeocodingService } from '../src/services/geocodingService';
import { WeatherService } from '../src/services/weatherService';
import { GeminiLlmService } from '../src/services/geminiLlmService';
import { Cache } from '../src/cache';

jest.mock('../src/services/geocodingService');
jest.mock('../src/services/weatherService');
jest.mock('../src/services/geminiLlmService');
jest.mock('../src/cache');

describe('weatherAndPoem router', () => {
  let app: Application; // Declare app variable
  const mockGeocodingService = jest.mocked(GeocodingService.prototype);
  const mockWeatherService = jest.mocked(WeatherService.prototype);
  const mockGeminiLlmService = jest.mocked(GeminiLlmService.prototype);
  const mockCache = jest.mocked(Cache.prototype);

  beforeEach(() => {
    // Reset mocks before each test
    app = express();
    app.use(express.json());
    app.use('/api', weatherAndPoemRoutes);
    mockGeocodingService.getLocation.mockReset();
    mockWeatherService.getWeather.mockReset();
    mockGeminiLlmService.generatePoem.mockReset();
    mockCache.get.mockReset();
    mockCache.set.mockReset();
  });

  it('should return weather and poem data for a valid zip code', async () => {
    const zipCode = '10001';
    const mockWeatherPoem: WeatherPoem = {
      temperature: 65,
      condition: 'Sunny',
      imageUrl: 'http://openweathermap.org/img/wn/01d@2x.png',
      cityTown: 'New York',
      poem: 'A sunny day in New York...',
    };

    // Mock the service calls
    mockWeatherService.getWeather.mockResolvedValue({
      temperature: 65,
      condition: 'Sunny',
      imageUrl: 'http://openweathermap.org/img/wn/01d@2x.png',
      cityTown: 'New York',
    });
    mockGeminiLlmService.generatePoem.mockResolvedValue(
      mockWeatherPoem.poem as string,
    );

    const response = await request(app).get(`/api/weather-and-poem/${zipCode}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockWeatherPoem);
    expect(mockWeatherService.getWeather).toHaveBeenCalledWith(zipCode);
    expect(mockGeminiLlmService.generatePoem).toHaveBeenCalled();
    expect(mockCache.set).toHaveBeenCalledWith(
      `weather-poem-${zipCode}`,
      mockWeatherPoem,
    );
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
    expect(mockGeminiLlmService.generatePoem).not.toHaveBeenCalled();
  });

  it('should handle errors during weather fetching', async () => {
    const zipCode = '10001';

    mockWeatherService.getWeather.mockRejectedValue(
      new Error('Weather API error'),
    );

    const response = await request(app).get(`/api/weather-and-poem/${zipCode}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Failed to generate poem and weather data',
    });
  });

  it('should throw an error if the GEMINI_API_KEY is missing', () => {
    jest.mock('dotenv', () => ({
      config: jest.fn(),
    }));
    const originalApiKey = process.env.GEMINI_API_KEY;

    // Delete the API key from process.env
    delete process.env.GEMINI_API_KEY;

    jest.isolateModules(() => {
      expect(() => {
        // eslint-disable-next-line
        require('../src/routes/weatherAndPoem');
      }).toThrow('Missing GEMINI_API_KEY environment variable');
    });

    // Restore the original API key
    process.env.GEMINI_API_KEY = originalApiKey;
  });

  it('should handle errors during poem generation', async () => {
    const zipCode = '10001';

    mockGeminiLlmService.generatePoem.mockRejectedValue(
      new Error('Gemini API error'),
    );

    const response = await request(app).get(`/api/weather-and-poem/${zipCode}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Failed to generate poem and weather data',
    });
  });
});
