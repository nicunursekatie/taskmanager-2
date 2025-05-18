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
  } catch (e) {
    console.error('Error logging environment:', e);
  }
  
  // Always use the fallback key to ensure functionality
  // This is a workaround for environment variable issues
  const GROQ_API_KEY = FALLBACK_GROQ_API_KEY;
  
  // Fall back to template if needed
  if (!GROQ_API_KEY) {
    console.warn('Using fallback template breakdown');
    return fallbackBreakdownTask(taskTitle, taskDescription);
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
            content: `You are a reasoning assistant that breaks tasks into specific, concrete subtasks based on ONLY what is explicitly stated in the task, without adding irrelevant steps or hallucinating context.

CRITICAL INSTRUCTIONS:
1. First, ANALYZE the task to determine if it's vague or ambiguous
2. If the task seems vague, try generating helpful subtasks based on what is provided. 
   If absolutely necessary, you may return: "NEEDS_CLARIFICATION: [your clarification request here]"
3. Do NOT generate subtasks for vague tasks - only for clear, specific tasks
4. Do NOT assume context that isn't explicitly in the task description
5. Do NOT add generic steps like "check weather," "text roommate," or "make a plan" unless specifically mentioned
6. Each subtask must directly contribute to completing the MAIN task, not tangential activities
7. Only include steps that are NECESSARY and RELEVANT to complete the specific task
8. For medical tasks, suggest actual clinical steps (not social arrangements unless specified)
9. For work tasks, don't add personal steps unless they're specified
10. Make each subtask concrete, specific and minimal

FOR EXAMPLE:
- Task: "Get labs drawn"
  Response: "NEEDS_CLARIFICATION: Please provide more details about this task."

- Task: "Get blood labs drawn at Kaiser clinic this Friday" 
  Appropriate subtasks:
  1. Check lab orders in Kaiser patient portal
  2. Print lab requisition form
  3. Fast for 12 hours before appointment
  4. Drive to Kaiser clinic on Main Street
  5. Bring insurance card and ID to appointment

FORMAT: 
- For vague tasks: Return ONLY "NEEDS_CLARIFICATION: Please provide more details about this task."
- For clear tasks: Return 3-5 numbered subtasks with NO introduction or commentary.
  1. [first subtask]
  2. [second subtask]
  etc.`
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
      'Write 10 bullet points on index cards',
      'Search Unsplash.com for 5 high-resolution images',
      'Create title slide with Arial 28pt font',
      'Practice presentation with kitchen timer for 15 minutes',
      'Ask Sarah for feedback via Microsoft Teams'
    ];
  } else if (lowercaseTitle.includes('report') || lowercaseTitle.includes('research') || lowercaseTitle.includes('paper')) {
    subtasks = [
      'Download PDFs from Google Scholar search results',
      'Create outline in Word with 4 main sections',
      'Write 250-word introduction with thesis statement',
      'Make bar chart in Excel showing quarterly results',
      'Ask roommate to proofread for spelling errors'
    ];
  } else if (lowercaseTitle.includes('project') || lowercaseTitle.includes('develop') || lowercaseTitle.includes('implement')) {
    subtasks = [
      'Draw database schema on whiteboard with 5 tables',
      'Create new private repository on GitHub.com',
      'Code authentication.js with password hashing',
      'Write tests for edge cases in Jest',
      'Deploy to staging server using terminal'
    ];
  } else if (lowercaseTitle.includes('clean') || lowercaseTitle.includes('tidy') || lowercaseTitle.includes('organize home')) {
    subtasks = [
      'Gather dirty dishes from bedroom and living room',
      'Vacuum carpet in hallway and living room',
      'Wipe bathroom sink with Clorox wipes',
      'Take out kitchen trash bag to dumpster',
      'Change sheets on bed with clean blue set'
    ];
  } else if (lowercaseTitle.includes('meeting') || lowercaseTitle.includes('interview') || lowercaseTitle.includes('call')) {
    subtasks = [
      'Reserve conference room 3B for Wednesday 2pm',
      'Print 12 copies of agenda on office printer',
      'Send calendar invites with Zoom link to team',
      'Write 3 discussion questions on notepad',
      'Set up laptop and projector 15 minutes early'
    ];
  } else if (lowercaseTitle.includes('email') || lowercaseTitle.includes('write') || lowercaseTitle.includes('draft')) {
    subtasks = [
      'Write 3 bullet points on sticky note',
      'Look up client email in Contacts app',
      'Draft email in Gmail with clear subject line',
      'Read draft aloud to check for tone',
      'Attach quarterly report PDF file'
    ];
  } else if (lowercaseTitle.includes('plan') || lowercaseTitle.includes('schedule')) {
    subtasks = [
      'Check Google Calendar for conflicts next week',
      'Text Jessica about dinner availability',
      'Make reservation at Olive Garden for 7pm',
      'Set reminder on phone for 6:30pm',
      'Map driving route on Google Maps'
    ];
  } else if (lowercaseTitle.includes('buy') || lowercaseTitle.includes('purchase') || lowercaseTitle.includes('shopping')) {
    subtasks = [
      'Check Amazon for price under $50',
      'Read 3 most recent customer reviews',
      'Check Chase credit card available balance',
      'Add item to cart and complete checkout',
      'File email receipt in Gmail "Purchases" folder'
    ];
  } else if (lowercaseTitle.includes('cook') || lowercaseTitle.includes('bake') || lowercaseTitle.includes('recipe')) {
    subtasks = [
      'Check refrigerator for milk and eggs',
      'Preheat oven to 375 degrees',
      'Mix dry ingredients in blue mixing bowl',
      'Set kitchen timer for 25 minutes',
      'Wash mixing bowls and measuring cups'
    ];
  } else if (lowercaseTitle.includes('code') || lowercaseTitle.includes('program') || lowercaseTitle.includes('app')) {
    subtasks = [
      'Create feature-login branch in terminal',
      'Write login.js function with error handling',
      'Update users table with new password field',
      'Test with 3 fake user accounts',
      'Push changes to GitHub and create PR'
    ];
  } else if (lowercaseTitle.includes('learn') || lowercaseTitle.includes('study') || lowercaseTitle.includes('course')) {
    subtasks = [
      'Sign up for Udemy Python course with credit card',
      'Download lecture 3 PDF from course website',
      'Create 20 flashcards in Anki app',
      'Reserve study room 4B in library website',
      'Set up practice test on kitchen table'
    ];
  } else if (lowercaseTitle.includes('doctor') || lowercaseTitle.includes('medical') || lowercaseTitle.includes('health')) {
    subtasks = [
      'Call Dr. Miller at 555-2323 for appointment',
      'Take photo of insurance card with phone',
      'Print medical history form from patient portal',
      'Drive to CVS on Oak Street for prescription',
      'Set calendar reminder with alarm for appointment'
    ];
  } else if (lowercaseTitle.includes('blog') || lowercaseTitle.includes('post') || lowercaseTitle.includes('article')) {
    subtasks = [
      'Search Google Trends for popular keywords',
      'Create outline with 5 subheadings in Notes app',
      'Write 100-word opening paragraph',
      'Download 3 relevant images from Pexels.com',
      'Draft headline with 60 characters maximum'
    ];
  } else if (lowercaseTitle.includes('repair') || lowercaseTitle.includes('fix') || lowercaseTitle.includes('install')) {
    subtasks = [
      'Search YouTube for tutorial video',
      'Find phillips screwdriver in garage toolbox',
      'Take close-up photo of broken part',
      'Purchase replacement part at Home Depot',
      'Turn off power at breaker box'
    ];
  } else if (lowercaseTitle.includes('exercise') || lowercaseTitle.includes('workout') || lowercaseTitle.includes('gym')) {
    subtasks = [
      'Pack gym bag with sneakers and water bottle',
      'Drive to Planet Fitness on Main Street',
      'Do 3 sets of 10 squats with 15lb weights',
      'Run on treadmill for 20 minutes',
      'Stretch hamstrings for 5 minutes after workout'
    ];
  } else {
    // More specific generic template for personal tasks
    subtasks = [
      'Check calendar app for available time slots',
      'Text roommate about dinner plans',
      'Set phone reminder for tomorrow at 9am',
      'Make list of needed items on kitchen notepad',
      'Check weather forecast on phone app'
    ];
  }
  
  // Add much more specific customization based on the task title
  if (taskTitle.length > 3) {
    // Extract key terms from the task title
    const words = taskTitle.toLowerCase().split(/\s+/);
    
    // Get meaningful words (longer words likely have more semantic value)
    const keyTerms = words
      .filter(word => word.length > 3 && !['with', 'for', 'the', 'and', 'that', 'this', 'from', 'about'].includes(word))
      .map(word => word.trim().replace(/[,.!?]$/, ''));
    
    if (keyTerms.length > 0) {
      // Extract main topics from the task title - these are likely the most important objects/subjects
      const mainTopic = keyTerms[0] || "task"; // First key term is often the main subject, fallback to "task"
      const secondaryTopic = keyTerms.length > 1 ? keyTerms[1] : mainTopic;
      
      // Customize all subtasks with task-specific information - but use a simpler approach
      subtasks = subtasks.map((subtask, index) => {
        try {
          const lowerSubtask = subtask.toLowerCase();
          
          // For search-related subtasks 
          if (lowerSubtask.includes('search') || lowerSubtask.includes('check') || lowerSubtask.includes('find')) {
            const replaced = subtask.replace(/for\s+[^,\s]+(?=\s+on|\s+in|\s+under|\s+with|$)/, `for ${mainTopic}`);
            // If replacement didn't work or resulted in invalid text, return the original
            return replaced && replaced.trim().length > 5 ? replaced : subtask;
          }
          
          // For tasks mentioning documents, notes, or drafts
          else if (lowerSubtask.includes('doc') || lowerSubtask.includes('draft') || lowerSubtask.includes('outline')) {
            // Just append the main topic rather than trying to do a specific replacement
            return `Create ${mainTopic} ${lowerSubtask.includes('outline') ? 'outline' : 'document'}`;
          }
          
          // For reminder or scheduling tasks
          else if (lowerSubtask.includes('reminder') || lowerSubtask.includes('calendar')) {
            return `Set ${mainTopic} reminder in calendar`;
          }
          
          // For tasks involving calling, emailing or texting
          else if (lowerSubtask.includes('call') || lowerSubtask.includes('email') || lowerSubtask.includes('text')) {
            return `Contact team member about ${mainTopic}`;
          }
          
          // For writing or coding tasks
          else if (lowerSubtask.includes('write') || lowerSubtask.includes('code')) {
            return `Write ${mainTopic} documentation`;
          }
          
          // For the last subtask (often completion or verification)
          else if (index === subtasks.length - 1) {
            return `Verify ${mainTopic} is complete`;
          }
          
          // If all else fails, just return the original subtask
          return subtask;
        } catch (error) {
          console.error("Error customizing subtask:", error);
          return subtask || `Step ${index + 1} for ${mainTopic}`;
        }
      });
      
      // Ensure we don't have any empty subtasks
      subtasks = subtasks.map((subtask, index) => 
        subtask && subtask.trim().length > 0 ? subtask : `Step ${index + 1} for ${mainTopic}`
      );
    }
  }
  
  return subtasks;
}