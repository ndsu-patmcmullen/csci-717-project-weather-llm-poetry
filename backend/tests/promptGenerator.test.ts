import { PromptGenerator } from '../src/utils/promptGenerator';
import { WeatherPoem } from '../src/types/WeatherPoem';

describe('PromptGenerator', () => {
  let promptGenerator: PromptGenerator;

  beforeEach(() => {
    promptGenerator = new PromptGenerator();
  });

  it('should generate a prompt with weather data', () => {
    const weatherData: WeatherPoem = {
      temperature: 65,
      condition: 'Sunny',
      imageUrl: 'http://openweathermap.org/img/wn/01d@2x.png',
      cityTown: 'New York',
    };

    // Mock the Date object to control the date and time
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-11-23 10:00:00')); // Set date and time to November 23rd, 2024, 10:00 AM

    const prompt = promptGenerator.generatePrompt(weatherData);

    expect(prompt).toBe(
      'Write a short poem about the weather in New York during the month of November, in the morning. It is currently autumn in the year 2024. The weather is sunny with a temperature of 65°F.',
    );

    jest.useRealTimers(); // Restore the original Date object
  });
});
