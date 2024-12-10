import React, { useState } from 'react';
import './styles.css';
import SvgLogo from './components/SvgLogo';
import ZipCodeInput from './components/ZipCodeInput';
import WeatherDisplay from './components/WeatherDisplay';
import PoemDisplay from './components/PoemDisplay';
import { WeatherPoem } from './types/WeatherPoem';

function App() {
  const [zipCode, setZipCode] = useState('');
  const [weatherPoem, setWeatherPoem] = useState<WeatherPoem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(true);

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
    setShowExplanation(false);
    fetchData(); // Call the fetchData function when the button is clicked
  };

  return (
    <div className="app-container">
      <div className="app-logo">
        <SvgLogo />
      </div>

      <ZipCodeInput zipCode={zipCode} onZipCodeChange={handleZipCodeChange} />

      <button onClick={handleSubmit} disabled={!zipCode || isLoading}>
        {isLoading ? 'Loading...' : 'Get Your Weather Poem'}
      </button>
      {showExplanation && (
        <div className="explanation">
          <p>Get a poem just for you based on the weather where you live.</p>
          <p>
            It&apos;s like magic, but it&apos;s actually really cool technology!
            ✨
          </p>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <WeatherDisplay weather={weatherPoem} />
      <PoemDisplay poem={weatherPoem} />
    </div>
  );
}

export default App;
