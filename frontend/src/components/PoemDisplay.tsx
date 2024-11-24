import React from 'react';

import { WeatherPoem } from '../types/WeatherPoem';

interface PoemDisplayProps {
  poem: WeatherPoem | null;
}

const PoemDisplay: React.FC<PoemDisplayProps> = ({ poem }) => {
  if (!poem?.poem) {
    return null; // Don't render anything if there's no poem data
  }

  // Split the poem text into lines
  const lines = poem.poem.split('\n');

  return (
    <div className="poem-display">
      {' '}
      {/* Add a CSS class for styling */}
      <h2>Here is a poem for your weather:</h2>
      <div className="poem-text">
        {lines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    </div>
  );
};

export default PoemDisplay;
