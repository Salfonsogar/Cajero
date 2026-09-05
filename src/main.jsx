import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ATMProvider } from './context/ATMContext';
import App from './App';
import './App.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ATMProvider>
      <App />
    </ATMProvider>
  </StrictMode>
);
