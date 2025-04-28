// src/types.ts
// Complete type definitions for the TaskManager app

export type ContextTag = 
  | 'phone-call'  // For tasks requiring phone calls
  | 'errand'      // For tasks that require going somewhere
  | 'online'      // For tasks that can be done online
  | 'home'        // For tasks that must be done at home
  | 'work'        // For tasks that must be done at work (NICU)
  | 'anywhere';   // For tasks that can be done anywhere

// Project type
export type Project = {
  id: string;
  name: string;
  description?: string;
};

// Category type
export type Category = {
  id: string;
  name: string;
  color: string;
};
// Context type for task categorization
export type PriorityLevel = 'must-do' | 'want-to-do' | 'when-i-can' | null;

// Task type with context support
export type Task = {
  id: string;
  title: string;
  dueDate?: string | null;
  status: 'pending' | 'completed';
  parentId?: string | null;
  projectId?: string | null;
  categories?: string[];
  context?: ContextTag | null; // Allow null
  estimatedMinutes?: number | null; // Can be number, null, or undefined
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
    categories?: string[],
    projectId?: string | null,
    dependsOn?: string[]
  ) => void;
  addSubtask: (parentId: string, title: string) => void; // Add this line
  categories: Category[];
  projects: Project[];
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