// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import { useTasks } from './hooks/useTasks';
import { useProjects } from './hooks/useProjects';
import './styles/design-system.css';
import './styles/layout-system.css';
import './styles/task-list-redesign.css';
import './styles/task-breakdown-redesign.css';
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
import './styles/settings.css';
import { useCategories } from './hooks/useCategories';

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
import CaptureBar from './components/CaptureBar';
import Settings from './components/Settings';
import Settings from './components/Settings';

// Utilities
import { loadSampleData } from './utils/sampleData';
import { clearAllData } from './utils/dataUtils';
import { checkApiKeyStatus } from './utils/groqService';

// Types
import { Task, Category, Project, PriorityLevel } from './types';

// Hooks
import { useTimeBlocks } from './hooks/useTimeBlocks';

type TabType = 'dashboard' | 'all-tasks' | 'projects' | 'categories' | 'calendar' | 'daily-planner' | 'settings';

function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [focusModeActive, setFocusModeActive] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  const {
    tasks,
    setTasks,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    addSubtask,
    updateTaskContext,
    updateTaskPriority,
    updateTaskEstimate,
    startTaskTimer,
    completeTaskTimer,
    updateTaskDescription,
    moveTaskToParent
  } = useTasks();

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
  
  
  // State for parent task selection
  const [newParent, setNewParent] = useState<string>('');
  
  // State for showing modals
  const [showWizard, setShowWizard] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showTaskEditModal, setShowTaskEditModal] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // State for editing tasks in the modal
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState<string>('');
  const [editTaskDueTime, setEditTaskDueTime] = useState<string>('');
  const [editTaskCategories, setEditTaskCategories] = useState<string[]>([]);
  const [editTaskProjectId, setEditTaskProjectId] = useState<string | null>(null);
  const [editTaskPriority, setEditTaskPriority] = useState<PriorityLevel | null>(null);
  
  // Time blocks state (from useTimeBlocks hook)
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
  const {
    categories,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory
  } = useCategories(setTasks);

  // Save categories to localStorage when they change
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);
  
  // Projects state
  const {
    projects,
    setProjects,
    addProject,
    updateProject,
    deleteProject
  } = useProjects(setTasks);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail && e.detail.title) {
        addTask({
          title: e.detail.title,
          status: 'pending'
        });
      }
    };
    window.addEventListener('quickAddTask', handler);
    return () => window.removeEventListener('quickAddTask', handler);
  }, [addTask]);

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

      addTask({
        title,
        status: 'pending',
        dueDate,
        parentId: newParent || undefined
      });

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
      <header className="sticky top-0 z-30 shadow-md flex items-center justify-between px-8 py-4 border-b border-border">
        <h1 className="text-3xl font-extrabold text-primary tracking-tight relative after:absolute after:left-0 after:-bottom-1 after:w-16 after:h-1 after:bg-primary-light after:rounded-full after:content-['']">Task Manager</h1>
        <nav className="flex gap-2 ml-8">
          <button 
            className={`px-4 py-2 rounded-md font-bold transition focus:outline-none focus:ring-2 focus:ring-primary ${activeTab === 'dashboard' ? 'bg-primary text-white shadow' : 'bg-white text-gray-600 border border-border font-medium hover:bg-gray-100 hover:text-primary'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`px-4 py-2 rounded-md font-bold transition focus:outline-none focus:ring-2 focus:ring-primary ${activeTab === 'all-tasks' ? 'bg-primary text-white shadow' : 'bg-white text-gray-600 border border-border font-medium hover:bg-gray-100 hover:text-primary'}`}
            onClick={() => setActiveTab('all-tasks')}
          >
            All Tasks
          </button>
          <button 
            className={`px-4 py-2 rounded-md font-bold transition focus:outline-none focus:ring-2 focus:ring-primary ${activeTab === 'projects' ? 'bg-primary text-white shadow' : 'bg-white text-gray-600 border border-border font-medium hover:bg-gray-100 hover:text-primary'}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button 
            className={`px-4 py-2 rounded-md font-bold transition focus:outline-none focus:ring-2 focus:ring-primary ${activeTab === 'categories' ? 'bg-primary text-white shadow' : 'bg-white text-gray-600 border border-border font-medium hover:bg-gray-100 hover:text-primary'}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button 
            className={`px-4 py-2 rounded-md font-bold transition focus:outline-none focus:ring-2 focus:ring-primary ${activeTab === 'calendar' ? 'bg-primary text-white shadow' : 'bg-white text-gray-600 border border-border font-medium hover:bg-gray-100 hover:text-primary'}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar
          </button>
          <button 
            className={`px-4 py-2 rounded-md font-bold transition focus:outline-none focus:ring-2 focus:ring-primary ${activeTab === 'daily-planner' ? 'bg-primary text-white shadow' : 'bg-white text-gray-600 border border-border font-medium hover:bg-gray-100 hover:text-primary'}`}
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
          <button
            className="btn btn-outline"
            onClick={() => setIsMoreOptionsOpen(true)}
          >
            <span className="mr-1">⚙️</span> More Options
          </button>
        </div>
      </header>
      <main className="w-full px-8 py-10">
        {/* Render Focus Mode when active, otherwise show normal UI */}
        {focusModeActive ? (
          <FocusMode
            tasks={tasks}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
            updateTask={(id: string, title: string, dueDate: string | null, categories?: string[], projectId?: string | null, dependsOn?: string[], priority?: PriorityLevel | null) => updateTask(id, title, dueDate, categories, projectId, dependsOn, priority)}
            addSubtask={addSubtask}
            categories={categories}
            projects={projects}
            onExitFocusMode={() => setFocusModeActive(false)}
          />
        ) : (
          <>
        {/* Capture Bar */}
        <CaptureBar
          addTask={addTask}
          newParent={newParent}
          setNewParent={setNewParent}
          parentOptions={parentOptions}
          categories={categories}
          projects={projects}
        />
        
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
                updateTaskEstimate={updateTaskEstimate}
              />
            </div>
          )}

          {/* Settings View */}
          {activeTab === 'settings' && (
            <div className="settings-view">
              <Settings />
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
            <div className="dashboard-grid">
              {/* Today's Tasks Section */}
              <div className="bg-white border border-border rounded-lg shadow-sm p-4 mb-6">
                <h2 className="text-lg font-bold text-primary mb-2 border-b border-border pb-1">Today's Tasks</h2>
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
                    moveTaskToParent={moveTaskToParent}
                    categories={categories}
                    projects={projects}
                  />
                ) : (
                  <p className="text-text-light italic text-center py-4">No tasks due today.</p>
                )}
              </div>
              <div className="section-card">
                <div className="section-card-header">
                  <h2 className="section-title">Today's Tasks</h2>
                </div>
                <div className="section-card-body">
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
                    <div className="empty-state">
                      <div className="empty-state-icon">📅</div>
                      <div className="empty-state-title">No tasks due today</div>
                      <div className="empty-state-description">Great! You have a clear schedule for today.</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Tasks Section */}
              {upcomingTasks.length > 0 && (
                <div className="bg-white border border-border rounded-lg shadow-sm p-4 mb-6">
                  <h2 className="text-lg font-bold text-primary mb-2 border-b border-border pb-1">Upcoming Tasks</h2>
                  <div className="space-y-4">
                    {upcomingTasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 py-2 px-3 border-b border-border last:border-b-0">
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
                            className="px-4 py-1 rounded-md font-semibold text-sm transition shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-primary text-white hover:bg-primary-dark active:bg-primary-dark"
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
                            className="px-4 py-1 rounded-md font-semibold text-sm transition shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 bg-success text-white hover:bg-success/90 active:bg-success/80"
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
              <div className="bg-white border border-border rounded-lg shadow-sm p-4 mb-6">
                <h2 className="text-lg font-bold text-primary mb-2 border-b border-border pb-1">Projects</h2>
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
                        className={`bg-white border border-border rounded-md shadow-sm p-3 mb-4 flex flex-col gap-2 ${urgencyClass}`}
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
                            ></div>
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
            </div>
          )}
          
          {/* All Tasks View */}
          {activeTab === 'all-tasks' && (
            <div className="all-tasks-view">
              <div className="section-card">
                <h2 className="section-title">All Tasks</h2>
                {tasks.filter(task => task.status !== 'completed').length > 0 ? (
                  <TaskList 
                    tasks={tasks.filter(task => task.status !== 'completed')} 
                    toggleTask={toggleTask} 
                    deleteTask={deleteTask} 
                    updateTask={updateTask}
                    updateTaskDescription={updateTaskDescription}
                    addSubtask={addSubtask}
                    moveTaskToParent={moveTaskToParent}
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
                    moveTaskToParent={moveTaskToParent}
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
              <div className="grid grid-3 gap-lg">
                {projects.length > 0 ? (
                  projects.map((project) => {
                    const projectTasks = tasks.filter(t => t.projectId === project.id);
                    const completedCount = projectTasks.filter(t => t.status === 'completed').length;
                    const activeCount = projectTasks.filter(t => t.status !== 'completed').length;
                    const progressPercentage = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;
                    return (
                      <div id={`project-${project.id}`} key={project.id} className="project-card flex flex-col gap-md p-lg mb-md shadow-md border border-border rounded-xl bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-primary mb-xs">{project.name}</h3>
                            {project.description && (
                              <p className="text-sm text-light mb-xs">{project.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button className="btn btn-sm btn-outline" onClick={() => startEditing(project)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteProject(project.id)}>Delete</button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-success">{activeCount} active</span>
                          {completedCount > 0 && <span className="text-xs text-light">{completedCount} done</span>}
                          {project.dueDate && (
                            <span className="text-xs text-warning">Due: {new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          )}
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-2 bg-background rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-primary" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-light">
                          <span>{progressPercentage}% complete</span>
                          <span>{projectTasks.length} tasks</span>
                        </div>
                        {/* List a few tasks */}
                        {projectTasks.length > 0 && (
                          <div className="mt-md">
                            <div className="text-xs text-light mb-xs">Sample tasks:</div>
                            <ul className="flex flex-col gap-xs">
                              {projectTasks.slice(0, 3).map(task => (
                                <li key={task.id} className="flex items-center gap-2">
                                  <input type="checkbox" checked={task.status === 'completed'} onChange={() => toggleTask(task.id)} />
                                  <span className={task.status === 'completed' ? 'line-through text-light' : ''}>{task.title}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-message">No projects yet. Create one to get started.</div>
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

                    // Find the most recent active task (if any)
                    const recentTasks = tasks
                      .filter(t => t.categories?.includes(category.id) && t.status !== 'completed')
                      .sort((a, b) => Number(b.id) - Number(a.id))
                      .slice(0, 1);

                    return (
                      <div
                        key={category.id}
                        className="compact-category-card"
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
          {activeTab === 'categories' && selectedCategoryId !== null && (
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
                      style={{ backgroundColor: categories.find(c => c.id === selectedCategoryId)?.color }}
                    />
                    {categories.find(c => c.id === selectedCategoryId)?.name}
                  </h2>
                  <div className="header-actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => startEditing(categories.find(c => c.id === selectedCategoryId) as Category)}
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Category Summary */}
                <div className="category-detail-section" style={{ backgroundColor: `${categories.find(c => c.id === selectedCategoryId)?.color}10` }}>
                  <div className="category-summary">
                    <div className="category-statistics">
                      <div className="stat-item">
                        <span className="stat-value">{tasks.filter(t => t.categories?.includes(selectedCategoryId) && t.status !== 'completed').length + tasks.filter(t => t.categories?.includes(selectedCategoryId) && t.status === 'completed').length}</span>
                        <span className="stat-label">Total Tasks</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{tasks.filter(t => t.categories?.includes(selectedCategoryId) && t.status === 'completed').length}</span>
                        <span className="stat-label">Completed</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{projects.filter(p => p.categoryIds?.includes(selectedCategoryId)).length}</span>
                        <span className="stat-label">Projects</span>
                      </div>
                    </div>
                    
                    {/* Quick Add Task */}
                    <div className="category-quick-add">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          addTask(input.value.trim(), null, undefined, [selectedCategoryId]);
                          input.value = '';
                        }
                      }}>
                        <div className="quick-add-form">
                          <input 
                            type="text" 
                            className="form-control"
                            placeholder={`Add task to ${categories.find(c => c.id === selectedCategoryId)?.name}...`}
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
                    <span className="task-counter">{tasks.filter(t => t.categories?.includes(selectedCategoryId) && t.status !== 'completed').length}</span>
                  </div>

                  {tasks.filter(t => t.categories?.includes(selectedCategoryId) && t.status !== 'completed').length > 0 ? (
                    <TaskList
                      tasks={tasks.filter(t => t.categories?.includes(selectedCategoryId) && t.status !== 'completed')}
                      toggleTask={toggleTask}
                      deleteTask={deleteTask}
                      updateTask={updateTask}
                      updateTaskDescription={updateTaskDescription}
                      addSubtask={addSubtask}
                      moveTaskToParent={moveTaskToParent}
                      categories={categories}
                      projects={projects}
                    />
                  ) : (
                    <p className="empty-message">No active tasks in this category</p>
                  )}
                </div>

                {/* Projects Section */}
                {projects.filter(p => p.categoryIds?.includes(selectedCategoryId)).length > 0 && (
                  <div className="category-detail-section">
                    <div className="section-header">
                      <h3 className="section-title">Projects</h3>
                      <span className="task-counter">{projects.filter(p => p.categoryIds?.includes(selectedCategoryId)).length}</span>
                    </div>

                    <div className="category-projects-grid">
                      {projects.filter(p => p.categoryIds?.includes(selectedCategoryId)).map(project => {
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
                            style={{ borderLeft: `4px solid ${project.color || categories.find(c => c.id === selectedCategoryId)?.color}` }}
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
                                    backgroundColor: project.color || categories.find(c => c.id === selectedCategoryId)?.color 
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
                {tasks.filter(t => t.categories?.includes(selectedCategoryId) && t.status === 'completed').length > 0 && (
                  <div className="category-detail-section">
                    <div className="section-header">
                      <h3 className="section-title">Completed</h3>
                      <span className="task-counter completed">{tasks.filter(t => t.categories?.includes(selectedCategoryId) && t.status === 'completed').length}</span>
                    </div>

                    <TaskList
                      tasks={tasks.filter(t => t.categories?.includes(selectedCategoryId) && t.status === 'completed')}
                      toggleTask={toggleTask}
                      deleteTask={deleteTask}
                      updateTask={updateTask}
                      updateTaskDescription={updateTaskDescription}
                      addSubtask={addSubtask}
                      moveTaskToParent={moveTaskToParent}
                      categories={categories}
                      projects={projects}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
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
          editingProject={editingProject}
          onEdit={setEditingProject}
          onClose={() => {
            setShowProjectManager(false);
            setEditingProject(null);
          }}
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
          <div className="modal p-6 rounded-xl shadow-lg max-w-md w-full">
            <div className="modal-header flex items-center justify-between mb-md">
              <h2 className="modal-title text-xl font-bold">Edit Task</h2>
              <button className="btn btn-sm btn-outline" onClick={() => setShowTaskEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="flex flex-col gap-md">
                <div>
                  <label className="form-label mb-xs">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editTaskTitle}
                    onChange={e => setEditTaskTitle(e.target.value)}
                  />
                </div>
                {(() => {
                  const subtaskCount = tasks.filter(t => t.parentId === editingTaskId).length;
                  if (subtaskCount > 0) {
                    return (
                      <div className="text-xs text-light mb-xs">{subtaskCount} subtask{subtaskCount !== 1 ? 's' : ''}</div>
                    );
                  }
                  return null;
                })()}
                <div>
                  <label className="form-label mb-xs">Due Date & Time</label>
                  <div className="flex gap-2 mb-xs">
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
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" className={`btn btn-sm btn-outline ${editTaskDueDate === new Date().toISOString().split('T')[0] ? 'bg-primary/10 text-primary' : ''}`} onClick={() => setEditTaskDueDate(new Date().toISOString().split('T')[0])}>Today</button>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => { const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); setEditTaskDueDate(tomorrow.toISOString().split('T')[0]); }}>Tomorrow</button>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => { const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7); setEditTaskDueDate(nextWeek.toISOString().split('T')[0]); }}>Next Week</button>
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => { setEditTaskDueDate(''); setEditTaskDueTime(''); }}>No Date</button>
                  </div>
                </div>
                <div>
                  <label className="form-label mb-xs">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        type="button"
                        key={category.id}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition ${editTaskCategories.includes(category.id) ? '' : 'bg-white'} `}
                        style={{
                          backgroundColor: editTaskCategories.includes(category.id) ? category.color : 'transparent',
                          color: editTaskCategories.includes(category.id) ? '#fff' : category.color,
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
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label mb-xs">Project</label>
                  <select
                    className="form-control"
                    value={editTaskProjectId || ''}
                    onChange={(e) => setEditTaskProjectId(e.target.value || null)}
                  >
                    <option value="">No Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label mb-xs">Priority</label>
                  <div className="flex gap-2 flex-wrap">
                    {['critical', 'high', 'medium', 'low', null].map(priority => (
                      <button
                        type="button"
                        key={priority ?? 'none'}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${editTaskPriority === priority ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-border'}`}
                        onClick={() => setEditTaskPriority(priority)}
                      >
                        {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'None'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-md">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowTaskEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={e => {
                      e.preventDefault();
                      if (editingTaskId && editTaskTitle.trim()) {
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
                          undefined,
                          editTaskPriority
                        );
                        setShowTaskEditModal(false);
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* More Options Menu */}
      <MoreOptionsMenu
        isOpen={isMoreOptionsOpen}
        onClose={() => setIsMoreOptionsOpen(false)}
        onManageCategories={() => setShowCategoryManager(true)}
        onImportExport={() => setShowImportExport(true)}
        onLoadSample={() => loadSampleData(setTasks, setCategories, setProjects)}
        onResetData={() => clearAllData(setTasks, setCategories, setProjects)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Settings Modal */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default App;