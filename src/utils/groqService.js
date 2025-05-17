// groqService.js - Fallback implementation for task breakdown
// This version uses pre-defined templates instead of an API call

/**
 * Breaks down a task into smaller subtasks using predefined templates
 * @param {string} taskTitle - The title of the task to break down
 * @param {string} taskDescription - Optional additional description of the task
 * @returns {Promise<Array<string>>} - Array of subtask titles
 */
export async function breakdownTask(taskTitle, taskDescription = '') {
  // Task type detection - crude but effective for demo purposes
  const lowercaseTitle = taskTitle.toLowerCase();
  
  // Instead of API calls, we'll use predefined templates based on task types
  let subtasks = [];
  
  // Simulate API delay for a more realistic experience
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Select appropriate template based on task keywords
  if (lowercaseTitle.includes('presentation') || lowercaseTitle.includes('slideshow') || lowercaseTitle.includes('slides')) {
    subtasks = [
      'Outline the key points and structure of the presentation',
      'Create the slide deck with visual elements and graphics',
      'Add speaker notes and talking points',
      'Practice delivering the presentation and time it',
      'Gather feedback and make final revisions'
    ];
  } else if (lowercaseTitle.includes('report') || lowercaseTitle.includes('research') || lowercaseTitle.includes('paper')) {
    subtasks = [
      'Gather and organize research materials and sources',
      'Create an outline with main sections and key points',
      'Write first draft focusing on content rather than style',
      'Edit for clarity, flow, and accuracy',
      'Finalize formatting, citations, and references'
    ];
  } else if (lowercaseTitle.includes('project') || lowercaseTitle.includes('develop') || lowercaseTitle.includes('implement')) {
    subtasks = [
      'Define project requirements and scope',
      'Create a task breakdown and timeline',
      'Implement core functionality',
      'Test and fix issues',
      'Document the implementation and deployment steps'
    ];
  } else if (lowercaseTitle.includes('meeting') || lowercaseTitle.includes('interview') || lowercaseTitle.includes('call')) {
    subtasks = [
      'Create agenda or talking points',
      'Prepare any necessary materials or documents',
      'Send calendar invites to all participants',
      'Conduct the meeting and take notes',
      'Send follow-up with action items'
    ];
  } else if (lowercaseTitle.includes('email') || lowercaseTitle.includes('write') || lowercaseTitle.includes('draft')) {
    subtasks = [
      'Outline the main points to communicate',
      'Write the first draft',
      'Edit for clarity, tone, and brevity',
      'Proofread for errors and typos',
      'Add any necessary attachments and send'
    ];
  } else if (lowercaseTitle.includes('plan') || lowercaseTitle.includes('organize') || lowercaseTitle.includes('schedule')) {
    subtasks = [
      'Define goals and objectives',
      'Identify necessary resources and constraints',
      'Create a timeline with milestones',
      'Assign responsibilities if involving others',
      'Set up monitoring and adjustment process'
    ];
  } else {
    // Generic template for any other type of task
    subtasks = [
      'Define clear objectives and success criteria',
      'Break down the task into smaller components',
      'Gather necessary resources and information',
      'Execute the core work with focus',
      'Review and finalize the outcome'
    ];
  }
  
  // Add task-specific customization to one of the subtasks if possible
  if (taskTitle.length > 5) {
    const randomIndex = Math.floor(Math.random() * subtasks.length);
    subtasks[randomIndex] = subtasks[randomIndex] + ` for "${taskTitle.trim()}"`;
  }
  
  return subtasks;
}