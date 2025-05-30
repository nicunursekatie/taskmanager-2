// groqService.js - Task breakdown using Groq API
import { ENV } from './env';

// Check if API key is configured (keep this function as is)
export function checkApiKeyStatus() {
  const hasKey = Boolean(ENV.GROQ_API_KEY);
  if (!hasKey) {
    console.error('Groq API key not found in environment variables');
  }
  return hasKey;
}

export async function breakdownTask(taskTitle, taskDescription = '') {
  console.log('[groqService] breakdownTask called with:', { taskTitle, taskDescription });
  console.log('[groqService] API Key from ENV:', ENV.GROQ_API_KEY ? ENV.GROQ_API_KEY.substring(0, 8) + '...' : 'Not available');

  // Validate API key
  if (!ENV.GROQ_API_KEY) {
    console.error('[groqService] Error: Groq API key not configured.');
    throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  // Validate input
  if (!taskTitle || taskTitle.trim().length < 2) {
    console.error('[groqService] Error: Task title too short.');
    throw new Error('Task title is too short to break down');
  }

  const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  const requestBody = {
    model: 'llama2-70b-4096',
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
  };
  
  const requestHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ENV.GROQ_API_KEY}`
  };

  console.log('[groqService] Fetching URL:', apiUrl);
  console.log('[groqService] Request Headers:', { ...requestHeaders, Authorization: requestHeaders.Authorization.substring(0, 15) + '...' }); // Log a truncated auth header
  console.log('[groqService] Request Body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestBody)
    });

    console.log('[groqService] Raw Response Status:', response.status);
    const responseText = await response.text(); // Get raw text first
    console.log('[groqService] Raw Response Text:', responseText);

    // Handle API errors
    if (!response.ok) {
      console.error('[groqService] Groq API error:', response.status, responseText);
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Groq API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    }

    // Parse response (assuming it's JSON after checking response.ok)
    const data = JSON.parse(responseText); // Parse from the text we already read
    console.log('[groqService] Parsed Response Data:', data);
    const content = data.choices?.[0]?.message?.content || '';
    console.log('[groqService] Extracted Content:', content);

    // Extract subtasks from numbered list
    const subtasks = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+[\.\)]\s*.+/.test(line)) // Match numbered items
      .map(line => line.replace(/^\d+[\.\)]\s*/, '')) // Remove numbering
      .filter(task => task.length > 0);
    console.log('[groqService] Extracted Subtasks:', subtasks);

    // Validate results
    if (subtasks.length === 0 && !content.startsWith('NEEDS_CLARIFICATION')) { // Adjusted condition slightly if clarification is a valid non-subtask response
        console.warn('[groqService] No subtasks extracted from content:', content);
        // Decide if this should be an error or if an empty list is acceptable for some API responses.
        // For now, keeping the original logic:
        throw new Error('Failed to generate subtasks. Please try again.');
    }
    
    return subtasks;

  } catch (error) {
    console.error('[groqService] Catch block error:', error);
    // Re-throw API key errors
    if (error.message.includes('API key')) {
      throw error;
    }
    
    // Log other errors and throw user-friendly message
    // console.error('Task breakdown error:', error); // Already logged by the line above
    throw new Error('Failed to break down task. Please check your connection and try again.');
  }
}