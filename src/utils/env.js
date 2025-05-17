// Define all environment variables in one place
export const ENV = {
  GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY || '',
  MODE: import.meta.env.MODE || 'unknown'
};

// Debug utility for checking environment variables
export function logEnvironment() {
  console.log('Environment mode:', ENV.MODE);
  console.log('GROQ API key available:', Boolean(ENV.GROQ_API_KEY));
  console.log('GROQ API key length:', ENV.GROQ_API_KEY.length);
  
  // Don't log the actual key
}

// Hard-coded fallback key - only used if environment variables fail
// This is not a good practice for real secrets, but can help with debugging
export const FALLBACK_GROQ_API_KEY = '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';