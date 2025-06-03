// src/App.tsx
import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react'; // Added lazy and Suspense
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
import './styles/undo-notification.css';
import './styles/bulk-actions.css';
import { useCategories } from './hooks/useCategories';

// Component imports
import TaskList from './components/TaskList';
// Lazy load view components
const DashboardView = lazy(() => import('./components/DashboardView'));
const AllTasksView = lazy(() => import('./components/AllTasksView'));
const ProjectsView = lazy(() => import('./components/ProjectsView'));
const CategoriesView = lazy(() => import('./components/CategoriesView'));
const CalendarViewTab = lazy(() => import('./components/CalendarViewTab'));
const DailyPlannerView = lazy(() => import('./components/DailyPlannerView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
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
import UndoNotification from './components/UndoNotification';

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
    console.log('🔧 App.tsx: API key check useEffect starting...');
    console.time('App.tsx: API key check');
    try {
      checkApiKeyStatus();
      console.log('✅ App.tsx: API key check completed');
    } catch (e) {
      console.error('❌ App.tsx: API key check failed:', e);
    }
    console.timeEnd('App.tsx: API key check');
  }, []);

  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any;
          console.warn('⚡ Layout shift detected:', {
            value: layoutShift.value,
            hadRecentInput: layoutShift.hadRecentInput,
            sources: layoutShift.sources?.map((source: any) => ({
              node: source.node,
              currentRect: source.currentRect,
              previousRect: source.previousRect
            }))
          });
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      return () => observer.disconnect();
    }
  }, []);

  // selectedCategoryId state and related useEffect have been moved to CategoriesView.tsx
  
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
  // const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null); // Moved to CategoriesView
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
  
  // Undo state
  const [undoInfo, setUndoInfo] = useState<{
    taskId: string;
    taskTitle: string;
    previousStatus: 'pending' | 'completed';
  } | null>(null);
  
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
    console.log('💾 App.tsx: Saving categories to localStorage, count:', categories.length);
    console.time('App.tsx: Categories localStorage save');
    localStorage.setItem('categories', JSON.stringify(categories));
    console.timeEnd('App.tsx: Categories localStorage save');
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

  // Wrapper for toggleTask to add undo functionality
  const toggleTaskWithUndo = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      // Only show undo notification when marking as completed
      if (task.status === 'pending') {
        setUndoInfo({
          taskId: task.id,
          taskTitle: task.title,
          previousStatus: task.status
        });
      }
      toggleTask(taskId);
    }
  };

  // Handle undo
  const handleUndo = () => {
    if (undoInfo) {
      toggleTask(undoInfo.taskId);
      setUndoInfo(null);
    }
  };
  
  // Handle bulk actions
  const handleBulkAction = (action: string, selectedIds: string[], data?: any) => {
    switch (action) {
      case 'delete':
        // Delete all selected tasks
        selectedIds.forEach(id => deleteTask(id));
        break;
      
      case 'assignProject':
        // Assign all selected tasks to a project
        if (data?.projectId) {
          selectedIds.forEach(id => {
            const task = tasks.find(t => t.id === id);
            if (task) {
              updateTask(id, task.title, task.dueDate || null, task.categories, data.projectId);
            }
          });
        }
        break;
      
      case 'convertToSubtasks':
        // Convert all selected tasks to subtasks of a parent
        if (data?.parentId) {
          selectedIds.forEach(id => moveTaskToParent(id, data.parentId));
        }
        break;
      
      case 'markComplete':
        // Mark all selected tasks as complete
        selectedIds.forEach(id => {
          const task = tasks.find(t => t.id === id);
          if (task && task.status === 'pending') {
            toggleTask(id);
          }
        });
        break;
    }
  };

  // Start editing a category or project
  const startEditing = (item: Category | Project) => {
    if ('color' in item) {
      // It's a category
      setEditingCategoryId(item.id);
      setShowCategoryManager(true);
    } else {
      // It's a project
      setEditingProject(item);
      setShowProjectManager(true);
    }
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
  // const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // Moved to DashboardView
  // const nextWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7); // Not used directly here anymore

  // Import isDateBefore for overdueTasks calculation
  import { isDateBefore } from './utils/dateUtils';

  const overdueTasks = useMemo(() => {
    return tasks.filter(
      task => task.dueDate && isDateBefore(task.dueDate, todayStart) && task.status !== 'completed' && !task.parentId
    );
  }, [tasks, todayStart]);

  // todayTasks logic moved to DashboardView.tsx
  // upcomingTasks logic moved to DashboardView.tsx
  // completedTasks logic moved to AllTasksView.tsx
  
  // Parent task options for the capture bar
  const parentOptions = useMemo(() => tasks.filter(task => !task.parentId).map(task => ({
    id: task.id,
    title: task.title,
  })), [tasks, activeTab]);

  console.log('🎯 App.tsx: Rendering with activeTab:', activeTab, 'focusMode:', focusModeActive);
  console.time('App.tsx: Main render');
  
  const result = (
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
            toggleTask={toggleTaskWithUndo}
            deleteTask={deleteTask}
            updateTask={updateTask}
            updateTaskDescription={updateTaskDescription}
            addSubtask={addSubtask}
            updateTaskEstimate={updateTaskEstimate}
            startTaskTimer={startTaskTimer}
            completeTaskTimer={completeTaskTimer}
            categories={categories}
            projects={projects}
            onExitFocusMode={() => setFocusModeActive(false)}
            // Pass modal editing props
            setEditingTaskId={setEditingTaskId}
            setEditTaskTitle={setEditTaskTitle}
            setEditTaskDueDate={setEditTaskDueDate}
            setEditTaskDueTime={setEditTaskDueTime}
            setEditTaskCategories={setEditTaskCategories}
            setEditTaskProjectId={setEditTaskProjectId}
            setEditTaskPriority={setEditTaskPriority}
            setShowTaskEditModal={setShowTaskEditModal}
          />
        ) : (
          <>
        {/* Capture Bar */}
        <CaptureBar
          addTask={(title, dueDate, categoryIds, projectId, dependsOn) => {
            addTask({
              title,
              dueDate,
              categories: categoryIds ? [...categoryIds] : [],
              projectId: typeof projectId === 'string' ? projectId : null,
              status: 'pending'
            });
          }}
          newParent={newParent}
          setNewParent={setNewParent}
          parentOptions={parentOptions}
          categories={categories}
          projects={projects}
        />
        
        {/* Main Content Area */}
        <Suspense fallback={<div className="text-center p-8 text-xl font-semibold text-gray-500">Loading page...</div>}>
          <div className="content-area">
            {/* Daily Planner */}
            {activeTab === 'daily-planner' && (
              <DailyPlannerView
                tasks={tasks}
                timeBlocks={timeBlocks}
                addTimeBlock={addTimeBlock}
                updateTimeBlock={updateTimeBlock}
                deleteTimeBlock={deleteTimeBlock}
                assignTaskToBlock={assignTaskToBlock}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                updateTaskEstimate={updateTaskEstimate}
              />
            )}

            {/* Settings View */}
            {activeTab === 'settings' && (
              <SettingsView setActiveTab={setActiveTab} />
            )}

            {/* Calendar View */}
            {activeTab === 'calendar' && (
              <CalendarViewTab
                tasks={tasks}
                toggleTaskWithUndo={toggleTaskWithUndo}
                categories={categories}
                projects={projects}
              />
            )}

            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
              <DashboardView
                tasks={tasks}
                projects={projects}
                categories={categories}
                toggleTaskWithUndo={toggleTaskWithUndo}
                deleteTask={deleteTask}
                updateTask={updateTask}
                updateTaskDescription={updateTaskDescription}
                addSubtask={addSubtask}
                updateTaskEstimate={updateTaskEstimate}
                startTaskTimer={startTaskTimer}
                completeTaskTimer={completeTaskTimer}
                moveTaskToParent={moveTaskToParent}
                setActiveTab={setActiveTab}
                setEditingTaskId={setEditingTaskId}
                setEditTaskTitle={setEditTaskTitle}
                setEditTaskDueDate={setEditTaskDueDate}
                setEditTaskDueTime={setEditTaskDueTime}
                setEditTaskCategories={setEditTaskCategories}
                setEditTaskProjectId={setEditTaskProjectId}
                setEditTaskPriority={setEditTaskPriority}
                setShowTaskEditModal={setShowTaskEditModal}
              />
            )}

            {/* All Tasks View */}
            {activeTab === 'all-tasks' && (
              <AllTasksView
                tasks={tasks}
                categories={categories}
                projects={projects}
                toggleTaskWithUndo={toggleTaskWithUndo}
                deleteTask={deleteTask}
                updateTask={updateTask}
                updateTaskDescription={updateTaskDescription}
                addSubtask={addSubtask}
                moveTaskToParent={moveTaskToParent}
                handleBulkAction={handleBulkAction}
                updateTaskEstimate={updateTaskEstimate}
                startTaskTimer={startTaskTimer}
                completeTaskTimer={completeTaskTimer}
                setEditingTaskId={setEditingTaskId}
                setEditTaskTitle={setEditTaskTitle}
                setEditTaskDueDate={setEditTaskDueDate}
                setEditTaskDueTime={setEditTaskDueTime}
                setEditTaskCategories={setEditTaskCategories}
                setEditTaskProjectId={setEditTaskProjectId}
                setEditTaskPriority={setEditTaskPriority}
                setShowTaskEditModal={setShowTaskEditModal}
              />
            )}

            {/* Projects View */}
            {activeTab === 'projects' && (
              <ProjectsView
                tasks={tasks}
                projects={projects}
                startEditingProjectOrCategory={startEditing}
                deleteProject={deleteProject}
                toggleTaskWithUndo={toggleTaskWithUndo}
                setEditingTaskId={setEditingTaskId}
                setEditTaskTitle={setEditTaskTitle}
                setEditTaskDueDate={setEditTaskDueDate}
                setEditTaskDueTime={setEditTaskDueTime}
                setEditTaskCategories={setEditTaskCategories}
                setEditTaskProjectId={setEditTaskProjectId}
                setEditTaskPriority={setEditTaskPriority}
                setShowTaskEditModal={setShowTaskEditModal}
                // Pass other task functions if ProjectsView uses TaskList or similar directly
                updateTask={updateTask}
                updateTaskDescription={updateTaskDescription}
                addSubtask={addSubtask}
                moveTaskToParent={moveTaskToParent}
                updateTaskEstimate={updateTaskEstimate}
                startTaskTimer={startTaskTimer}
                completeTaskTimer={completeTaskTimer}
              />
            )}

            {/* Categories View - Grid View (All Categories) */}
            {activeTab === 'categories' && (
              <CategoriesView
                tasks={tasks}
                projects={projects}
                categories={categories}
                setShowCategoryManager={setShowCategoryManager}
                startEditingCategoryOrProject={startEditing}
                addTask={addTask}
                toggleTaskWithUndo={toggleTaskWithUndo}
                deleteTask={deleteTask}
                updateTask={updateTask}
                updateTaskDescription={updateTaskDescription}
                addSubtask={addSubtask}
                moveTaskToParent={moveTaskToParent}
                setEditingTaskId={setEditingTaskId}
                setEditTaskTitle={setEditTaskTitle}
                setEditTaskDueDate={setEditTaskDueDate}
                setEditTaskDueTime={setEditTaskDueTime}
                setEditTaskCategories={setEditTaskCategories}
                setEditTaskProjectId={setEditTaskProjectId}
                setEditTaskPriority={setEditTaskPriority}
                setShowTaskEditModal={setShowTaskEditModal}
                setActiveTab={setActiveTab}
                updateTaskEstimate={updateTaskEstimate}
                startTaskTimer={startTaskTimer}
                completeTaskTimer={completeTaskTimer}
              />
            )}
          </div>
        </Suspense>
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
                {/* Subtask count display */}
                {tasks.filter(t => t.parentId === editingTaskId).length > 0 && (
                  <div className="text-xs text-light mb-xs">
                    {tasks.filter(t => t.parentId === editingTaskId).length} subtask
                    {tasks.filter(t => t.parentId === editingTaskId).length !== 1 ? 's' : ''}
                  </div>
                )}
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
                        onClick={() => setEditTaskPriority(priority as PriorityLevel)}
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
                          editTaskProjectId
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
      
      {/* Undo Notification */}
      {undoInfo && (
        <UndoNotification
          message={`Task "${undoInfo.taskTitle}" marked as completed`}
          onUndo={handleUndo}
          onDismiss={() => setUndoInfo(null)}
        />
      )}
    </div>
  );
  
  console.timeEnd('App.tsx: Main render');
  return result;
}

export default App;
