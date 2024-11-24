import { WeatherPoem } from '../types/WeatherPoem';

export class PromptGenerator {
  generatePrompt(weatherData: WeatherPoem): string {
    // Get the current date and time
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const timeOfDay = this.getTimeOfDay(now);
    const season = this.getSeason(now);
    const year = now.getFullYear();

    const prompt =
      `Write a short poem about the weather in ${weatherData.cityTown} ` +
      `during the month of ${month}, in the ${timeOfDay}. ` +
      `It is currently ${season} in the year ${year}. ` +
      `The weather is ${weatherData.condition.toLowerCase()} ` +
      `with a temperature of ${weatherData.temperature}°F.`;

    console.log(prompt);

    return prompt;
  }

  private getTimeOfDay(date: Date): string {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 17) {
      return 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'evening';
    } else {
      return 'night';
    }
  }

  private getSeason(date: Date): string {
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    if (month >= 3 && month <= 5) {
      return 'spring';
    } else if (month >= 6 && month <= 8) {
      return 'summer';
    } else if (month >= 9 && month <= 11) {
      return 'autumn';
    } else {
      return 'winter';
    }
  }
}
