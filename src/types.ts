// src/types.ts
// Complete type definitions for the TaskManager app

export type ContextTag = 
  | 'phone-call'  // For tasks requiring phone calls
  | 'errand'      // For tasks that require going somewhere
  | 'online'      // For tasks that can be done online
  | 'home'        // For tasks that must be done at home
  | 'work'        // For tasks that must be done at work (NICU)
  | 'anywhere';   // For tasks that can be done anywhere
    
// Calendar Event type for displaying time blocks in calendar
export type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO date string with time: "YYYY-MM-DDTHH:MM:SS"
  end: string;   // ISO date string with time: "YYYY-MM-DDTHH:MM:SS"
  description?: string;
  isFlexible?: boolean; // Flag for planner-created events
  source?: 'planner' | 'calendar'; // To identify the source of the event
  color?: string; // Optional color for rendering
};

// Project type
export type Project = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  dueDate?: string | null;
  priority?: PriorityLevel;
  categoryIds?: string[];
  status?: 'not-started' | 'in-progress' | 'on-hold' | 'completed';
};

// Category type
export type Category = {
  id: string;
  name: string;
  color: string;
};
// Context type for task categorization
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | null;

// Task type with context support
export type Task = {
  id: string;
  title: string;
  description?: string; // Description provides more context for AI task breakdown
  dueDate?: string | null; // ISO date string with or without time: "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM:SS"
  dueTime?: string | null; // Optional time component: "HH:MM"
  status: 'pending' | 'completed';
  parentId?: string | null;
  projectId?: string | null;
  categories?: string[];
  context?: ContextTag | null; // Allow null
  estimatedMinutes?: number | null; // Can be number, null, or undefined
  actualMinutes?: number | null; // Actual time spent
  timeStarted?: string | null; // ISO timestamp when task was started
  timeCompleted?: string | null; // ISO timestamp when task was completed
  priority?: PriorityLevel; // Optional priority level
};

// Add this to your types.ts file
export type AddSubtaskFn = (parentId: string, title: string) => void;
export type Subtask = Task;
// Function to update task context
export type UpdateTaskContextFn = (id: string, context: ContextTag | null) => void;

// Time block type for daily planning
export type TimeBlock = {
  id: string;
  startTime: string; // Format: "HH:MM" (24 hour)
  endTime: string;   // Format: "HH:MM" (24 hour)
  title: string;
  taskIds: string[]; // IDs of tasks assigned to this block
  color?: string;    // Optional color
};

// Function to add/update time blocks
export type AddTimeBlockFn = (block: Omit<TimeBlock, 'id'>) => void;
export type UpdateTimeBlockFn = (id: string, block: Partial<TimeBlock>) => void;
export type DeleteTimeBlockFn = (id: string) => void;
export type AssignTaskToBlockFn = (taskId: string, blockId: string | null) => void;

// Component prop types
export type TaskListProps = {
  tasks: Task[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (
    id: string,
    title: string,
    dueDate: string | null,
    categories?: string[] | undefined,
    projectId?: string | null | undefined,
    dependsOn?: string[] | undefined,
    priority?: PriorityLevel | null | undefined
  ) => void;
  
  updateTaskDescription?: (id: string, description: string) => void;
  addSubtask: (parentId: string, title: string) => void;
  updateTaskEstimate?: (id: string, estimatedMinutes: number | null) => void;
  startTaskTimer?: (id: string) => void;
  completeTaskTimer?: (id: string) => void;
  moveTaskToParent: (id: string, parentId: string | null) => void;
  categories: Category[];
  projects: Project[];
  enableBulkActions?: boolean;
  onBulkAction?: (action: string, selectedIds: string[], data?: any) => void;
};

export type FilterPanelProps = {
  categories: Category[];
  projects: Project[];
  activeCategories: string[];
  activeProject: string | null;
  toggleCategoryFilter: (categoryId: string) => void;
  setProjectFilter: (projectId: string | null) => void;
  clearFilters: () => void;
};

export type CaptureBarProps = {
  addTask: (
    title: string,
    dueDate: string | null,
    categoryIds?: string[],
    projectId?: string | null,
    dependsOn?: string[]
  ) => void;
  categories: Category[];
  projects: Project[];
};

export type ContextWizardProps = {
  tasks: Task[];
  onClose: () => void;
  generalTasks: string[];
};

type DailyPlannerProps = {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, block: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  assignTaskToBlock: (taskId: string, blockId: string | null) => void;
  date: Date;
  setDate: (date: Date) => void;
  updateTaskEstimate?: (id: string, estimatedMinutes: number | null) => void;
};
