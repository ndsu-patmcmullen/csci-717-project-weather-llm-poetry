import { WeatherService } from '../src/services/weatherService';
import { GeocodingService } from '../src/services/geocodingService';

describe('WeatherService', () => {
  let service: WeatherService;
  let mockGeocodingService: GeocodingService;
  const zipCode = '10001';
  const mockLocationData = {
    id: 12345,
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    elevation: 10,
    feature_code: 'PPL',
    country_code: 'US',
    admin1_id: 6252001,
    timezone: 'America/New_York',
    population: 8405837,
    postcodes: ['10001'],
    country_id: 6252001,
    country: 'United States',
    admin1: 'New York',
  };

  beforeEach(() => {
    mockGeocodingService = {
      getLocation: jest.fn(),
    } as unknown as GeocodingService;

    service = new WeatherService(mockGeocodingService);
  });

  it('should fetch weather data for a given location (daytime)', async () => {
    mockGeocodingService.getLocation = jest
      .fn()
      .mockResolvedValue(mockLocationData);

    // Mock the fetchWeatherApi function
    const mockOpenMeteoResponse = {
      current: () => ({
        variables: (index: number) => ({
          value: () => (index === 0 ? 65 : 0),
        }),
      }),
    };
    // eslint-disable-next-line
    require('openmeteo').fetchWeatherApi = jest
      .fn()
      .mockResolvedValue([mockOpenMeteoResponse]);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-12-09 10:00:00')); // Set time to 10:00 AM

    const weatherData = await service.getWeather(zipCode);

    expect(weatherData).toBeDefined();
    expect(weatherData.temperature).toBe(65);
    expect(weatherData.condition).toBe('Sunny');
    expect(weatherData.imageUrl).toBe(
      'http://openweathermap.org/img/wn/01d@2x.png',
    );

    jest.useRealTimers();
  });

  it('should fetch weather data for a given location (nighttime)', async () => {
    mockGeocodingService.getLocation = jest
      .fn()
      .mockResolvedValue(mockLocationData);

    const mockOpenMeteoResponse = {
      current: () => ({
        variables: (index: number) => ({
          value: () => (index === 0 ? 65 : 0),
        }),
      }),
    };
    // eslint-disable-next-line
    require('openmeteo').fetchWeatherApi = jest
      .fn()
      .mockResolvedValue([mockOpenMeteoResponse]);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-12-09 22:00:00')); // Set time to 10:00 AM

    const weatherData = await service.getWeather(zipCode);

    expect(weatherData).toBeDefined();
    expect(weatherData.temperature).toBe(65);
    expect(weatherData.condition).toBe('Clear');
    expect(weatherData.imageUrl).toBe(
      'http://openweathermap.org/img/wn/01n@2x.png',
    );

    jest.useRealTimers();
  });

  it('should throw an error if getLocation fails', async () => {
    const zipCode = '10001';
    mockGeocodingService.getLocation = jest
      .fn()
      .mockRejectedValue(new Error('Geocoding failed'));
    await expect(service.getWeather(zipCode)).rejects.toThrow(
      'Geocoding failed',
    );
  });

  it('should throw an error if the Open-Meteo API request fails', async () => {
    const zipCode = '10001';
    const mockLocationData = {};
    mockGeocodingService.getLocation = jest
      .fn()
      .mockResolvedValue(mockLocationData);
    // eslint-disable-next-line
    require('openmeteo').fetchWeatherApi = jest
      .fn()
      .mockRejectedValue(new Error('Open-Meteo API failed'));
    await expect(service.getWeather(zipCode)).rejects.toThrow(
      'Open-Meteo API failed',
    );
  });
});
