import { Cache } from '../src/cache';
import { WeatherPoem } from '../src/types/WeatherPoem';

describe('Cache', () => {
  let cache: Cache;
  const weatherPoem: WeatherPoem = {
    temperature: 65,
    condition: 'Sunny',
    imageUrl: 'http://openweathermap.org/img/wn/01d@2x.png',
    cityTown: 'New York',
    poem: 'A sunny day in New York,\nThe birds are singing in the park.\nA perfect day for a stroll.',
  };

  beforeEach(() => {
    cache = new Cache();
  });

  it('should store and retrieve a WeatherPoem object', () => {
    const key = 'test-key';
    cache.set(key, weatherPoem);
    const retrievedWeatherPoem = cache.get(key);

    expect(retrievedWeatherPoem).toBeDefined();
    expect(retrievedWeatherPoem).toEqual(weatherPoem); // Check if the objects are equal
  });

  it('should return undefined if the key is not found', () => {
    const key = 'non-existent-key';
    const retrievedWeatherPoem = cache.get(key);

    expect(retrievedWeatherPoem).toBeUndefined();
  });

  it('should delete a cached entry', () => {
    const key = 'test-key';
    cache.set(key, weatherPoem);
    const deleted = cache.delete(key);

    expect(deleted).toBe(true); // Check if the entry was deleted
    expect(cache.get(key)).toBeUndefined(); // Check if the entry is no longer accessible
  });

  it('should invalidate a cached entry after 5 minutes', () => {
    const key = 'test-key';
    cache.set(key, weatherPoem);

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-12-09 10:00:00')); // Set initial time
    cache.set(key, weatherPoem);

    jest.advanceTimersByTime(5 * 60 * 1000 + 1); // Advance time by 5 minutes and 1 millisecond

    const retrievedWeatherPoem = cache.get(key);

    expect(retrievedWeatherPoem).toBeUndefined(); // The entry should be invalidated

    jest.useRealTimers(); // Restore the original Date object
  });

  it('should not invalidate a cached entry before 5 minutes', () => {
    const key = 'test-key';
    cache.set(key, weatherPoem);

    // Mock the Date.now() method to simulate time passing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-12-09 10:00:00'));
    cache.set(key, weatherPoem);

    jest.advanceTimersByTime(5 * 60 * 1000 - 1); // Advance time by 5 minutes minus 1 millisecond

    const retrievedWeatherPoem = cache.get(key);

    expect(retrievedWeatherPoem).toBeDefined(); // The entry should still be valid
    expect(retrievedWeatherPoem).toEqual(weatherPoem);

    jest.useRealTimers();
  });
});
