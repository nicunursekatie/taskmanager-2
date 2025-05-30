// Define a safe way to access environment variables that handles production builds
function safeEnv() {
  // In production builds, import.meta.env might be undefined or incomplete
  try {
    // Check both environment variables and localStorage
    const envKey = import.meta.env.VITE_GROQ_API_KEY || '';
    const localKey = localStorage.getItem('GROQ_API_KEY') || '';
    const rawKey = envKey || localKey;
    const apiKey = rawKey.trim();
    
    
    return {
      GROQ_API_KEY: apiKey,
      MODE: import.meta.env.MODE || 'production'
    };
  } catch (e) {
    // Error accessing environment variables
    return {
      GROQ_API_KEY: '',
      MODE: 'production'
    };
  }
}

// Define all environment variables in one place
export const ENV = safeEnv();

// Debug utility for checking environment variables
export function logEnvironment() {
  try {
    const apiKey = ENV.GROQ_API_KEY;
  } catch (e) {
  }
  
  const userApiKey = localStorage.getItem('user_groq_api_key');
  return {
    available: Boolean(userApiKey || ENV.GROQ_API_KEY),
    mode: ENV.MODE
  };
}

// Remove the fallback key since we're using environment variables
export const FALLBACK_GROQ_API_KEY = '';
