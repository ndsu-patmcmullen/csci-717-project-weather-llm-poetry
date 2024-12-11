import { fetchWeatherApi } from 'openmeteo';
import { WeatherPoem } from '../types/WeatherPoem';
import { weatherCodes } from '../utils/weatherCodes';
import { WeatherCode } from '../types/WeatherCode';
import { GeocodingService } from './geocodingService';

export class WeatherService {
  private geocodingService: GeocodingService;

  constructor(geocodingService: GeocodingService) {
    this.geocodingService = geocodingService;
  }

  /**
   * Fetches weather data for a given zip code using the Open-Meteo API.
   *
   * @param zipCode The zip code to fetch weather data for.
   * @returns A Promise that resolves to a WeatherPoem object containing the weather information.
   * @throws An error if the API request fails or if the location is not found.
   */
  async getWeather(zipCode: string): Promise<WeatherPoem> {
    try {
      // Fetch location data using GeocodingService
      const location = await this.geocodingService.getLocation(zipCode);

      // Fetch weather data using Open-Meteo API
      const params = {
        latitude: location.latitude,
        longitude: location.longitude,
        current: ['temperature_2m', 'weather_code'],
        temperature_unit: 'fahrenheit',
        wind_speed_unit: 'mph',
      };
      const openMeteoUrl = 'https://api.open-meteo.com/v1/forecast';
      const weatherResponses = await fetchWeatherApi(openMeteoUrl, params);
      const weatherResponse = weatherResponses[0];
      const current = weatherResponse.current()!;

      // Extract weather information
      const temperature = Math.round(current.variables(0)!.value());
      const weatherCode = current.variables(1)!.value().toString();
      const cityTown = location.name; // Extract city/town name

      // Determine day or night based on current time
      const now = new Date();
      // Consider 6 AM to 6 PM as day
      const isDay = now.getHours() >= 6 && now.getHours() < 18;

      // Get the weather condition and image URL from the weatherCodes object
      const condition = isDay
        ? (weatherCodes[weatherCode] as WeatherCode).day.description
        : (weatherCodes[weatherCode] as WeatherCode).night.description;
      const imageUrl = isDay
        ? (weatherCodes[weatherCode] as WeatherCode).day.image
        : (weatherCodes[weatherCode] as WeatherCode).night.image;

      return {
        temperature,
        condition,
        imageUrl,
        cityTown,
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }
}
