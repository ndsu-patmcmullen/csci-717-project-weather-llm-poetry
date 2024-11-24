import { WeatherPoem } from './types/WeatherPoem';

export class Cache {
  private cache: Map<string, { data: WeatherPoem; timestamp: number }>;

  constructor() {
    this.cache = new Map<string, { data: WeatherPoem; timestamp: number }>();
  }

  get(key: string): WeatherPoem | undefined {
    const cachedData = this.cache.get(key);
    if (cachedData) {
      const now = Date.now();
      const elapsedMinutes = (now - cachedData.timestamp) / (1000 * 60);

      if (elapsedMinutes >= 5) {
        this.cache.delete(key);
        return undefined;
      } else {
        return {
          temperature: cachedData.data.temperature,
          condition: cachedData.data.condition,
          imageUrl: cachedData.data.imageUrl,
          cityTown: cachedData.data.cityTown,
          poem: cachedData.data.poem,
        };
      }
    } else {
      return undefined;
    }
  }

  set(key: string, value: WeatherPoem): void {
    this.cache.set(key, { data: value, timestamp: Date.now() });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}
