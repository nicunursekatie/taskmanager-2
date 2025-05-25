// Define a safe way to access environment variables that handles production builds
function safeEnv() {
  // In production builds, import.meta.env might be undefined or incomplete
  try {
    // Check both environment variables and localStorage
    const envKey = import.meta.env.VITE_GROQ_API_KEY || '';
    const localKey = localStorage.getItem('GROQ_API_KEY') || '';
    const rawKey = envKey || localKey;
    const apiKey = rawKey.trim();
    
    // Log the environment for debugging
    console.log('Environment loaded:', {
      mode: import.meta.env.MODE || 'production',
      hasApiKey: Boolean(apiKey),
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 8) + '...',
      rawKeyLength: rawKey.length,
      hasWhitespace: rawKey !== rawKey.trim(),
      encoding: Buffer.from(apiKey).toString('base64').substring(0, 20) + '...',
      source: envKey ? 'env' : localKey ? 'localStorage' : 'none'
    });
    
    return {
      GROQ_API_KEY: apiKey,
      MODE: import.meta.env.MODE || 'production'
    };
  } catch (e) {
    console.warn('Error accessing environment variables:', e);
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
    console.log('Environment mode:', ENV.MODE);
    console.log('GROQ API key available:', Boolean(apiKey));
    console.log('GROQ API key length:', apiKey ? apiKey.length : 0);
    console.log('GROQ API key prefix:', apiKey ? apiKey.substring(0, 8) + '...' : 'none');
    console.log('GROQ API key encoding:', apiKey ? Buffer.from(apiKey).toString('base64').substring(0, 20) + '...' : 'none');
  } catch (e) {
    console.error('Error in logEnvironment:', e);
  }
  
  const userApiKey = localStorage.getItem('user_groq_api_key');
  return {
    available: Boolean(userApiKey || ENV.GROQ_API_KEY),
    mode: ENV.MODE
  };
}

// Remove the fallback key since we're using environment variables
export const FALLBACK_GROQ_API_KEY = '';