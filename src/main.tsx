import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

console.log('🎨 Main.tsx: Loading stylesheets...');
console.time('Main.tsx: Stylesheet loading');

import './index.css'
import App from './App'
import './includeCompactStyles';

console.log('🎨 Main.tsx: All stylesheets imported');
console.timeEnd('Main.tsx: Stylesheet loading');

console.log('🚀 Main.tsx: Starting React app render...');
console.time('Main.tsx: App render');

console.log('📄 Document ready state:', document.readyState);
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOMContentLoaded fired');
});
window.addEventListener('load', () => {
  console.log('📄 Window load fired');
});

document.addEventListener('DOMContentLoaded', () => {
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
  console.log('🎨 Found stylesheets:', stylesheets.length);
  stylesheets.forEach((sheet, index) => {
    if (sheet.tagName === 'LINK') {
      console.log(`🎨 Stylesheet ${index}:`, sheet.getAttribute('href'));
    }
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log('🚀 Main.tsx: React app render initiated');
console.timeEnd('Main.tsx: App render');
