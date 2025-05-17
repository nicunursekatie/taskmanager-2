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
        model: 'claude-3-opus-20240229',
        messages: [
          {
            role: 'system',
            content: `You are a reasoning assistant that breaks real-world tasks into subtasks. Do not rely on generic productivity templates. Instead, use context clues from the task itself to infer realistic, specific steps a person would actually take. For vague or domestic tasks, think practically—what physical actions or decisions would need to happen? Skip generic steps like "create Google Doc" or "notify team" unless they clearly apply.`
          },
          {
            role: 'user',
            content: `Break down the task: "${taskTitle}" into 3–5 real-world subtasks. Be concrete and context-aware. Avoid generic or vague language.${taskDescription ? `\nAdditional context: ${taskDescription}` : ''}`
          }
        ],
        temperature: 0.1,  // Very low temperature for consistent, deterministic results
        max_tokens: 250
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract subtasks from the AI response
    const subtasksText = data.choices[0].message.content.trim();
    
    // Parse the response based on the requested comma-separated format
    let subtasks = [];
    
    // First, try to parse as a comma-separated list (our intended format)
    if (subtasksText.includes(',')) {
      subtasks = subtasksText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length < 100); // Reasonable length for a subtask
    }
    // Fallback: handle newline-separated list
    else if (subtasksText.includes('\n')) {
      subtasks = subtasksText
        .split('\n')
        .map(line => line.replace(/^[-*•]|\d+[.)]|\[\s?\]|\s*-\s*/, '').trim())
        .filter(line => line.length > 0 && line.length < 100);
    }
    // Fallback: handle array-like formatting
    else if (subtasksText.startsWith('[') && subtasksText.endsWith(']')) {
      try {
        const parsed = JSON.parse(subtasksText);
        if (Array.isArray(parsed)) {
          subtasks = parsed.filter(s => typeof s === 'string' && s.length > 0 && s.length < 100);
        }
      } catch (e) {
        // If JSON parsing fails, try a simple bracket removal and comma split
        subtasks = subtasksText
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map(s => s.replace(/^["']|["']$/g, '').trim())
          .filter(s => s.length > 0 && s.length < 100);
      }
    }
    // Fallback: just use the whole string if nothing else works
    else if (subtasksText.length > 0 && subtasksText.length < 100) {
      subtasks = [subtasksText];
    }
    
    // Ensure we have at least some subtasks, or return fallback
    if (subtasks.length === 0) {
      console.warn('Failed to extract subtasks from AI response, using fallback');
      return fallbackBreakdownTask(taskTitle, taskDescription);
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
      'Draft bullet points on paper',
      'Find relevant images online',
      'Create 5-7 key slides',
      'Time your speech aloud',
      'Email draft to colleague'
    ];
  } else if (lowercaseTitle.includes('report') || lowercaseTitle.includes('research') || lowercaseTitle.includes('paper')) {
    subtasks = [
      'Download 3-5 key papers',
      'Create section headers document',
      'Write introduction paragraph',
      'Create data visualization charts',
      'Run spelling check'
    ];
  } else if (lowercaseTitle.includes('project') || lowercaseTitle.includes('develop') || lowercaseTitle.includes('implement')) {
    subtasks = [
      'Sketch database schema diagram',
      'Create GitHub repository',
      'Code login screen',
      'Write unit tests',
      'Deploy to staging server'
    ];
  } else if (lowercaseTitle.includes('meeting') || lowercaseTitle.includes('interview') || lowercaseTitle.includes('call')) {
    subtasks = [
      'Book conference room 3B',
      'Print handouts for attendees',
      'Send calendar invites',
      'Prepare three discussion questions',
      'Email minutes afterward'
    ];
  } else if (lowercaseTitle.includes('email') || lowercaseTitle.includes('write') || lowercaseTitle.includes('draft')) {
    subtasks = [
      'Bullet point three key messages',
      'Find recipient email address',
      'Draft in Google Docs',
      'Proofread for tone',
      'Attach PDF report'
    ];
  } else if (lowercaseTitle.includes('plan') || lowercaseTitle.includes('organize') || lowercaseTitle.includes('schedule')) {
    subtasks = [
      'Create Excel spreadsheet template',
      'List stakeholder email addresses',
      'Book meeting rooms in Outlook',
      'Set up Slack channel',
      'Email timeline to team'
    ];
  } else if (lowercaseTitle.includes('buy') || lowercaseTitle.includes('purchase') || lowercaseTitle.includes('shopping')) {
    subtasks = [
      'Compare prices on Amazon',
      'Read reviews on Wirecutter',
      'Check credit card balance',
      'Place order online',
      'Save receipt for taxes'
    ];
  } else if (lowercaseTitle.includes('code') || lowercaseTitle.includes('program') || lowercaseTitle.includes('app')) {
    subtasks = [
      'Create Git branch',
      'Write API endpoint function',
      'Update database schema',
      'Fix error handling bugs',
      'Submit pull request'
    ];
  } else if (lowercaseTitle.includes('learn') || lowercaseTitle.includes('study') || lowercaseTitle.includes('course')) {
    subtasks = [
      'Sign up for Coursera class',
      'Download lecture notes',
      'Create Anki flashcards',
      'Book study room at library',
      'Schedule practice exam'
    ];
  } else if (lowercaseTitle.includes('doctor') || lowercaseTitle.includes('medical') || lowercaseTitle.includes('health')) {
    subtasks = [
      'Call clinic for appointment',
      'Update insurance information',
      'Print medical history form',
      'Refill prescription',
      'Set reminder on phone'
    ];
  } else if (lowercaseTitle.includes('blog') || lowercaseTitle.includes('post') || lowercaseTitle.includes('article')) {
    subtasks = [
      'Research trending keywords',
      'Create article outline',
      'Write opening paragraph',
      'Find Creative Commons images',
      'Schedule in WordPress'
    ];
  } else {
    // More specific generic template
    subtasks = [
      'Schedule 30 minutes tomorrow',
      'Email relevant team members',
      'Create Google Doc draft',
      'Set phone reminder',
      'Update task status afterward'
    ];
  }
  
  // Add task-specific customization based on the task title
  if (taskTitle.length > 3) {
    // Extract key terms from the task title
    const words = taskTitle.toLowerCase().split(/\s+/);
    
    // Get meaningful words (longer words likely have more semantic value)
    const keyTerms = words
      .filter(word => word.length > 3 && !['with', 'for', 'the', 'and', 'that', 'this'].includes(word))
      .map(word => word.trim().replace(/[,.!?]$/, ''));
    
    if (keyTerms.length > 0) {
      // Replace 2-3 subtasks with more contextual ones
      const numToCustomize = Math.min(subtasks.length, Math.floor(Math.random() * 2) + 2);
      
      // Generate non-repeating random indices to modify
      const indices = [];
      while (indices.length < numToCustomize) {
        const index = Math.floor(Math.random() * subtasks.length);
        if (!indices.includes(index)) {
          indices.push(index);
        }
      }
      
      // Extract a noun or main topic from the task title
      const mainTopic = keyTerms[Math.floor(Math.random() * keyTerms.length)];
      
      // Modify selected subtasks to be more specific to the task
      indices.forEach((index, i) => {
        const term = keyTerms[i % keyTerms.length]; // Cycle through key terms
        
        // Different customization strategies
        if (i === 0 && subtasks[index].toLowerCase().includes('email')) {
          // If it's an email task, specify the subject
          subtasks[index] = subtasks[index].replace('email', `email about ${taskTitle.trim()}`);
        } else if (i === 1 && subtasks[index].toLowerCase().includes('create')) {
          // If it's a creation task, specify what to create
          subtasks[index] = subtasks[index].replace('create', `create ${term}`);
        } else if (subtasks[index].includes('Google Doc')) {
          // Name the document more specifically
          subtasks[index] = subtasks[index].replace('Google Doc', `${mainTopic} document`);
        } else {
          // Add the term to the end of the subtask
          const verb = subtasks[index].split(' ')[0];
          subtasks[index] = `${verb} ${term} ${subtasks[index].substring(verb.length).trim()}`;
        }
      });
    }
  }
  
  return subtasks;
}