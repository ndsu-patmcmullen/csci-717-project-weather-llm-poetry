import React, { useState } from 'react';
import './styles.css';
import ZipCodeInput from './components/ZipCodeInput';
import WeatherDisplay from './components/WeatherDisplay';
import PoemDisplay from './components/PoemDisplay';
import { WeatherPoem } from './types/WeatherPoem';

function App() {
  const [zipCode, setZipCode] = useState('');
  const [weatherPoem, setWeatherPoem] = useState<WeatherPoem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (zipCode) {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/weather-and-poem/${zipCode}`);
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setWeatherPoem(data);
      } catch (err) {
        setError(`Error while fetching: ${err}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleZipCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZipCode(event.target.value);
  };

  const handleSubmit = () => {
    fetchData(); // Call the fetchData function when the button is clicked
  };

  return (
    <div className="app-container">
      <h1>Rain or Shine LLM Poetry</h1>

      <ZipCodeInput zipCode={zipCode} onZipCodeChange={handleZipCodeChange} />

      <button onClick={handleSubmit} disabled={!zipCode || isLoading}>
        {isLoading ? 'Loading...' : 'Generate Poem'}
      </button>

      {isLoading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      <WeatherDisplay weather={weatherPoem} />
      <PoemDisplay poem={weatherPoem} />
    </div>
  );
}

export default App;
