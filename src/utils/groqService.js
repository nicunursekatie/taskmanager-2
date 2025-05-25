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
  // Validate API key
  if (!ENV.GROQ_API_KEY) {
    throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  // Validate input
  if (!taskTitle || taskTitle.trim().length < 2) {
    throw new Error('Task title is too short to break down');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENV.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama2-70b-4096',  // Try a different model
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
      console.error('Groq API error:', response.status, errorData);
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Groq API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
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
      throw new Error('Failed to generate subtasks. Please try again.');
    }

    return subtasks;

  } catch (error) {
    // Re-throw API key errors
    if (error.message.includes('API key')) {
      throw error;
    }
    
    // Log other errors and throw user-friendly message
    console.error('Task breakdown error:', error);
    throw new Error('Failed to break down task. Please check your connection and try again.');
  }
}