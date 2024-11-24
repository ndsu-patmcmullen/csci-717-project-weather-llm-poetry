import React from 'react';
import { WeatherPoem } from '../types/WeatherPoem';

interface WeatherDisplayProps {
  weather: WeatherPoem | null;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather }) => {
  if (!weather) {
    return null;
  }

  return (
    <div className="weather-display">
      <h2>Current Weather:</h2>
      <div className="weather-info">
        {weather.cityTown && <p>City/Town: {weather.cityTown}</p>}
        <p>Temperature: {weather.temperature}°F</p>
        <p>Condition: {weather.condition}</p>
      </div>
      {weather.imageUrl && ( // Conditionally render the image if imageUrl exists
        <div className="weather-graphic">
          <img src={weather.imageUrl} alt={weather.condition} />
        </div>
      )}
    </div>
  );
};

export default WeatherDisplay;
