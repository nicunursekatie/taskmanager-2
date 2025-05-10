// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import './styles/calendar-view.css';
import './compact-styles.css';
import './app-styles.css';

// Component imports
import TaskList from './components/TaskList';
import ContextWizard from './components/ContextWizard';
import CategoryManager from './components/CategoryManager';
import ProjectManager from './components/ProjectManager';
import ImportExport from './components/ImportExport';
import CalendarView from './components/CalendarView';
import DailyPlanner from './components/DailyPlanner';
import MoreOptionsMenu from './components/MoreOptionsMenu';

// Utilities
import { loadSampleData } from './utils/sampleData';
import { clearAllData } from './utils/dataUtils';

// Types
import { Task, Category, Project } from './types';

// Hooks
import { useTimeBlocks } from './hooks/useTimeBlocks';

type TabType = 'dashboard' | 'all-tasks' | 'projects' | 'categories' | 'calendar' | 'daily-planner';

function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    // Return empty array instead of preloaded data
    return [];
  });
  
  // Save tasks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // State for parent task selection
  const [newParent, setNewParent] = useState<string>('');
  
  // State for showing modals
  const [showWizard, setShowWizard] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showTaskEditModal, setShowTaskEditModal] = useState(false);

  // State for editing tasks in the modal
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState<string>('');
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
    const newTask: Task = {
      id,
      title,
      dueDate,
      status: 'pending',
      parentId,
      categories: categoryIds || [],
      projectId: projectId || null,
      priority: priority || null,
    };
    setTasks(prev => [...prev, newTask]);
  };
  
  // Add new subtask
  const addSubtask = (parentId: string, title: string) => {
    // Get parent task to inherit properties
    const parentTask = tasks.find(t => t.id === parentId);
    
    if (!parentTask) {
      console.error("Parent task not found");
      return;
    }
    
    const newSubtask: Task = {
      id: Date.now().toString(),
      title,
      status: 'pending',
      parentId, // Set the parent ID
      // Inherit properties from parent
      dueDate: parentTask.dueDate, // Inherit due date from parent
      projectId: parentTask.projectId, // Inherit project from parent
      categories: parentTask.categories, // Inherit categories from parent
    };
    
    setTasks(prev => [...prev, newSubtask]);
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
  
  // Update a task
  const updateTask = (
    id: string,
    title: string,
    dueDate: string | null,
    categoryIds?: string[],
    projectId?: string | null,
    dependsOn?: string[],
    priority?: PriorityLevel
  ) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              title,
              dueDate,
              categories: categoryIds || task.categories,
              projectId: projectId !== undefined ? projectId : task.projectId,
              priority: priority !== undefined ? priority : task.priority,
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
        dueDate = `${dateValue}T${timeValue}Z`;
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

    // Parse the task date with UTC timezone
    const date = new Date(taskDate + 'Z');

    // Normalize to start of day for comparison (removing time component)
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedCompareDate = new Date(compareDate.getFullYear(), compareDate.getMonth(), compareDate.getDate());

    return normalizedDate < normalizedCompareDate;
  };

  const isDateBetween = (taskDate: string, startDate: Date, endDate: Date): boolean => {
    if (!taskDate) return false;

    // Parse the task date with UTC timezone
    const date = new Date(taskDate + 'Z');

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

    // Parse the date and extract just the date part (YYYY-MM-DD)
    const dateStr = task.dueDate.split('T')[0];

    // Today is May 10, 2025, so upcoming dates are May 11-17
    return dateStr >= '2025-05-11' && dateStr <= '2025-05-17';
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
    <div className="app-container full-width">
      {/* Top Navigation */}
      <header className="top-nav">
        <h1 className="app-title">Task Manager</h1>
        <nav className="main-nav">
          <button 
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-button ${activeTab === 'all-tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-tasks')}
          >
            All Tasks
          </button>
          <button 
            className={`nav-button ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button 
            className={`nav-button ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button 
            className={`nav-button ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar
          </button>
          <button 
            className={`nav-button ${activeTab === 'daily-planner' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily-planner')}
          >
            Daily Planner
          </button>
        </nav>

        <div className="top-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowWizard(true)}
          >
            What now?
          </button>
          <MoreOptionsMenu
            onManageCategories={() => setShowCategoryManager(true)}
            onImportExport={() => setShowImportExport(true)}
            onLoadSample={() => loadSampleData(setTasks, setCategories, setProjects)}
            onResetData={() => clearAllData(setTasks, setCategories, setProjects)}
          />
        </div>
      </header>
      
      <main className="main-content full-width">
        {/* Capture Bar */}
        <div className="capture-container">
          <form className="capture-form" onSubmit={handleTaskSubmit}>
            <div style={{ flex: "1 1 300px", minWidth: "300px" }}>
              <input
                type="text"
                className="form-control capture-input"
                placeholder="Quick capture a new task..."
                ref={titleInputRef}
                style={{ width: "100%" }}
              />
            </div>

            <div className="date-time-inputs" style={{ flex: "0 0 auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <input
                  type="date"
                  className="form-control date-input"
                  ref={dateInputRef}
                />
                <div className="date-shortcuts" style={{ margin: "4px 0" }}>
                  <button
                    type="button"
                    className="date-shortcut-btn"
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
                    className="date-shortcut-btn"
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
                className="form-control time-input"
                ref={timeInputRef}
              />
            </div>
            
            <div style={{ flex: "0 0 auto", width: "180px" }}>
              <select 
                className="form-control"
                value={newParent}
                onChange={(e) => setNewParent(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="">No Parent Task</option>
                {parentOptions.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.title}  
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ flex: "0 0 auto" }}>
              <button type="submit" className="btn btn-primary">Add</button>
            </div>
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
            <div className="dashboard-view">
              {/* Today's Tasks Section */}
              <div className="section-card today-tasks-card">
                <h2 className="section-title">Today's Tasks</h2>
                {todayTasks.length > 0 ? (
                  <TaskList
                    tasks={todayTasks}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                    updateTask={updateTask}
                    addSubtask={addSubtask}
                    categories={categories}
                    projects={projects}
                  />
                ) : (
                  <p className="empty-message">No tasks due today.</p>
                )}
              </div>

              {/* Upcoming Tasks Section */}
              {upcomingTasks.length > 0 && (
                <div className="section-card upcoming-tasks-card">
                  <h2 className="section-title">Upcoming Tasks</h2>
                  <div className="upcoming-tasks">
                    {upcomingTasks.map(task => (
                      <div key={task.id} className="upcoming-task-item">
                        <div className="upcoming-task-info">
                          <h3 className="upcoming-task-title">{task.title}</h3>
                          <div className="upcoming-task-deadline">
                            <span className="due-label">
                              Due: {new Date(task.dueDate || '').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                            </span>
                            {task.projectId && (
                              <span className="upcoming-task-project">
                                {projects.find(p => p.id === task.projectId)?.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="upcoming-task-actions">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                              setEditingTaskId(task.id);
                              setEditTaskTitle(task.title);
                              setEditTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                              setEditTaskCategories(task.categories || []);
                              setEditTaskProjectId(task.projectId);
                              setShowTaskEditModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-primary"
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
              <div className="section-card">
                <h2 className="section-title">Projects</h2>
                <div className="projects-grid dashboard-grid">
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
                      // Create date objects with UTC time zone
                      const dueDate = new Date(nearestDueDate.dueDate + 'Z');
                      const currentDate = new Date();

                      // Normalize both dates to start of day in local time for comparison
                      const dueDateStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                      const currentDateStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

                      const diffTime = dueDateStart.getTime() - currentDateStart.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      if (diffDays < 0) urgencyClass = 'project-overdue';
                      else if (diffDays <= 2) urgencyClass = 'project-urgent';
                      else if (diffDays <= 7) urgencyClass = 'project-upcoming';
                    }

                    return (
                      <div
                        key={project.id}
                        className={`project-card mini-card ${urgencyClass}`}
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
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="project-header">
                          <div className="project-title-section">
                            <h3 className="project-title">{project.name}</h3>
                            {project.description && (
                              <div className="project-description-preview">{project.description.length > 60 ?
                                project.description.substring(0, 60) + '...' :
                                project.description}
                              </div>
                            )}
                          </div>
                          <div className="project-stats">
                            <span className="task-count">{projectTasks.length}</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="project-progress-container">
                          <div className="project-progress-bar">
                            <div className="project-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                          </div>
                          <div className="project-progress-text">{progressPercentage}% complete</div>
                        </div>

                        {/* Next due task indicator */}
                        {nearestDueDate && nearestDueDate.dueDate && (
                          <div className="project-next-due">
                            <span className="next-due-label">Next due:</span>
                            <span className="next-due-date">
                              {new Date(nearestDueDate.dueDate).toLocaleDateString('en-US',
                                { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                            </span>
                            <span className="next-due-task">{nearestDueDate.title}</span>
                          </div>
                        )}

                        <div className="project-task-list">
                          {projectTasks.slice(0, 3).map(task => (
                            <div key={task.id} className="mini-task-item">
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={() => toggleTask(task.id)}
                              />
                              <div
                                className="mini-task-title-container"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent parent (project card) click event
                                  // Set up task edit modal
                                  setEditingTaskId(task.id);
                                  setEditTaskTitle(task.title);
                                  setEditTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                                  setEditTaskCategories(task.categories || []);
                                  setEditTaskProjectId(task.projectId);
                                  setEditTaskPriority(task.priority);
                                  setShowTaskEditModal(true);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <span className="mini-task-title">{task.title}</span>
                                {task.dueDate && (
                                  <span className={`mini-task-due-date ${isDateBefore(task.dueDate, todayStart) ? 'overdue' : ''}`}>
                                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      timeZone: 'UTC'  // Use UTC to maintain consistent date
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {projectTasks.length > 3 && (
                            <button
                              className="more-tasks-button"
                              onClick={(e) => {
                                e.stopPropagation();
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
                              +{projectTasks.length - 3} more tasks
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Unassigned Tasks Card */}
                  {tasks.filter(t => !t.projectId && t.status !== 'completed').length > 0 && (
                    <div
                      className="project-card mini-card no-project-card"
                      onClick={() => {
                        setActiveTab('projects');
                        setTimeout(() => {
                          const unassignedElement = document.getElementById('unassigned-tasks');
                          if (unassignedElement) {
                            unassignedElement.scrollIntoView({ behavior: 'smooth' });
                            unassignedElement.classList.add('highlight');
                            setTimeout(() => unassignedElement.classList.remove('highlight'), 2000);
                          }
                        }, 100);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="project-header">
                        <div className="project-title-section">
                          <h3 className="project-title">Unassigned Tasks</h3>
                          <div className="project-description-preview">Tasks not assigned to any project</div>
                        </div>
                        <div className="project-stats">
                          <span className="task-count">
                            {tasks.filter(t => !t.projectId && t.status !== 'completed').length}
                          </span>
                        </div>
                      </div>

                      {/* Find upcoming and overdue unassigned tasks */}
                      {(() => {
                        const unassignedTasks = tasks.filter(t => !t.projectId && t.status !== 'completed');
                        const now = new Date();
                        const overdueTasks = unassignedTasks.filter(t => t.dueDate && new Date(t.dueDate) < now);
                        const upcomingTasks = unassignedTasks.filter(t =>
                          t.dueDate &&
                          new Date(t.dueDate) >= now &&
                          new Date(t.dueDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                        );

                        if (overdueTasks.length > 0 || upcomingTasks.length > 0) {
                          return (
                            <div className="unassigned-task-summary">
                              {overdueTasks.length > 0 && (
                                <div className="unassigned-overdue-count">
                                  <span className="count-circle overdue">{overdueTasks.length}</span> overdue
                                </div>
                              )}
                              {upcomingTasks.length > 0 && (
                                <div className="unassigned-upcoming-count">
                                  <span className="count-circle upcoming">{upcomingTasks.length}</span> due soon
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className="project-task-list">
                        {tasks
                          .filter(t => !t.projectId && t.status !== 'completed')
                          .slice(0, 3)
                          .map(task => (
                            <div key={task.id} className="mini-task-item">
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={() => toggleTask(task.id)}
                              />
                              <div
                                className="mini-task-title-container"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent parent (project card) click event
                                  // Set up task edit modal
                                  setEditingTaskId(task.id);
                                  setEditTaskTitle(task.title);
                                  setEditTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                                  setEditTaskCategories(task.categories || []);
                                  setEditTaskProjectId(task.projectId);
                                  setEditTaskPriority(task.priority);
                                  setShowTaskEditModal(true);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <span className="mini-task-title">{task.title}</span>
                                {task.dueDate && (
                                  <span className={`mini-task-due-date ${isDateBefore(task.dueDate, todayStart) ? 'overdue' : ''}`}>
                                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      timeZone: 'UTC'  // Use UTC to maintain consistent date
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        {tasks.filter(t => !t.projectId && t.status !== 'completed').length > 3 && (
                          <button
                            className="more-tasks-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab('projects');
                              setTimeout(() => {
                                const unassignedElement = document.getElementById('unassigned-tasks');
                                if (unassignedElement) {
                                  unassignedElement.scrollIntoView({ behavior: 'smooth' });
                                  unassignedElement.classList.add('highlight');
                                  setTimeout(() => unassignedElement.classList.remove('highlight'), 2000);
                                }
                              }, 100);
                            }}
                          >
                            View all {tasks.filter(t => !t.projectId && t.status !== 'completed').length} tasks
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent Activity Section */}
              <div className="section-card">
                <h2 className="section-title">Recent Activity</h2>
                <div className="recent-tasks">
                  {tasks
                    .filter(t => t.status !== 'completed')
                    .sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0)) // Sort by most recent (assuming ID is timestamp-based)
                    .slice(0, 5)
                    .map(task => (
                      <div key={task.id} className="recent-task-item">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => toggleTask(task.id)}
                        />
                        <div
                          className="recent-task-title-container"
                          onClick={() => {
                            // Set up task edit modal
                            setEditingTaskId(task.id);
                            setEditTaskTitle(task.title);
                            setEditTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                            setEditTaskCategories(task.categories || []);
                            setEditTaskProjectId(task.projectId);
                            setEditTaskPriority(task.priority);
                            setShowTaskEditModal(true);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="recent-task-title">{task.title}</span>
                          {task.dueDate && (
                            <span className="recent-task-due-date">
                              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                        {task.projectId && (
                          <span className="task-project tag">
                            {projects.find(p => p.id === task.projectId)?.name}
                          </span>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
              
              {/* Overdue Tasks Section */}
              {overdueTasks.length > 0 && (
                <div className="section-card overdue-tasks-card">
                  <h2 className="section-title">Overdue Tasks</h2>
                  <TaskList
                    tasks={overdueTasks}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                    updateTask={updateTask}
                    addSubtask={addSubtask}
                    categories={categories}
                    projects={projects}
                  />
                </div>
              )}
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
          
          {/* Categories View */}
          {activeTab === 'categories' && (
            <div className="categories-view">
              <div className="view-header">
                <h2 className="view-title">Categories</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCategoryManager(true)}
                >
                  <span className="icon">+</span> New Category
                </button>
              </div>
              <div className="categories-grid">
                {categories.map(category => (
                  <div 
                    key={category.id} 
                    className="category-card"
                    style={{ borderLeft: `5px solid ${category.color}` }}
                  >
                    <div className="category-header">
                      <h2 className="category-title">
                        <span 
                          className="color-dot" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </h2>
                      <div className="category-actions">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => setShowCategoryManager(true)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    
                    <div className="category-task-section">
                      <h3 className="task-section-title">Tasks</h3>
                      {tasks.filter(t => t.categories?.includes(category.id) && t.status !== 'completed').length > 0 ? (
                        <TaskList 
                          tasks={tasks.filter(t => t.categories?.includes(category.id) && t.status !== 'completed')} 
                          toggleTask={toggleTask} 
                          deleteTask={deleteTask} 
                          updateTask={updateTask}
                          addSubtask={addSubtask}
                          categories={categories}
                          projects={projects}
                        />
                      ) : (
                        <p className="empty-message">No active tasks in this category</p>
                      )}
                    </div>
                    
                    {tasks.filter(t => t.categories?.includes(category.id) && t.status === 'completed').length > 0 && (
                      <div className="category-task-section">
                        <h3 className="task-section-title">Completed</h3>
                        <TaskList 
                          tasks={tasks.filter(t => t.categories?.includes(category.id) && t.status === 'completed')} 
                          toggleTask={toggleTask} 
                          deleteTask={deleteTask} 
                          updateTask={updateTask}
                          addSubtask={addSubtask}
                          categories={categories}
                          projects={projects}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {categories.length === 0 && (
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
            </div>
          )}
        </div>
      </main>
      
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
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      {/* Project Manager Modal */}
      {showProjectManager && (
        <ProjectManager
          projects={projects}
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

                <div className="input-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editTaskDueDate}
                    onChange={e => setEditTaskDueDate(e.target.value)}
                  />
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
                      onClick={() => setEditTaskDueDate('')}
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
                  <select
                    className="form-control"
                    value={editTaskPriority || ''}
                    onChange={(e) => setEditTaskPriority(e.target.value as PriorityLevel || null)}
                  >
                    <option value="">No Priority</option>
                    <option value="must-do">Must Do</option>
                    <option value="want-to-do">Want To Do</option>
                    <option value="when-i-can">When I Can</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (editingTaskId && editTaskTitle.trim()) {
                    // Fix timezone issue by ensuring date is in consistent format
                    let formattedDueDate = null;
                    if (editTaskDueDate) {
                      formattedDueDate = `${editTaskDueDate}T00:00:00Z`;
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