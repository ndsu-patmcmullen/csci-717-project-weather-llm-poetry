import { PromptGenerator } from '../src/utils/promptGenerator';
import { WeatherPoem } from '../src/types/WeatherPoem';

describe('PromptGenerator', () => {
  let promptGenerator: PromptGenerator;
  const weatherData: WeatherPoem = {
    temperature: 65,
    condition: 'Sunny',
    imageUrl: 'http://openweathermap.org/img/wn/01d@2x.png',
    cityTown: 'New York',
  };

  beforeEach(() => {
    promptGenerator = new PromptGenerator();
  });

  it('should generate a prompt with weather data', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-11-23 10:00:00')); // November 23rd, 2024, 10:00 AM

    const prompt = promptGenerator.generatePrompt(weatherData);

    expect(prompt).toBe(
      'Write a short poem about the weather in New York during the month of November, in the morning. It is currently autumn in the year 2024. The weather is sunny with a temperature of 65°F.',
    );

    jest.useRealTimers();
  });

  it('should generate a prompt with weather data (afternoon, spring)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-04-15 14:00:00')); // April 15th, 2:00 PM
    const prompt = promptGenerator.generatePrompt(weatherData);
    expect(prompt).toBe(
      'Write a short poem about the weather in New York during the month of April, in the afternoon. It is currently spring in the year 2024. The weather is sunny with a temperature of 65°F.',
    );
    jest.useRealTimers();
  });

  it('should generate a prompt with weather data (evening, summer)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-07-15 19:00:00')); // July 15th, 7:00 PM
    const prompt = promptGenerator.generatePrompt(weatherData);
    expect(prompt).toBe(
      'Write a short poem about the weather in New York during the month of July, in the evening. It is currently summer in the year 2024. The weather is sunny with a temperature of 65°F.',
    );
    jest.useRealTimers();
  });

  it('should generate a prompt with weather data (night, winter)', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15 02:00:00')); // January 15th, 2:00 AM
    const prompt = promptGenerator.generatePrompt(weatherData);
    expect(prompt).toBe(
      'Write a short poem about the weather in New York during the month of January, in the night. It is currently winter in the year 2024. The weather is sunny with a temperature of 65°F.',
    );
    jest.useRealTimers();
  });
});
