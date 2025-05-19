// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import './styles/calendar-view.css';
import './compact-styles.css';
import './app-styles.css';
import './styles/delete-btn.css';
import './styles/calendar-dark-mode.css';
import './styles/adhd-friendly.css';
import './styles/task-breakdown.css';
import './styles/focus-mode.css';
import './styles/time-estimator.css';
import './styles/reminders.css';
import './styles/task-highlights.css';

// Component imports
import TaskList from './components/TaskList';
import ContextWizard from './components/ContextWizard';
import FocusMode from './components/FocusMode';
import ReminderSystem from './components/ReminderSystem';
import CategoryManager from './components/CategoryManager';
import ProjectManager from './components/ProjectManager';
import ImportExport from './components/ImportExport';
import CalendarView from './components/CalendarView';
import DailyPlanner from './components/DailyPlanner';
import MoreOptionsMenu from './components/MoreOptionsMenu';

// Utilities
import { loadSampleData } from './utils/sampleData';
import { clearAllData } from './utils/dataUtils';
import { checkApiKeyStatus } from './utils/groqService';

// Types
import { Task, Category, Project, PriorityLevel } from './types';

// Hooks
import { useTimeBlocks } from './hooks/useTimeBlocks';

type TabType = 'dashboard' | 'all-tasks' | 'projects' | 'categories' | 'calendar' | 'daily-planner';

