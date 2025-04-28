// src/types.ts
// Complete type definitions for the TaskManager app

export type Project = {
  id: string;
  name: string;
  description?: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

// Basic Task type
export type Task = {
  id: string;
  title: string;
  dueDate?: string | null;
  status: 'pending' | 'completed';
  parentId?: string | null;  // Reference to parent task
  projectId?: string | null;
  categories?: string[];
};

// Subtask is just a Task with a parentId
export type Subtask = Task & {
  parentId: string; // Required for subtasks (not optional)
};

// Function types for better TypeScript support
export type ToggleTaskFn = (id: string) => void;
export type DeleteTaskFn = (id: string) => void;
export type UpdateTaskFn = (
  id: string, 
  title: string, 
  dueDate: string | null,
  categories?: string[],
  projectId?: string | null
) => void;
export type AddSubtaskFn = (parentId: string, title: string) => void;
export type AddTaskFn = (
  title: string,
  dueDate: string | null,
  parentId?: string,
  categoryIds?: string[],
  projectId?: string | null
) => void;

// Component Props types
export type TaskListProps = {
  tasks: Task[];
  toggleTask: ToggleTaskFn;
  deleteTask: DeleteTaskFn;
  updateTask: UpdateTaskFn;
  addSubtask: AddSubtaskFn;
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
  addTask: AddTaskFn;
  newParent: string;
  setNewParent: (id: string) => void;
  parentOptions: { id: string; title: string }[];
  categories: Category[];
  projects: Project[];
};

export type ContextWizardProps = {
  tasks: Task[];
  onClose: () => void;
  generalTasks: string[];
};