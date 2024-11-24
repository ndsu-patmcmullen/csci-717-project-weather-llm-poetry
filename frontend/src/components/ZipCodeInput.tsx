import React from 'react';

interface ZipCodeInputProps {
  zipCode: string;
  onZipCodeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ZipCodeInput: React.FC<ZipCodeInputProps> = ({
  zipCode,
  onZipCodeChange,
}) => {
  return (
    <div className="zip-code-input">
      {' '}
      {/* Add a CSS class for styling */}
      <input
        type="text"
        placeholder="Enter your zip code"
        value={zipCode}
        onChange={onZipCodeChange}
      />
    </div>
  );
};

export default ZipCodeInput;
