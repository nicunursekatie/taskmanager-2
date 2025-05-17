// groqService.js - Implementation for task breakdown using Groq API

/**
 * Breaks down a task into smaller subtasks using the Groq API
 * @param {string} taskTitle - The title of the task to break down
 * @param {string} taskDescription - Optional additional description of the task
 * @returns {Promise<Array<string>>} - Array of subtask titles
 */
export async function breakdownTask(taskTitle, taskDescription = '') {
  const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || '';
  
  // If no API key is available, fall back to template-based breakdown
  if (!GROQ_API_KEY) {
    console.warn('No Groq API key found, using fallback template breakdown');
    return fallbackBreakdownTask(taskTitle, taskDescription);
  }
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',  // Or another supported model
        messages: [
          {
            role: 'system',
            content: `You are a task breakdown assistant that helps users break down their tasks into clear, specific, and actionable subtasks.

IMPORTANT GUIDELINES:
1. Generate 4-6 concrete, specific subtasks that directly relate to completing the main task
2. Each subtask must be directly actionable - something the user can immediately work on
3. Tailor subtasks to the specific domain and context of the main task
4. Use clear, concise language with specific verbs that indicate exactly what action to take
5. Avoid generic productivity terms like "define success criteria" or "execute core work"
6. Skip motivational language, focus only on specific actions
7. Each subtask should represent a distinct step toward completing the overall task
8. Consider the natural sequence of steps needed to complete the task

FORMATTING INSTRUCTIONS:
- Return ONLY an array of subtask strings, with no additional text, explanations, or JSON
- Each subtask should be 3-10 words, focused on clarity and specificity
- Start each subtask with a specific action verb
- Do not number or bullet the subtasks`
          },
          {
            role: 'user',
            content: `Break down this task into specific, actionable subtasks: "${taskTitle}" ${taskDescription ? `\nAdditional context: ${taskDescription}` : ''}`
          }
        ],
        temperature: 0.2,  // Low temperature for more focused, consistent results
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract subtasks from the AI response
    let subtasksText = data.choices[0].message.content.trim();
    
    // Handle different response formats
    let subtasks = [];
    
    // If response is formatted as a list with dashes, newlines, etc.
    if (subtasksText.includes('\n')) {
      subtasks = subtasksText
        .split('\n')
        .map(line => line.replace(/^[-*•]|\d+[.)]|\[\s?\]|\s*-\s*/, '').trim())
        .filter(line => line.length > 0);
    } 
    // If response is formatted as an array-like string
    else if (subtasksText.startsWith('[') && subtasksText.endsWith(']')) {
      try {
        subtasks = JSON.parse(subtasksText);
      } catch (e) {
        // If parsing fails, try a simple split by quotes
        subtasks = subtasksText
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map(s => s.replace(/^["']|["']$/g, '').trim())
          .filter(s => s.length > 0);
      }
    } 
    // If it's just a comma-separated list
    else if (subtasksText.includes(',')) {
      subtasks = subtasksText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    // If we can't parse it properly, just return the whole thing as one task
    else {
      subtasks = [subtasksText];
    }
    
    return subtasks;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    // Fall back to template method if API call fails
    return fallbackBreakdownTask(taskTitle, taskDescription);
  }
}

/**
 * Fallback function that uses predefined templates instead of an API call
 * @param {string} taskTitle - The title of the task to break down
 * @param {string} taskDescription - Optional additional description of the task
 * @returns {Array<string>} - Array of subtask titles
 */
function fallbackBreakdownTask(taskTitle, taskDescription = '') {
  // Task type detection - crude but effective for demo purposes
  const lowercaseTitle = taskTitle.toLowerCase();
  
  let subtasks = [];
  
  // Select appropriate template based on task keywords
  if (lowercaseTitle.includes('presentation') || lowercaseTitle.includes('slideshow') || lowercaseTitle.includes('slides')) {
    subtasks = [
      'Outline key points and structure',
      'Create slides with visual elements',
      'Add speaker notes and talking points',
      'Practice delivery and time presentation',
      'Gather feedback and revise'
    ];
  } else if (lowercaseTitle.includes('report') || lowercaseTitle.includes('research') || lowercaseTitle.includes('paper')) {
    subtasks = [
      'Gather and organize research sources',
      'Create outline with main sections',
      'Write first draft of content',
      'Edit for clarity and accuracy',
      'Finalize formatting and citations'
    ];
  } else if (lowercaseTitle.includes('project') || lowercaseTitle.includes('develop') || lowercaseTitle.includes('implement')) {
    subtasks = [
      'Document specific requirements',
      'Create detailed task breakdown',
      'Code the core functionality',
      'Test specific components',
      'Write implementation documentation'
    ];
  } else if (lowercaseTitle.includes('meeting') || lowercaseTitle.includes('interview') || lowercaseTitle.includes('call')) {
    subtasks = [
      'Draft specific agenda items',
      'Prepare presentation materials',
      'Send invites with agenda attached',
      'Take notes during meeting',
      'Distribute action items to participants'
    ];
  } else if (lowercaseTitle.includes('email') || lowercaseTitle.includes('write') || lowercaseTitle.includes('draft')) {
    subtasks = [
      'List key points to cover',
      'Write initial draft',
      'Edit for clarity and brevity',
      'Proofread for spelling and grammar',
      'Attach necessary documents'
    ];
  } else if (lowercaseTitle.includes('plan') || lowercaseTitle.includes('organize') || lowercaseTitle.includes('schedule')) {
    subtasks = [
      'List specific goals with metrics',
      'Document available resources',
      'Create detailed timeline',
      'Assign team member responsibilities',
      'Set up progress tracking method'
    ];
  } else if (lowercaseTitle.includes('buy') || lowercaseTitle.includes('purchase') || lowercaseTitle.includes('shopping')) {
    subtasks = [
      'Research product specifications',
      'Compare prices from different vendors',
      'Check reviews from recent buyers',
      'Make the purchase',
      'Track shipping and delivery'
    ];
  } else if (lowercaseTitle.includes('code') || lowercaseTitle.includes('program') || lowercaseTitle.includes('app')) {
    subtasks = [
      'Sketch the solution architecture',
      'Write pseudocode for key algorithms',
      'Implement the core functionality',
      'Write tests for edge cases',
      'Refactor for readability and performance'
    ];
  } else if (lowercaseTitle.includes('learn') || lowercaseTitle.includes('study') || lowercaseTitle.includes('course')) {
    subtasks = [
      'Find specific learning resources',
      'Schedule dedicated study sessions',
      'Take notes on key concepts',
      'Practice with hands-on exercises',
      'Review and test understanding'
    ];
  } else {
    // More specific generic template
    subtasks = [
      'Define exact end deliverables',
      'List required resources and tools',
      'Complete the initial preparation step',
      'Execute the main task component',
      'Verify results against requirements'
    ];
  }
  
  // Add task-specific customization to multiple subtasks
  if (taskTitle.length > 5) {
    // Add specificity to 2-3 subtasks
    const numToCustomize = Math.min(subtasks.length, Math.floor(Math.random() * 2) + 2);
    const indices = [];
    
    // Generate unique random indices
    while (indices.length < numToCustomize) {
      const index = Math.floor(Math.random() * subtasks.length);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }
    
    // Customize the selected subtasks
    indices.forEach(index => {
      // Extract key terms from the task title
      const words = taskTitle.split(' ');
      const keyTerms = words.filter(word => word.length > 3).slice(0, 2);
      
      if (keyTerms.length > 0) {
        const term = keyTerms[Math.floor(Math.random() * keyTerms.length)];
        subtasks[index] = subtasks[index] + ` for ${term.trim()}`;
      } else {
        subtasks[index] = subtasks[index] + ` for "${taskTitle.trim()}"`;
      }
    });
  }
  
  return subtasks;
}