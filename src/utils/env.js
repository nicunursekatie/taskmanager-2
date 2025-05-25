// Define a safe way to access environment variables that handles production builds
function safeEnv() {
  // In production builds, import.meta.env might be undefined or incomplete
  try {
    return {
      GROQ_API_KEY: typeof import.meta !== 'undefined' && 
                   import.meta.env && 
                   import.meta.env.VITE_GROQ_API_KEY || '',
      MODE: typeof import.meta !== 'undefined' && 
            import.meta.env && 
            import.meta.env.MODE || 'production'
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
    const userApiKey = localStorage.getItem('user_groq_api_key');
    const hasUserKey = Boolean(userApiKey);
    const hasEnvKey = Boolean(ENV.GROQ_API_KEY);
    
    console.log('Environment mode:', ENV.MODE);
    console.log('User API key available:', hasUserKey);
    console.log('Environment API key available:', hasEnvKey);
    console.log('Total API key length:', userApiKey ? userApiKey.length : (ENV.GROQ_API_KEY ? ENV.GROQ_API_KEY.length : 0));
  } catch (e) {
    console.error('Error in logEnvironment:', e);
  }
  
  const userApiKey = localStorage.getItem('user_groq_api_key');
  return {
    available: Boolean(userApiKey || ENV.GROQ_API_KEY),
    mode: ENV.MODE
  };
}

// Hard-coded fallback key - only used if environment variables fail
// This is not a good practice for real secrets, but can help with debugging
export const FALLBACK_GROQ_API_KEY = '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';