// groqService.js - Task breakdown using Groq API

import { ENV } from './env';

// Check if API key is configured
export function checkApiKeyStatus() {
  const hasKey = Boolean(ENV.GROQ_API_KEY);
  if (!hasKey) {
    console.error('Groq API key not found in environment variables');
  }
  return hasKey;
}

/**
 * Breaks down a task into smaller subtasks using Groq API
 * @param {string} taskTitle - The task to break down
 * @param {string} taskDescription - Optional additional context
 * @returns {Promise<Array<string>>} - Array of subtask titles
 */
export async function breakdownTask(taskTitle, taskDescription = '') {
  // Get fresh API key (in case it was just set in Settings)
  const envKey = import.meta.env.VITE_GROQ_API_KEY || '';
  const localKey = localStorage.getItem('GROQ_API_KEY') || '';
  const apiKey = (localKey || envKey).trim(); // Prefer localStorage over env
  
  // Debug API key (v2)
  console.log('=== API Key Debug v2 ===', new Date().toISOString());
  console.log('Has env key:', Boolean(envKey));
  console.log('Has local key:', Boolean(localKey));
  console.log('Final key length:', apiKey.length);
  console.log('Final key prefix:', apiKey.substring(0, 8) + '...');
  console.log('Key source:', envKey ? 'env' : localKey ? 'localStorage' : 'none');
  console.log('Raw local storage value:', localStorage.getItem('GROQ_API_KEY'));

  // Test API key validity first
  try {
    console.log('Testing API key validity...');
    const testResponse = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!testResponse.ok) {
      const errorData = await testResponse.text();
      console.error('API key test failed:', testResponse.status, errorData);
      throw new Error('Invalid API key. Please check your Groq API key in Settings.');
    }
    
    const modelsData = await testResponse.json();
    console.log('Available models:', modelsData.data?.map(m => m.id) || 'Unable to fetch');
  } catch (error) {
    console.error('API key validation failed:', error);
    throw new Error('Invalid API key. Please check your Groq API key in Settings.');
  }
  
  // Validate API key
  if (!apiKey) {
    throw new Error('Groq API key not configured. Please set your API key in Settings or add VITE_GROQ_API_KEY to your .env file.');
  }

  // Validate input
  if (!taskTitle || taskTitle.trim().length < 2) {
    throw new Error('Task title is too short to break down');
  }

  // Try different models in order of preference (most commonly available)
  const models = [
    'llama3-8b-8192',
    'llama3-70b-8192',
    'mixtral-8x7b-32768',
    'gemma-7b-it'
  ];

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: `Break down tasks into 3-5 actionable subtasks. 
Return ONLY a numbered list with no introduction or explanation.
Each subtask should be clear and specific.

Example output:
1. Research topic and gather resources
2. Create outline with main points
3. Write first draft
4. Review and edit
5. Finalize and format`
            },
            {
              role: 'user',
              content: `Task: ${taskTitle}${taskDescription ? `\nContext: ${taskDescription}` : ''}`
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        })
      });

      // Handle API errors
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Groq API error with model ${model}:`, response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Groq API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 400 && errorData.includes('model')) {
          // Model not available, try next one
          console.log(`Model ${model} not available, trying next...`);
          continue;
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      }

      // Parse response
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Extract subtasks from numbered list
      const subtasks = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => /^\d+[\.\)]\s*.+/.test(line)) // Match numbered items
        .map(line => line.replace(/^\d+[\.\)]\s*/, '')) // Remove numbering
        .filter(task => task.length > 0);

      // Validate results
      if (subtasks.length === 0) {
        console.log(`Model ${model} returned no valid subtasks, trying next...`);
        continue;
      }

      console.log(`Successfully generated subtasks with model: ${model}`);
      return subtasks;

    } catch (error) {
      // Re-throw API key errors immediately
      if (error.message.includes('API key')) {
        throw error;
      }
      
      // Log model-specific errors and continue to next model
      console.log(`Model ${model} failed:`, error.message);
      if (model === models[models.length - 1]) {
        // This was the last model, re-throw the error
        throw error;
      }
    }
  }

  // If we get here, all models failed
  throw new Error('Failed to break down task with any available model. Please try again later.');
}