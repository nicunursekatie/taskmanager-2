// groqService.js - API service for Groq LLM integration

import axios from 'axios';

/**
 * Breaks down a task into smaller subtasks using the Groq API
 * @param {string} taskTitle - The title of the task to break down
 * @param {string} taskDescription - Optional additional description of the task
 * @returns {Promise<Array<string>>} - Array of subtask titles
 */
export async function breakdownTask(taskTitle, taskDescription = '') {
  try {
    // Create a properly formatted prompt for task breakdown
    const prompt = `Break down this task into 3-5 smaller, actionable subtasks:
Task: ${taskTitle}
${taskDescription ? `Description: ${taskDescription}` : ''}

Please format your response as a numbered list of subtasks only. Each subtask should be clear, specific, and actionable.`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-8b-instant", // Using the smaller, faster model which is sufficient for this task
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3, // Lower temperature for more focused, consistent results
        max_tokens: 300  // Limiting response length
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`
        }
      }
    );
    
    // Extract the content from the response
    const content = response.data.choices[0].message.content;
    
    // Parse the content into an array of subtask strings
    // This simple regex extracts numbered list items
    const subtasks = content.match(/\d+\.\s+(.+?)(?=\n\d+\.|\n\n|$)/gs)
      ?.map(item => item.replace(/^\d+\.\s+/, '').trim()) || [];
    
    return subtasks;
  } catch (error) {
    console.error('Error with task breakdown:', error.response?.data || error.message);
    throw new Error('Failed to break down task. Please try again later.');
  }
}