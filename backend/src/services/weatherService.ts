import { fetchWeatherApi } from 'openmeteo';
import { WeatherPoem } from '../types/WeatherPoem';
import { weatherCodes } from '../utils/weatherCodes'; // Import weatherCodes
import { WeatherCode } from '../types/WeatherCode';

export class WeatherService {
  async getWeather(zipCode: string): Promise<WeatherPoem> {
    try {
      // 1. Fetch latitude and longitude for the zip code
      const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${zipCode}&count=10&language=en&format=json`;
      const geocodingResponse = await fetch(geocodingUrl);
      if (!geocodingResponse.ok) {
        throw new Error(
          `Geocoding API request failed with status ${geocodingResponse.status}`,
        );
      }
      const geocodingData = await geocodingResponse.json();

      // Find the first US result with the matching zip code
      const location = geocodingData.results.find(
        (result: { country_code: string; postcodes: string | string[] }) =>
          result.country_code === 'US' && result.postcodes.includes(zipCode),
      );
      if (!location) {
        throw new Error(`Location not found for zip code ${zipCode}`);
      }

      // 2. Fetch weather data using Open-Meteo API
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
      const isDay = now.getHours() >= 6 && now.getHours() < 18; // Consider 6 AM to 6 PM as day

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
