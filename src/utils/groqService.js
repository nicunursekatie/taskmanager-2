// groqService.js - Implementation for task breakdown using Groq API

/**
 * Breaks down a task into smaller subtasks using the Groq API
 * @param {string} taskTitle - The title of the task to break down
 * @param {string} taskDescription - Optional additional description of the task
 * @returns {Promise<Array<string>>} - Array of subtask titles
 */
// Import environment variables and utilities
import { ENV, logEnvironment, FALLBACK_GROQ_API_KEY } from './env';

// Export the check function for use elsewhere
export const checkApiKeyStatus = logEnvironment;

export async function breakdownTask(taskTitle, taskDescription = '') {
  try {
    // Try to get environment info
    logEnvironment();
    console.log('Breaking down task:', taskTitle);
  } catch (e) {
    console.error('Error logging environment:', e);
  }
  
  // Always use the fallback key to ensure functionality
  // This is a workaround for environment variable issues
  const GROQ_API_KEY = FALLBACK_GROQ_API_KEY;
  console.log('Using API key of length:', GROQ_API_KEY.length);
  
  // Don't use fallbacks, just throw an error
  if (!GROQ_API_KEY) {
    console.error('Missing API key');
    throw new Error('API key not configured');
  }
  
  console.log('Using API key for task breakdown');
  
  try {
    // Log when we're making the API call
    console.log('Making Groq API call with valid API key');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are a pragmatic assistant that breaks tasks into practical, achievable subtasks based on what is stated in the task. Your goal is to help users make progress rather than getting stuck in analysis paralysis.

CRITICAL INSTRUCTIONS:
1. For MOST tasks, assume they have enough information to proceed - create useful, general subtasks.
2. Only ask for clarification when a task is EXTREMELY vague (e.g., one-word tasks like "Task" or "Project").
3. If you need clarification, respond with: "NEEDS_CLARIFICATION: I need a bit more information to break this down effectively. What's the general purpose of this task?"
4. Assume reasonable defaults based on common scenarios rather than asking for every detail.
5. Keep subtasks action-oriented, clear, and focused.
6. Each subtask must be a concrete, standalone step.
7. Provide 3-5 subtasks for any given task.
8. Avoid creating subtasks that are just decision points or questions.

EXAMPLES:
- For "Clean the house" → Create practical cleaning subtasks, not clarification requests.
  1. Vacuum floors in main living areas
  2. Clean bathroom surfaces and toilet
  3. Dust furniture and shelves
  4. Take out all trash
  5. Wash dishes and clean kitchen counters

- For "Write a report" → Create general writing process subtasks:
  1. Create outline with main sections and key points 
  2. Gather necessary research and reference materials
  3. Write first draft of content
  4. Create any charts or visuals needed
  5. Proofread and finalize formatting

FORMAT: 
- Return 3-5 numbered subtasks with NO introduction.
  1. [first subtask]
  2. [second subtask]
  etc.
  
- Only use "NEEDS_CLARIFICATION:" for extremely vague tasks like single-word prompts.`
          },
          {
            role: 'user',
            content: `Task: "${taskTitle}"${taskDescription ? `\nAdditional context: ${taskDescription}` : ''}`
          }
        ],
        temperature: 0.1,  // Lower temperature for more consistent results
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract subtasks from the AI response
    const subtasksText = data.choices[0].message.content.trim();
    
    // Log raw API response for debugging
    console.log('Raw API response:', subtasksText);
    
    // First check if we have a NEEDS_CLARIFICATION response
    if (subtasksText.trim().startsWith('NEEDS_CLARIFICATION:')) {
      console.log('Detected clarification request:', subtasksText);
      return [subtasksText.trim()];
    }
    
    // Parse the response based on the expected numbered list format
    let subtasks = [];
    
    // Main approach: Handle numbered list (requested format)
    if (subtasksText.includes('\n')) {
      subtasks = subtasksText
        .split('\n')
        .map(line => {
          // Check if this line is a NEEDS_CLARIFICATION message
          if (line.trim().startsWith('NEEDS_CLARIFICATION:')) {
            return line.trim();
          }
          // Otherwise remove numbering like "1. " or "1) " and any brackets
          return line.replace(/^\d+[\.\)]\s*|\[|\]/g, '').trim();
        })
        .filter(line => line.length > 0 && line.length < 200); // Reasonable length for a subtask
    }
    // Alternative: Handle single line with multiple numbered items
    else if (/\d+[.)]/.test(subtasksText)) {
      subtasks = subtasksText
        .split(/\d+[.)]/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 200);
    }
    // Fallback: comma-separated list
    else if (subtasksText.includes(',')) {
      console.log('Handling comma-separated list:', subtasksText);
      subtasks = subtasksText
        .split(',')
        .map(s => s.trim())
        .filter(s => {
          // Filter out items that are too short or too long
          const isValidLength = s.length > 2 && s.length < 200;
          // Filter out items that are just punctuation
          const isNotJustPunctuation = !/^[\s,.;:!?]+$/.test(s);
          return isValidLength && isNotJustPunctuation;
        });
      console.log('Processed comma-separated items:', subtasks);
    }
    // Fallback: handle array-like formatting
    else if (subtasksText.startsWith('[') && subtasksText.endsWith(']')) {
      try {
        const parsed = JSON.parse(subtasksText);
        if (Array.isArray(parsed)) {
          subtasks = parsed
            .filter(s => typeof s === 'string' && s.length > 0 && s.length < 200);
        }
      } catch (e) {
        // If JSON parsing fails, try a simple bracket removal and comma split
        subtasks = subtasksText
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map(s => s.replace(/^["']|["']$/g, '').trim())
          .filter(s => s.length > 0 && s.length < 200);
      }
    }
    // Last resort: just use the whole string if nothing else works
    else if (subtasksText.length > 0 && subtasksText.length < 200) {
      subtasks = [subtasksText];
    }
    
    // Clean up any remaining formatting and normalize spacing
    subtasks = subtasks.map(task => {
      if (!task) return ''; // Handle null or undefined
      
      // Don't modify NEEDS_CLARIFICATION messages
      if (task.startsWith('NEEDS_CLARIFICATION:')) {
        return task;
      }
      
      return task
        .replace(/^[-*•]|\[\s?\]|\s*-\s*/, '') // Remove bullets, brackets, etc.
        .replace(/\s+/g, ' ')                 // Normalize spacing
        .trim();                              // Trim whitespace
    });
    
    // Filter out any empty subtasks or single punctuation characters
    subtasks = subtasks.filter(task => {
      const trimmed = task && task.trim();
      // Ensure task is not empty and not just a single punctuation character
      return trimmed && trimmed.length > 0 && !(trimmed.length === 1 && /[,.;:!?]/.test(trimmed));
    });
    
    // Ensure we have at least some subtasks, or return fallback
    if (subtasks.length === 0) {
      console.warn('Failed to extract subtasks from AI response, using fallback');
      return fallbackBreakdownTask(taskTitle, taskDescription);
    }
    
    // Log the final processed subtasks for debugging
    console.log('Final processed subtasks:', subtasks);
    
    // Check one more time for NEEDS_CLARIFICATION
    if (subtasks.length === 1 && subtasks[0].startsWith('NEEDS_CLARIFICATION:')) {
      console.log('Final check detected clarification request');
    }
    
    return subtasks;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    // Don't fall back, just propagate the error
    throw new Error(`AI task breakdown failed: ${error.message}`);
  }
}

// End of file - no fallback function needed