function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  // Check API key status on component mount (with error handling)
  useEffect(() => {
    try {
      checkApiKeyStatus();
      console.log('App initialized successfully');
    } catch (e) {
      console.error('Error checking API key status:', e);
    }
  }, []);

  // Reset selectedCategoryId when changing tabs
  useEffect(() => {
    console.log("Tab changed to:", activeTab);
    if (activeTab !== 'categories') {
      console.log("Resetting selectedCategoryId to null");
      setSelectedCategoryId(null);
    }
  }, [activeTab]);
  
  // Form refs for more reliable element access
  const titleInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  
  // State management for tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`Loaded ${parsed.length} tasks from localStorage on startup`);
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing tasks from localStorage:', e);
      }
    }
    // Return empty array instead of preloaded data
    console.log('No tasks found in localStorage, starting with empty array');
    return [];
  });
  
  // Function to reload tasks directly from localStorage
  const reloadTasksFromStorage = () => {
    try {
      const saved = localStorage.getItem('tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          console.log(`Reloading ${parsed.length} tasks from localStorage`);
          setTasks(parsed);
          return true;
        }
      }
    } catch (e) {
      console.error('Error reloading tasks from localStorage:', e);
    }
    return false;
  };
  
  // Save tasks to localStorage when they change
  useEffect(() => {
    console.log('Tasks changed, saving to localStorage:', tasks.length);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // State for parent task selection
  const [newParent, setNewParent] = useState<string>('');
  
  // State for showing modals
  const [showWizard, setShowWizard] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showTaskEditModal, setShowTaskEditModal] = useState(false);

  // State for editing tasks in the modal
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState<string>('');
  const [editTaskDueTime, setEditTaskDueTime] = useState<string>('');
  const [editTaskCategories, setEditTaskCategories] = useState<string[]>([]);
  const [editTaskProjectId, setEditTaskProjectId] = useState<string | null>(null);
  const [editTaskPriority, setEditTaskPriority] = useState<PriorityLevel | null>(null);
  
  // Time blocks state
  const {
    timeBlocks,
    currentDate,
    setCurrentDate,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    assignTaskToBlock
  } = useTimeBlocks();

  // Categories state
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  });

  // Save categories to localStorage when they change
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);
  
  // Projects state
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  });

  // Save projects to localStorage when they change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);
  
  // Add new task
  const addTask = (
    title: string,
    dueDate: string | null,
    parentId?: string,
    categoryIds?: string[],
    projectId?: string | null,
    priority?: PriorityLevel
  ) => {
    const id = Date.now().toString();

    // Extract time if it's included in the date string
    let dueTime = null;
    let dateOnly = dueDate;

    if (dueDate && dueDate.includes('T')) {
      // If there's a "T" separator, extract the time part
      const [datePart, timePart] = dueDate.split('T');
      dateOnly = datePart;
      dueTime = timePart;
    }

    const newTask: Task = {
      id,
      title,
      dueDate: dateOnly,
      dueTime,
      status: 'pending',
      parentId,
      categories: categoryIds || [],
      projectId: projectId || null,
      priority: priority || null,
    };
    setTasks(prev => [...prev, newTask]);
  };
  
  // Helper function to get subtasks for a specific task
  const getTaskSubtasks = (parentId: string): Task[] => {
    return tasks.filter(t => t.parentId === parentId);
  };

  // Add new subtask with direct localStorage persistence
  const addSubtask = (parentId: string, title: string) => {
    console.log(`DIRECT addSubtask called with parentId=${parentId}, title="${title}"`);
    
    // Get parent task to inherit properties
    const parentTask = tasks.find(t => t.id === parentId);
    if (!parentTask) {
      console.error("Parent task not found for ID:", parentId);
      return;
    }
    
    // Create a unique ID that avoids collisions
    const uniqueId = `st_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    // Create the new subtask
    const newSubtask: Task = {
      id: uniqueId,
      title,
      status: 'pending',
      parentId,
      // Inherit properties from parent
      dueDate: parentTask.dueDate,
      dueTime: parentTask.dueTime,
      projectId: parentTask.projectId,
      categories: parentTask.categories,
    };
    
    console.log("Created new subtask object:", JSON.stringify(newSubtask));
    
    // First get existing tasks from localStorage to make sure we have the latest
    let currentTasks: Task[] = [];
    try {
      const stored = localStorage.getItem('tasks');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          currentTasks = parsed;
        }
      }
    } catch (e) {
      console.error("Error reading current tasks from localStorage:", e);
      // Fall back to the tasks in state
      currentTasks = [...tasks];
    }
    
    // Add our new subtask
    const updatedTasks = [...currentTasks, newSubtask];
    
    // Log before saving
    console.log(`Before saving: ${currentTasks.length} tasks → ${updatedTasks.length} tasks`);
    
    // Save directly to localStorage first
    try {
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      console.log("SAVED TO LOCALSTORAGE:", updatedTasks.length, "tasks");
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
    
    // Now reload the tasks from localStorage to ensure consistency
    reloadTasksFromStorage();
    
    // For good measure, double check after a delay
    setTimeout(() => {
      reloadTasksFromStorage();
      
      try {
        const stored = localStorage.getItem('tasks');
        if (stored) {
          const parsedTasks = JSON.parse(stored);
          const storedSubtasks = parsedTasks.filter((t: Task) => t.parentId === parentId);
          console.log(`VERIFICATION: parent ${parentId} has ${storedSubtasks.length} subtasks in localStorage`);
        }
      } catch (e) {
        console.error('Error in verification:', e);
      }
    }, 300);
    
    return uniqueId; // Return the ID of the created subtask
  };

  // Toggle task completion status
  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' }
          : task
      )
    );
  };
  
  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id && task.parentId !== id));
  };
  
  // Update task estimate
  const updateTaskEstimate = (id: string, estimatedMinutes: number | null) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              estimatedMinutes: estimatedMinutes
            }
          : task
      )
    );
  };
  
  // Start task timer
  const startTaskTimer = (id: string) => {
    const now = new Date().toISOString();
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              timeStarted: now
            }
          : task
      )
    );
  };
  
  // Complete task timer
  const completeTaskTimer = (id: string) => {
    const now = new Date();
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id && task.timeStarted) {
          const startTime = new Date(task.timeStarted);
          const diffMs = now.getTime() - startTime.getTime();
          const diffMinutes = Math.ceil(diffMs / (1000 * 60)); // Round up to nearest minute
          
          return {
            ...task,
            timeCompleted: now.toISOString(),
            actualMinutes: diffMinutes
          };
        }
        return task;
      })
    );
  };

  // Update a task
  const updateTask = (
    id: string,
    title: string,
    dueDate: string | null,
    categories?: string[],
    projectId?: string | null,
    dependsOn?: string[],
    priority?: PriorityLevel | null
  ) => {
    // Extract time if it's included in the date string
    let dueTime = null;
    let dateOnly = dueDate;

    if (dueDate && dueDate.includes('T')) {
      // If there's a "T" separator, extract the time part
      const [datePart, timePart] = dueDate.split('T');
      dateOnly = datePart;
      dueTime = timePart;
    }

    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              title,
              dueDate: dateOnly,
              dueTime,
              categories: categories || task.categories,
              projectId: projectId !== undefined ? projectId : task.projectId,
              priority: priority !== undefined ? priority : task.priority,
            }
          : task
      )
    );
  };
  
  // Update task description
  const updateTaskDescription = (id: string, description: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              description
            }
          : task
      )
    );
  };
  
  // Add a new project
  const addProject = (project: Omit<Project, 'id'>) => {
    const id = Date.now().toString();
    const newProject: Project = { id, ...project };
    setProjects(prev => [...prev, newProject]);
  };

  // Update a project
  const updateProject = (id: string, project: Omit<Project, 'id'>) => {
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...project }
          : p
      )
    );
  };

  // Delete a project
  const deleteProject = (id: string) => {
    // Update tasks that were associated with this project
    setTasks(prev =>
      prev.map(task =>
        task.projectId === id
          ? { ...task, projectId: null }
          : task
      )
    );
    
    // Remove the project
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Add a new category
  const addCategory = (category: Omit<Category, 'id'>) => {
    const id = Date.now().toString();
    const newCategory: Category = { id, ...category };
    setCategories(prev => [...prev, newCategory]);
  };

  // Update a category
  const updateCategory = (id: string, category: Omit<Category, 'id'>) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id
          ? { ...cat, ...category }
          : cat
      )
    );
  };

  // Delete a category
  const deleteCategory = (id: string) => {
    // Remove the category from all tasks
    setTasks(prev =>
      prev.map(task => ({
        ...task,
        categories: task.categories ? task.categories.filter(catId => catId !== id) : []
      }))
    );

    // Remove the category itself
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  // Start editing a category
  const startEditing = (category: Category) => {
    setEditingCategoryId(category.id);
    setShowCategoryManager(true);
  };
  
  // General tasks for context wizard
  const generalTasks = [
    'Review your priorities',
    'Plan your week',
    'Clear your inbox',
    'Take a break'
  ];

  // Handle task form submission with refs
  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (titleInputRef.current && titleInputRef.current.value.trim()) {
      const title = titleInputRef.current.value.trim();
      let dueDate = null;

      // Fix timezone issue by ensuring date is in local timezone
      if (dateInputRef.current && dateInputRef.current.value) {
        // Create a date with timezone adjustment to prevent off-by-one day issue
        const dateValue = dateInputRef.current.value; // YYYY-MM-DD
        const timeValue = timeInputRef.current?.value || '00:00:00'; // HH:MM:SS

        // Create the date string using T separator with Z to indicate UTC
        dueDate = `${dateValue}T${timeValue}`;
      }

      addTask(title, dueDate, newParent);

      // Clear inputs
      titleInputRef.current.value = '';
      if (dateInputRef.current) dateInputRef.current.value = '';
      if (timeInputRef.current) timeInputRef.current.value = '';
    }
  };

  // Filter tasks by due date for different sections with proper timezone handling
  const now = new Date();
  // Create date objects without time component to avoid timezone issues
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const nextWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

  // Helper function to compare dates properly, accounting for timezone
  const isDateBefore = (taskDate: string, compareDate: Date): boolean => {
    if (!taskDate) return false;

    // Parse the task date
    const date = new Date(taskDate);

    // Normalize to start of day for comparison (removing time component)
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedCompareDate = new Date(compareDate.getFullYear(), compareDate.getMonth(), compareDate.getDate());

    return normalizedDate < normalizedCompareDate;
  };

  const isDateBetween = (taskDate: string, startDate: Date, endDate: Date): boolean => {
    if (!taskDate) return false;

    // Parse the task date with UTC timezone
    // Parse the task date
    const date = new Date(taskDate);

    // Normalize to start of day for comparison (removing time component)
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    return normalizedDate >= normalizedStartDate && normalizedDate < normalizedEndDate;
  };

  const overdueTasks = tasks.filter(
    task => task.dueDate && isDateBefore(task.dueDate, todayStart) && task.status !== 'completed'
  );

  const todayTasks = tasks.filter(
    task => task.dueDate && isDateBetween(task.dueDate, todayStart, tomorrowStart) && task.status !== 'completed'
  );

  // NEW APPROACH: Handle upcoming tasks - directly check dates for May 11 through May 17
  const upcomingTasks = tasks.filter(task => {
  // Skip tasks with no due date or completed tasks
  if (!task.dueDate || task.status === 'completed') return false;

  // Skip tasks that are due today or overdue
  if (isDateBefore(task.dueDate, todayStart) || isDateBetween(task.dueDate, todayStart, tomorrowStart)) {
    return false;
  }

  // Get the current date to calculate the upcoming week
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  // Convert to YYYY-MM-DD format for comparison
  const todayStr = today.toISOString().split('T')[0];
  const nextWeekStr = nextWeek.toISOString().split('T')[0];
  
  // Parse the date and extract just the date part (YYYY-MM-DD)
  const dateStr = task.dueDate.split('T')[0];

  // Check if the task falls within the next 7 days
  return dateStr >= todayStr && dateStr <= nextWeekStr;
});

  const completedTasks = tasks.filter(
    task => task.status === 'completed'
  );
  
  // Parent task options for the capture bar
  const parentOptions = tasks.filter(task => !task.parentId).map(task => ({
    id: task.id,
    title: task.title,
  }));

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-card shadow-md flex items-center justify-between px-8 py-4 border-b border-border">
        <h1 className="text-3xl font-extrabold text-primary tracking-tight relative after:absolute after:left-0 after:-bottom-1 after:w-16 after:h-1 after:bg-primary-light after:rounded-full after:content-['']">Task Manager</h1>
        <nav className="flex gap-2 ml-8">
          <button 
            className={`px-4 py-2 rounded-lg font-semibold transition text-text hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary ${activeTab === 'dashboard' ? 'bg-primary text-white shadow' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-semibold transition text-text hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary ${activeTab === 'all-tasks' ? 'bg-primary text-white shadow' : ''}`}
            onClick={() => setActiveTab('all-tasks')}
          >
            All Tasks
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-semibold transition text-text hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary ${activeTab === 'projects' ? 'bg-primary text-white shadow' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-semibold transition text-text hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary ${activeTab === 'categories' ? 'bg-primary text-white shadow' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-semibold transition text-text hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary ${activeTab === 'calendar' ? 'bg-primary text-white shadow' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-semibold transition text-text hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary ${activeTab === 'daily-planner' ? 'bg-primary text-white shadow' : ''}`}
            onClick={() => setActiveTab('daily-planner')}
          >
            Daily Planner
          </button>
        </nav>
        <div className="flex gap-3 items-center">
          <button 
            className="px-4 py-2 rounded-lg font-semibold bg-primary text-white hover:bg-primary-dark shadow transition"
            onClick={() => setShowWizard(true)}
          >
            What now?
          </button>
          <button 
            className="px-4 py-2 rounded-lg font-semibold bg-primary/10 text-primary hover:bg-primary/20 shadow transition"
            onClick={() => setFocusModeActive(true)}
          >
            <span className="mr-1">🎯</span> Focus Mode
          </button>
          <MoreOptionsMenu
            onManageCategories={() => setShowCategoryManager(true)}
            onImportExport={() => setShowImportExport(true)}
            onLoadSample={() => loadSampleData(setTasks, setCategories, setProjects)}
            onResetData={() => clearAllData(setTasks, setCategories, setProjects)}
          />
        </div>
      </header>
      <main className="max-w-7xl mx-auto w-full px-4 py-8">
        {/* Render Focus Mode when active, otherwise show normal UI */}
        {focusModeActive ? (
          <FocusMode
            tasks={tasks}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            updateTask={updateTask}
            addSubtask={addSubtask}
            categories={categories}
            projects={projects}
            onExitFocusMode={() => setFocusModeActive(false)}
          />
        ) : (
          <>
        {/* Capture Bar */}
        <div className="bg-card rounded-2xl shadow-lg p-8 mb-8">
          <form className="flex flex-wrap gap-4 items-start" onSubmit={handleTaskSubmit}>
            <div className="flex-1 min-w-[300px]">
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Quick capture a new task..."
                ref={titleInputRef}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  className="px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  ref={dateInputRef}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-3 py-1 text-sm rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition"
                    onClick={() => {
                      if (dateInputRef.current) {
                        const today = new Date();
                        const dateString = today.toISOString().split('T')[0];
                        dateInputRef.current.value = dateString;
                      }
                    }}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition"
                    onClick={() => {
                      if (dateInputRef.current) {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const dateString = tomorrow.toISOString().split('T')[0];
                        dateInputRef.current.value = dateString;
                      }
                    }}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <input
                type="time"
                className="px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                ref={timeInputRef}
              />
            </div>
            
            <div className="w-[180px]">
              <select 
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={newParent}
                onChange={(e) => setNewParent(e.target.value)}
              >
                <option value="">No Parent Task</option>
                {parentOptions.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.title}  
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              type="submit" 
              className="px-5 py-2 rounded-lg font-semibold text-base transition shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-dark active:bg-primary-dark"
            >
              Add Task
            </button>
          </form>
        </div>
        
        {/* Main Content Area */}
        <div className="content-area">
          {/* Daily Planner */}
          {activeTab === 'daily-planner' && (
            <div className="daily-planner-view">
              <DailyPlanner 
                tasks={tasks}
                timeBlocks={timeBlocks}
                addTimeBlock={addTimeBlock}
                updateTimeBlock={updateTimeBlock}
                deleteTimeBlock={deleteTimeBlock}
                assignTaskToBlock={assignTaskToBlock}
                date={currentDate}
                setDate={setCurrentDate}
              />
            </div>
          )}
          
          {/* Calendar View */}
          {activeTab === 'calendar' && (
            <div className="calendar-view-container">
              <div className="section-card">
                <h2 className="section-title">Calendar</h2>
                <CalendarView 
                  tasks={tasks} 
                  toggleTask={toggleTask}
                  categories={categories}
                  projects={projects}
                />
              </div>
            </div>
          )}
          
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Today's Tasks Section */}
              <div className="bg-card rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-text mb-6 pb-2 border-b border-border relative inline-block after:absolute after:right-[-12px] after:top-1/2 after:w-2 after:h-2 after:rounded-full after:bg-primary after:opacity-70 after:transform after:-translate-y-1/2">Today's Tasks</h2>
                {todayTasks.length > 0 ? (
                  <TaskList
                    tasks={todayTasks}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                    updateTask={updateTask}
                    updateTaskDescription={updateTaskDescription}
                    addSubtask={addSubtask}
                    updateTaskEstimate={updateTaskEstimate}
                    startTaskTimer={startTaskTimer}
                    completeTaskTimer={completeTaskTimer}
                    categories={categories}
                    projects={projects}
                  />
                ) : (
                  <p className="text-text-light italic text-center py-4">No tasks due today.</p>
                )}
              </div>

              {/* Upcoming Tasks Section */}
              {upcomingTasks.length > 0 && (
                <div className="bg-card rounded-2xl shadow-lg p-8 mb-8">
                  <h2 className="text-2xl font-bold text-text mb-6 pb-2 border-b border-border relative inline-block after:absolute after:right-[-12px] after:top-1/2 after:w-2 after:h-2 after:rounded-full after:bg-primary after:opacity-70 after:transform after:-translate-y-1/2">Upcoming Tasks</h2>
                  <div className="space-y-4">
                    {upcomingTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:shadow-md transition">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-text">{task.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-text-light">
                              Due: {new Date(task.dueDate || '').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            {task.projectId && (
                              <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                                {projects.find(p => p.id === task.projectId)?.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="px-5 py-2 rounded-lg font-semibold text-base transition shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border border-primary text-primary bg-white hover:bg-primary/10 active:bg-primary/20"
                            onClick={() => {
                              setEditingTaskId(task.id);
                              setEditTaskTitle(task.title);
                              setEditTaskDueDate(task.dueDate || '');
                              setEditTaskDueTime(task.dueTime || '');
                              setEditTaskCategories(task.categories || []);
                              setEditTaskProjectId(task.projectId ?? null);
                              setShowTaskEditModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="px-5 py-2 rounded-lg font-semibold text-base transition shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 bg-success text-white hover:bg-success/90 active:bg-success/80"
                            onClick={() => toggleTask(task.id)}
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              <div className="bg-card rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-text mb-6 pb-2 border-b border-border relative inline-block after:absolute after:right-[-12px] after:top-1/2 after:w-2 after:h-2 after:rounded-full after:bg-primary after:opacity-70 after:transform after:-translate-y-1/2">Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(project => {
                    const projectTasks = tasks.filter(t =>
                      t.projectId === project.id &&
                      t.status !== 'completed'
                    );

                    if (projectTasks.length === 0) return null;

                    // Calculate progress
                    const totalProjectTaskCount = tasks.filter(t => t.projectId === project.id).length;
                    const completedTaskCount = tasks.filter(t => t.projectId === project.id && t.status === 'completed').length;
                    const progressPercentage = totalProjectTaskCount > 0
                      ? Math.round((completedTaskCount / totalProjectTaskCount) * 100)
                      : 0;

                    // Find the nearest due date
                    const tasksWithDueDates = projectTasks.filter(t => t.dueDate);
                    const nearestDueDate = tasksWithDueDates.length > 0
                      ? tasksWithDueDates.reduce((nearest, task) =>
                          !nearest.dueDate || (task.dueDate && task.dueDate < nearest.dueDate)
                            ? task
                            : nearest,
                        tasksWithDueDates[0])
                      : null;

                    // Categorize urgency with UTC timezone handling
                    let urgencyClass = '';
                    if (nearestDueDate && nearestDueDate.dueDate) {
                      const dueDate = new Date(nearestDueDate.dueDate + 'Z');
                      const currentDate = new Date();
                      const dueDateStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                      const currentDateStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                      const diffTime = dueDateStart.getTime() - currentDateStart.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      if (diffDays < 0) urgencyClass = 'border-danger';
                      else if (diffDays <= 2) urgencyClass = 'border-warning';
                      else if (diffDays <= 7) urgencyClass = 'border-primary';
                    }

                    return (
                      <div
                        key={project.id}
                        className={`bg-background rounded-lg border-l-4 ${urgencyClass} p-4 hover:shadow-md transition cursor-pointer`}
                        onClick={() => {
                          setActiveTab('projects');
                          setTimeout(() => {
                            const projectElement = document.getElementById(`project-${project.id}`);
                            if (projectElement) {
                              projectElement.scrollIntoView({ behavior: 'smooth' });
                              projectElement.classList.add('highlight');
                              setTimeout(() => projectElement.classList.remove('highlight'), 2000);
                            }
                          }, 100);
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-text">{project.name}</h3>
                            {project.description && (
                              <p className="text-sm text-text-light mt-1">
                                {project.description.length > 60
                                  ? project.description.substring(0, 60) + '...'
                                  : project.description}
                              </p>
                            )}
                          </div>
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-semibold">
                            {projectTasks.length}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <p className="text-sm text-text-light mt-1">{progressPercentage}% complete</p>
                        </div>

                        {/* Next due task indicator */}
                        {nearestDueDate && nearestDueDate.dueDate && (
                          <div className="text-sm text-text-light">
                            <span className="font-medium">Next due:</span>{' '}
                            {new Date(nearestDueDate.dueDate).toLocaleDateString('en-US',
                              { weekday: 'short', month: 'short', day: 'numeric'})}
                            <p className="mt-1 text-text truncate">{nearestDueDate.title}</p>
                          </div>
                        )}

                        <div className="mt-4 space-y-2">
                          {projectTasks.slice(0, 3).map(task => (
                            <div key={task.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-primary/5 transition">
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={() => toggleTask(task.id)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                              />
                              <div
                                className="flex-1 min-w-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTaskId(task.id);
                                  setEditTaskTitle(task.title);
                                  setEditTaskDueDate(task.dueDate || '');
                                  setEditTaskDueTime(task.dueTime || '');
                                  setEditTaskCategories(task.categories || []);
                                  setEditTaskProjectId(task.projectId ?? null);
                                  setEditTaskPriority(task.priority ?? null);
                                  setShowTaskEditModal(true);
                                }}
                              >
                                <p className="text-sm text-text truncate">{task.title}</p>
                                {task.dueDate && (
                                  <span className={`text-xs ${isDateBefore(task.dueDate, todayStart) ? 'text-danger' : 'text-text-light'}`}>
                                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {/* All Tasks View */}
          {activeTab === 'all-tasks' && (
            <div className="all-tasks-view">
              <div className="section-card">
                <h2 className="section-title">All Tasks</h2>
                {tasks.filter(task => task.status !== 'completed' && !task.parentId).length > 0 ? (
                  <TaskList 
                    tasks={tasks.filter(task => task.status !== 'completed' && !task.parentId)} 
                    toggleTask={toggleTask} 
                    deleteTask={deleteTask} 
                    updateTask={updateTask}
                    updateTaskDescription={updateTaskDescription}
                    addSubtask={addSubtask}
                    categories={categories}
                    projects={projects}
                  />
                ) : (
                  <p className="empty-message">No tasks yet. Create one above.</p>
                )}
              </div>
              
              {completedTasks.length > 0 && (
                <div className="section-card">
                  <h2 className="section-title">Completed</h2>
                  <TaskList 
                    tasks={completedTasks} 
                    toggleTask={toggleTask} 
                    deleteTask={deleteTask} 
                    updateTask={updateTask}
                    updateTaskDescription={updateTaskDescription}
                    addSubtask={addSubtask}
                    categories={categories}
                    projects={projects}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Projects View */}
          {activeTab === 'projects' && (
            <div className="projects-view">
              <div className="view-header">
                <h2 className="view-title">Projects</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowProjectManager(true)}
                >
                  <span className="icon">+</span> New Project
                </button>
              </div>
              <div className="projects-grid">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <div id={`project-${project.id}`} key={project.id} className="project-card">
                      <div className="project-header">
                        <h2 className="project-title">{project.name}</h2>
                        <div className="project-actions">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                              // Open project edit modal
                              setShowProjectManager(true);
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      
                      {project.description && (
                        <p className="project-description">{project.description}</p>
                      )}
                      
                      <div className="project-task-section">
                        <h3 className="task-section-title">Tasks</h3>
                        {tasks.filter(t => t.projectId === project.id && t.status !== 'completed').length > 0 ? (
                          <TaskList 
                            tasks={tasks.filter(t => t.projectId === project.id && t.status !== 'completed')} 
                            toggleTask={toggleTask} 
                            deleteTask={deleteTask} 
                            updateTask={updateTask}
                            updateTaskDescription={updateTaskDescription}
                            addSubtask={addSubtask}
                            categories={categories}
                            projects={projects}
                          />
                        ) : (
                          <p className="empty-message">No active tasks in this project</p>
                        )}
                      </div>
                      
                      {tasks.filter(t => t.projectId === project.id && t.status === 'completed').length > 0 && (
                        <div className="project-task-section">
                          <h3 className="task-section-title">Completed</h3>
                          <TaskList 
                            tasks={tasks.filter(t => t.projectId === project.id && t.status === 'completed')} 
                            toggleTask={toggleTask} 
                            deleteTask={deleteTask} 
                            updateTask={updateTask}
                            updateTaskDescription={updateTaskDescription}
                            addSubtask={addSubtask}
                            categories={categories}
                            projects={projects}
                          />
                        </div>
                      )}
                      
                      <div className="project-quick-add">
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            addTask(input.value.trim(), null, undefined, [], project.id);
                            input.value = '';
                          }
                        }}>
                          <input 
                            type="text" 
                            className="form-control"
                            placeholder={`Add task to ${project.name}...`}
                          />
                          <button type="submit" className="btn btn-sm btn-primary">Add</button>
                        </form>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-projects">
                    <p>No projects yet. Create your first project to organize related tasks.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowProjectManager(true)}
                    >
                      Create Project
                    </button>
                  </div>
                )}
                
                {/* No Project Tasks Section */}
                {tasks.filter(t => !t.projectId).length > 0 && (
                  <div id="unassigned-tasks" className="project-card no-project-card">
                    <div className="project-header">
                      <h2 className="project-title">Unassigned Tasks</h2>
                    </div>
                    
                    <div className="project-task-section">
                      <h3 className="task-section-title">Tasks</h3>
                      {tasks.filter(t => !t.projectId && t.status !== 'completed').length > 0 ? (
                        <TaskList 
                          tasks={tasks.filter(t => !t.projectId && t.status !== 'completed')} 
                          toggleTask={toggleTask} 
                          deleteTask={deleteTask} 
                          updateTask={updateTask}
                          updateTaskDescription={updateTaskDescription}
                          addSubtask={addSubtask}
                          categories={categories}
                          projects={projects}
                        />
                      ) : (
                        <p className="empty-message">No unassigned tasks</p>
                      )}
                    </div>
                    
                    {tasks.filter(t => !t.projectId && t.status === 'completed').length > 0 && (
                      <div className="project-task-section">
                        <h3 className="task-section-title">Completed</h3>
                        <TaskList 
                          tasks={tasks.filter(t => !t.projectId && t.status === 'completed')} 
                          toggleTask={toggleTask} 
                          deleteTask={deleteTask} 
                          updateTask={updateTask}
                          updateTaskDescription={updateTaskDescription}
                          addSubtask={addSubtask}
                          categories={categories}
                          projects={projects}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Categories View - Grid View (All Categories) */}
          {activeTab === 'categories' && selectedCategoryId === null && (
            <div className="categories-view" key="all-categories">
              <div className="view-header">
                <h2 className="view-title">Categories</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCategoryManager(true)}
                >
                  <span className="icon">+</span> New Category
                </button>
              </div>

              {categories.length > 0 ? (
                <div className="category-cards-grid">
                  {categories.map(category => {
                    // Calculate task counts for this category
                    const activeTasks = tasks.filter(t => t.categories?.includes(category.id) && t.status !== 'completed').length;
                    const completedTasks = tasks.filter(t => t.categories?.includes(category.id) && t.status === 'completed').length;
                    const totalTasks = activeTasks + completedTasks;

                    // Calculate completion percentage
                    const completionPercentage = totalTasks > 0
                      ? Math.round((completedTasks / totalTasks) * 100)
                      : 0;

                    // Get projects associated with this category
                    const projectsInCategory = projects.filter(project =>
                      project.categoryIds && project.categoryIds.includes(category.id)
                    ).length;

                    // Generate a lighter version of the category color for the background
                    const bgColorStyle = {
                      backgroundColor: `${category.color}15`, // 15 is hex for 8% opacity
                      borderColor: category.color
                    };

                    // Find the most recent active task (if any)
                    const recentTasks = tasks
                      .filter(t => t.categories?.includes(category.id) && t.status !== 'completed')
                      .sort((a, b) => Number(b.id) - Number(a.id))
                      .slice(0, 1);

                    return (
                      <div
                        key={category.id}
                        className="compact-category-card"
                        style={bgColorStyle}
                        onClick={() => {
                          console.log("Setting selected category ID to:", category.id);
                          setSelectedCategoryId(category.id);
                        }}
                      >
                        <div className="category-color-bar" style={{ backgroundColor: category.color }}></div>
                        <div className="compact-category-content">
                          <h3 className="compact-category-title">{category.name}</h3>
                          
                          {/* Task Statistics */}
                          <div className="compact-category-stats">
                            <span className="task-count">{totalTasks}</span>
                            <div className="task-status-breakdown">
                              {activeTasks > 0 && (
                                <span className="active-count">{activeTasks} active</span>
                              )}
                              {completedTasks > 0 && (
                                <span className="completed-count">{completedTasks} done</span>
                              )}
                              {projectsInCategory > 0 && (
                                <span className="projects-count">{projectsInCategory} projects</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Progress bar */}
                          {totalTasks > 0 && (
                            <div className="category-progress">
                              <div className="category-progress-bar">
                                <div 
                                  className="category-progress-fill" 
                                  style={{ 
                                    width: `${completionPercentage}%`,
                                    backgroundColor: category.color 
                                  }}
                                ></div>
                              </div>
                              <span className="category-progress-text">{completionPercentage}% complete</span>
                            </div>
                          )}
                          
                          {/* Recent task preview */}
                          {recentTasks.length > 0 && (
                            <div className="category-recent-task">
                              <div className="recent-task-label">Recent task:</div>
                              <div className="recent-task-title">{recentTasks[0].title}</div>
                            </div>
                          )}
                          
                          <div className="category-actions">
                            <button
                              className="btn btn-sm btn-outline edit-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(category);
                              }}
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-categories">
                  <p>No categories yet. Create your first category to organize your tasks.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCategoryManager(true)}
                  >
                    Create Category
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Categories View - Single Category Detail View */}
          {activeTab === 'categories' && selectedCategoryId !== null && (() => {
            const category = categories.find(c => c.id === selectedCategoryId);
            if (!category) return null;

            const activeTasks = tasks.filter(t => t.categories?.includes(category.id) && t.status !== 'completed');
            const completedTasks = tasks.filter(t => t.categories?.includes(category.id) && t.status === 'completed');
            const projectsInCategory = projects.filter(project =>
              project.categoryIds && project.categoryIds.includes(category.id)
            );

            return (
              <div className="categories-view" key={selectedCategoryId}>
                <div className="single-category-view">
                  <div className="view-header with-back-button">
                    <button
                      className="btn btn-sm btn-outline back-button"
                      onClick={() => {
                        console.log("Setting selected category ID back to null");
                        setSelectedCategoryId(null);
                      }}
                    >
                      <span className="back-icon">←</span> All Categories
                    </button>
                    <h2 className="view-title">
                      <span
                        className="color-dot large"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </h2>
                    <div className="header-actions">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => startEditing(category)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Category Summary */}
                  <div className="category-detail-section" style={{ backgroundColor: `${category.color}10` }}>
                    <div className="category-summary">
                      <div className="category-statistics">
                        <div className="stat-item">
                          <span className="stat-value">{activeTasks.length + completedTasks.length}</span>
                          <span className="stat-label">Total Tasks</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-value">{completedTasks.length}</span>
                          <span className="stat-label">Completed</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-value">{projectsInCategory.length}</span>
                          <span className="stat-label">Projects</span>
                        </div>
                      </div>
                      
                      {/* Quick Add Task */}
                      <div className="category-quick-add">
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            addTask(input.value.trim(), null, undefined, [category.id]);
                            input.value = '';
                          }
                        }}>
                          <div className="quick-add-form">
                            <input 
                              type="text" 
                              className="form-control"
                              placeholder={`Add task to ${category.name}...`}
                            />
                            <button type="submit" className="btn btn-primary">Add</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Tasks Section */}
                  <div className="category-detail-section">
                    <div className="section-header">
                      <h3 className="section-title">Active Tasks</h3>
                      <span className="task-counter">{activeTasks.length}</span>
                    </div>

                    {activeTasks.length > 0 ? (
                      <TaskList
                        tasks={activeTasks}
                        toggleTask={toggleTask}
                        deleteTask={deleteTask}
                        updateTask={updateTask}
                        updateTaskDescription={updateTaskDescription}
                        addSubtask={addSubtask}
                        categories={categories}
                        projects={projects}
                      />
                    ) : (
                      <p className="empty-message">No active tasks in this category</p>
                    )}
                  </div>

                  {/* Projects Section */}
                  {projectsInCategory.length > 0 && (
                    <div className="category-detail-section">
                      <div className="section-header">
                        <h3 className="section-title">Projects</h3>
                        <span className="task-counter">{projectsInCategory.length}</span>
                      </div>

                      <div className="category-projects-grid">
                        {projectsInCategory.map(project => {
                          const projectTasks = tasks.filter(t => t.projectId === project.id);
                          const completedCount = projectTasks.filter(t => t.status === 'completed').length;
                          const activeCount = projectTasks.filter(t => t.status !== 'completed').length;
                          const progressPercentage = projectTasks.length > 0
                            ? Math.round((completedCount / projectTasks.length) * 100)
                            : 0;
                            
                          return (
                            <div
                              key={project.id}
                              className="category-project-card"
                              style={{ borderLeft: `4px solid ${project.color || category.color}` }}
                              onClick={() => {
                                setActiveTab('projects');
                                setTimeout(() => {
                                  const projectElement = document.getElementById(`project-${project.id}`);
                                  if (projectElement) {
                                    projectElement.scrollIntoView({ behavior: 'smooth' });
                                    projectElement.classList.add('highlight');
                                    setTimeout(() => projectElement.classList.remove('highlight'), 2000);
                                  }
                                }, 100);
                              }}
                            >
                              <h4 className="project-title">{project.name}</h4>
                              
                              {/* Progress Bar */}
                              <div className="project-progress-container">
                                <div className="project-progress-bar">
                                  <div 
                                    className="project-progress-fill" 
                                    style={{ 
                                      width: `${progressPercentage}%`,
                                      backgroundColor: project.color || category.color 
                                    }}
                                  ></div>
                                </div>
                                <div className="project-progress-text">{progressPercentage}% complete</div>
                              </div>
                              
                              <div className="project-stats">
                                <span className="task-count">{activeCount} active</span>
                                {completedCount > 0 && (
                                  <span className="completed-count">{completedCount} completed</span>
                                )}
                                {project.dueDate && (
                                  <span className="due-date">
                                    Due: {new Date(project.dueDate).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      timeZone: 'UTC'
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Completed Tasks Section */}
                  {completedTasks.length > 0 && (
                    <div className="category-detail-section">
                      <div className="section-header">
                        <h3 className="section-title">Completed</h3>
                        <span className="task-counter completed">{completedTasks.length}</span>
                      </div>

                      <TaskList
                        tasks={completedTasks}
                        toggleTask={toggleTask}
                        deleteTask={deleteTask}
                        updateTask={updateTask}
                        updateTaskDescription={updateTaskDescription}
                        addSubtask={addSubtask}
                        categories={categories}
                        projects={projects}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
        </>
        )}
      </main>
      
      {/* Reminder System - always visible regardless of focus mode */}
      <ReminderSystem 
        tasks={tasks} 
        openTask={(taskId) => {
          setEditingTaskId(taskId);
          setEditTaskTitle(tasks.find(t => t.id === taskId)?.title || '');
          setEditTaskDueDate(tasks.find(t => t.id === taskId)?.dueDate || '');
          setEditTaskDueTime(tasks.find(t => t.id === taskId)?.dueTime || '');
          setEditTaskCategories(tasks.find(t => t.id === taskId)?.categories || []);
          setEditTaskProjectId(tasks.find(t => t.id === taskId)?.projectId ?? null);
          setEditTaskPriority(tasks.find(t => t.id === taskId)?.priority ?? null);
          setShowTaskEditModal(true);
          
          // Exit focus mode if it's active
          if (focusModeActive) {
            setFocusModeActive(false);
          }
        }}
      />
      
      {/* Context Wizard Modal */}
      {showWizard && (
        <ContextWizard
          tasks={tasks}
          onClose={() => setShowWizard(false)}
          generalTasks={generalTasks}
        />
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          addCategory={addCategory}
          updateCategory={updateCategory}
          deleteCategory={deleteCategory}
          editingCategoryId={editingCategoryId}
          onClose={() => {
            setShowCategoryManager(false);
            setEditingCategoryId(null);
          }}
        />
      )}

      {/* Project Manager Modal */}
      {showProjectManager && (
        <ProjectManager
          projects={projects}
          categories={categories}
          addProject={addProject}
          updateProject={updateProject}
          deleteProject={deleteProject}
          onClose={() => setShowProjectManager(false)}
        />
      )}

      {/* Import/Export Modal */}
      {showImportExport && (
        <ImportExport
          tasks={tasks}
          categories={categories}
          projects={projects}
          setTasks={setTasks}
          setCategories={setCategories}
          setProjects={setProjects}
          onClose={() => setShowImportExport(false)}
        />
      )}

      {/* Task Edit Modal */}
      {showTaskEditModal && editingTaskId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Edit Task</h2>
              <button className="btn btn-sm btn-outline" onClick={() => setShowTaskEditModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="task-edit-form">
                <div className="input-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editTaskTitle}
                    onChange={e => setEditTaskTitle(e.target.value)}
                  />
                </div>
                
                {/* Display subtask count */}
                {(() => {
                  const subtaskCount = tasks.filter(t => t.parentId === editingTaskId).length;
                  if (subtaskCount > 0) {
                    return (
                      <div className="subtask-count-display">
                        <span className="subtask-count">
                          {subtaskCount} subtask{subtaskCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="input-group">
                  <label className="form-label">Due Date & Time</label>
                  <div className="date-time-flex">
                    <input
                      type="date"
                      className="form-control"
                      value={editTaskDueDate}
                      onChange={e => setEditTaskDueDate(e.target.value)}
                    />
                    <input
                      type="time"
                      className="form-control"
                      value={editTaskDueTime}
                      onChange={e => setEditTaskDueTime(e.target.value)}
                      placeholder="Optional time"
                    />
                  </div>
                  <div className="date-shortcuts">
                    <button
                      type="button"
                      className={`date-shortcut-btn ${editTaskDueDate === new Date().toISOString().split('T')[0] ? 'active' : ''}`}
                      onClick={() => {
                        const today = new Date();
                        const dateString = today.toISOString().split('T')[0];
                        setEditTaskDueDate(dateString);
                      }}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      className="date-shortcut-btn"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const dateString = tomorrow.toISOString().split('T')[0];
                        setEditTaskDueDate(dateString);
                      }}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      className="date-shortcut-btn"
                      onClick={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        const dateString = nextWeek.toISOString().split('T')[0];
                        setEditTaskDueDate(dateString);
                      }}
                    >
                      Next Week
                    </button>
                    <button
                      type="button"
                      className="date-shortcut-btn"
                      onClick={() => {
                        setEditTaskDueDate('');
                        setEditTaskDueTime('');
                      }}
                    >
                      No Date
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="form-label">Categories</label>
                  <div className="category-selector">
                    {categories.map(category => (
                      <div
                        key={category.id}
                        className={`category-option ${editTaskCategories.includes(category.id) ? 'selected' : ''}`}
                        style={{
                          backgroundColor: editTaskCategories.includes(category.id) ? category.color : 'transparent',
                          border: `1px solid ${category.color}`
                        }}
                        onClick={() => {
                          if (editTaskCategories.includes(category.id)) {
                            setEditTaskCategories(editTaskCategories.filter(id => id !== category.id));
                          } else {
                            setEditTaskCategories([...editTaskCategories, category.id]);
                          }
                        }}
                      >
                        {category.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label className="form-label">Project</label>
                  <select
                    className="form-control"
                    value={editTaskProjectId || ''}
                    onChange={(e) => setEditTaskProjectId(e.target.value || null)}
                  >
                    <option value="">No Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="form-label">Priority</label>
                  <div className="priority-selector">
                    <div 
                      className={`priority-option critical ${editTaskPriority === 'critical' ? 'selected' : ''}`}
                      onClick={() => setEditTaskPriority('critical')}
                    >
                      Critical
                    </div>
                    <div 
                      className={`priority-option high ${editTaskPriority === 'high' ? 'selected' : ''}`}
                      onClick={() => setEditTaskPriority('high')}
                    >
                      High
                    </div>
                    <div 
                      className={`priority-option medium ${editTaskPriority === 'medium' ? 'selected' : ''}`}
                      onClick={() => setEditTaskPriority('medium')}
                    >
                      Medium
                    </div>
                    <div 
                      className={`priority-option low ${editTaskPriority === 'low' ? 'selected' : ''}`}
                      onClick={() => setEditTaskPriority('low')}
                    >
                      Low
                    </div>
                    <div 
                      className={`priority-option ${!editTaskPriority ? 'selected' : ''}`}
                      onClick={() => setEditTaskPriority(null)}
                    >
                      None
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (editingTaskId && editTaskTitle.trim()) {
                    // Format date based on whether time is provided
                    let formattedDueDate = null;
                    if (editTaskDueDate) {
                      formattedDueDate = editTaskDueTime
                        ? `${editTaskDueDate}T${editTaskDueTime}`
                        : editTaskDueDate;
                    }

                    updateTask(
                      editingTaskId,
                      editTaskTitle.trim(),
                      formattedDueDate,
                      editTaskCategories,
                      editTaskProjectId,
                      undefined, // dependsOn parameter (not used here)
                      editTaskPriority
                    );
                    setShowTaskEditModal(false);
                  }
                }}
              >
                Save
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShowTaskEditModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;