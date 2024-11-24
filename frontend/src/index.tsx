import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css'; // Assuming you'll have a main CSS file named styles.css
import App from './App'; // Importing your main App component

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
