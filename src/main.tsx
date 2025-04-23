import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import './includeCompactStyles'; // 👈 forces styles into final build

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);