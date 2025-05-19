// src/components/TaskList.tsx
import { useState, useEffect } from 'react';
import { Task, Subtask, TaskListProps, Category, Project, PriorityLevel } from '../types';
import TaskBreakdown from './TaskBreakdown';
import TimeEstimator from './TimeEstimator';

export default function TaskList({
  tasks,
  toggleTask,
  deleteTask,
  updateTask,
  updateTaskDescription,
  addSubtask,
  updateTaskEstimate,
  startTaskTimer,
  completeTaskTimer,
  categories,
  projects,
}: TaskListProps) {
  console.log('TaskList rendered with', tasks.length, 'tasks');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editDueTime, setEditDueTime] = useState<string>('');
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [editPriority, setEditPriority] = useState<PriorityLevel>(null);

  
  // States for subtask creation
  const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // State for expanded/collapsed tasks
  // Initialize with all tasks that have subtasks already expanded
  const [collapsedTasks, setCollapsedTasks] = useState<{[key: string]: boolean}>(() => {
    const initialState: {[key: string]: boolean} = {};
    
    // For each task, check if it has subtasks and initialize it as expanded
    tasks.forEach(t => {
      const hasSubtasks = tasks.some(subtask => subtask.parentId === t.id);
      if (hasSubtasks) {
        // Set to false means expanded
        initialState[t.id] = false;
      }
    });
    
    return initialState;
  });

  // Only render top-level tasks (no parentId)
  const topLevelTasks = tasks.filter(t => !t.parentId);
  
  // Debug count of all tasks vs top-level vs subtasks
  console.log(`TaskList received ${tasks.length} total tasks (${topLevelTasks.length} top-level, ${tasks.length - topLevelTasks.length} subtasks)`);
  
  // If there are subtasks, log the first few for debugging
  if (tasks.length - topLevelTasks.length > 0) {
    const subtasks = tasks.filter(t => t.parentId);
    console.log('Sample subtasks:');
    subtasks.slice(0, 3).forEach(st => 
      console.log(`  Subtask "${st.title}" (ID: ${st.id}) for parent: ${st.parentId}`)
    );
  }

  // Toggle collapsed state of a task
  const toggleCollapsed = (taskId: string) => {
    setCollapsedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  // Listen for custom events to expand a task's subtasks
  useEffect(() => {
    const handleExpandTask = (e: any) => {
      const { taskId } = e.detail;
      console.log(`Received expand event for task: ${taskId}`);
      
      // Ensure the task is expanded
      setCollapsedTasks(prev => ({
        ...prev,
        [taskId]: false
      }));
      
      // Scroll to the task if possible
      try {
        setTimeout(() => {
          // Delayed scroll to ensure elements are updated
          const taskElement = document.getElementById(`task-${taskId}`);
          if (taskElement) {
            console.log('Scrolling to task:', taskId);
            taskElement.scrollIntoView({ behavior: 'smooth' });
            taskElement.classList.add('highlight-task');
            setTimeout(() => {
              taskElement.classList.remove('highlight-task');
            }, 2000);
          } else {
            console.log('Task element not found after delay:', taskId);
          }
        }, 300); // Delay scroll to ensure DOM is updated
      } catch (e) {
        console.error('Error scrolling to task:', e);
      }
    };
    
    document.addEventListener('expandTaskSubtasks', handleExpandTask);
    
    return () => {
      document.removeEventListener('expandTaskSubtasks', handleExpandTask);
    };
  }, []);

  // Check if a task has subtasks
  const hasSubtasks = (taskId: string) => {
    return tasks.some(t => t.parentId === taskId);
  };

  // Get all subtasks for a given parent - with localStorage fallback
  const getSubtasks = (parentId: string): Task[] => {
    // Enhanced debug information to track the issue
    console.log(`Searching for subtasks with parentId=${parentId}`);
    console.log(`Current tasks array has ${tasks.length} total tasks`);
    
    // Show some example tasks from the array for debugging
    if (tasks.length > 0) {
      console.log("Sample tasks with their parentId values:");
      tasks.slice(0, 5).forEach(t => {
        console.log(`Task ID: ${t.id}, Title: ${t.title}, ParentID: ${t.parentId}`);
      });
    }
    
    // Check for any tasks with non-null parentId
    const anySubtasks = tasks.filter(t => t.parentId !== null && t.parentId !== undefined);
    console.log(`Found ${anySubtasks.length} tasks with non-null parentId in the system`);
    
    // Normal filtering from props
    const propsResult = tasks.filter(t => t.parentId === parentId);
    
    // Only check localStorage if no subtasks found in props
    if (propsResult.length === 0) {
      // Try getting subtasks directly from localStorage
      try {
        const stored = localStorage.getItem('tasks');
        if (stored) {
          const parsedTasks = JSON.parse(stored);
          const storageResult = parsedTasks.filter((t: Task) => t.parentId === parentId);
          
          if (storageResult.length > 0) {
            console.log(`🔄 Found ${storageResult.length} subtasks for parent ${parentId} in localStorage that weren't in props!`);
            // Return subtasks from localStorage - will be synced on next render
            return storageResult;
          }
        }
      } catch (e) {
        console.error('Error checking localStorage for subtasks:', e);
      }
    }
    
    console.log(`getSubtasks(${parentId}) found ${propsResult.length} subtasks:`, 
      propsResult.map(t => `${t.id}: ${t.title}`));
    return propsResult;
  };

  // Handle subtask creation
  const handleAddSubtask = (parentId: string) => {
    if (newSubtaskTitle.trim()) {
      addSubtask(parentId, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setAddingSubtaskFor(null);
      
      // Auto-expand the parent when adding a subtask
      setCollapsedTasks(prev => ({
        ...prev,
        [parentId]: false
      }));
    }
  };
  
  // Render a task and its subtasks recursively
  const renderTask = (task: Task, depth = 0) => {
    const isCollapsed = collapsedTasks[task.id];
    const taskSubtasks = getSubtasks(task.id);
    const hasChildren = taskSubtasks.length > 0;

    // Add a class for subtasks
    const isSubtask = !!task.parentId;

    // Determine the color for the category (use the first category if available)
    const categoryColor =
      task.categories && task.categories.length > 0
        ? (categories.find(c => c.id === task.categories![0])?.color || "#bdbdbd")
        : "#bdbdbd";

    return (
      <div
        key={task.id}
        className={
          [
            depth === 0
              ? "bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100 hover:shadow-lg transition-all"
              : "bg-blue-50 border-l-4 border-blue-400 rounded-md mt-1 mb-2 ml-4 p-3",
          ].join(' ')
        }
      >
        <div
          id={`task-${task.id}`}
          className={
            [
              isSubtask ? "" : "flex flex-col gap-2",
              task.status === 'completed' ? 'opacity-60 line-through' : '',
              hasChildren && !isSubtask ? 'border-l-4 border-blue-200' : '',
              !isCollapsed && hasChildren ? 'bg-blue-50' : '',
            ].join(' ')
          }
        >
          {editingId === task.id ? (
            // Edit mode
            <div className="task-edit-form">
              <input
                type="text"
                className="form-control"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
              />
              
              <div className="input-group">
                <label className="form-label">Due Date</label>
                <div className="date-time-inputs">
                  <input
                    type="date"
                    className="form-control"
                    value={editDueDate}
                    onChange={e => setEditDueDate(e.target.value)}
                  />
                  <input
                    type="time"
                    className="form-control"
                    value={editDueTime}
                    onChange={e => setEditDueTime(e.target.value)}
                    placeholder="Optional time"
                  />
                </div>
                <div className="date-shortcuts">
                  <button
                    type="button"
                    className={`date-shortcut-btn ${editDueDate === new Date().toISOString().split('T')[0] ? 'active' : ''}`}
                    onClick={() => {
                      const today = new Date();
                      const dateString = today.toISOString().split('T')[0];
                      setEditDueDate(dateString);
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
                      setEditDueDate(dateString);
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
                      setEditDueDate(dateString);
                    }}
                  >
                    Next Week
                  </button>
                  <button
                    type="button"
                    className="date-shortcut-btn"
                    onClick={() => {
                      setEditDueDate('');
                      setEditDueTime('');
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
                      className={`category-option ${editCategories.includes(category.id) ? 'selected' : ''}`}
                      style={{
                        backgroundColor: editCategories.includes(category.id) ? category.color : 'transparent',
                        border: `1px solid ${category.color}`
                      }}
                      onClick={() => {
                        if (editCategories.includes(category.id)) {
                          setEditCategories(editCategories.filter(id => id !== category.id));
                        } else {
                          setEditCategories([...editCategories, category.id]);
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
                  value={editProjectId || ''}
                  onChange={(e) => setEditProjectId(e.target.value || null)}
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
                    className={`priority-option critical ${editPriority === 'critical' ? 'selected' : ''}`}
                    onClick={() => setEditPriority('critical')}
                  >
                    Critical
                  </div>
                  <div 
                    className={`priority-option high ${editPriority === 'high' ? 'selected' : ''}`}
                    onClick={() => setEditPriority('high')}
                  >
                    High
                  </div>
                  <div 
                    className={`priority-option medium ${editPriority === 'medium' ? 'selected' : ''}`}
                    onClick={() => setEditPriority('medium')}
                  >
                    Medium
                  </div>
                  <div 
                    className={`priority-option low ${editPriority === 'low' ? 'selected' : ''}`}
                    onClick={() => setEditPriority('low')}
                  >
                    Low
                  </div>
                  <div 
                    className={`priority-option ${!editPriority ? 'selected' : ''}`}
                    onClick={() => setEditPriority(null)}
                  >
                    None
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between gap-sm">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    // Format the date based on whether time is provided
                    let formattedDueDate = null;
                    if (editDueDate) {
                      // Only add time if it's provided
                      formattedDueDate = editDueTime
                        ? `${editDueDate}T${editDueTime}`
                        : editDueDate;
                    }
                    updateTask(
                      task.id,
                      editTitle,
                      formattedDueDate,
                      editCategories,
                      editProjectId,
                      undefined, // dependsOn parameter (not changed)
                      editPriority // pass priority
                    );
                    setEditingId(null);
                  }}
                >
                  Save
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <>
              <div className="task-header">
                <div className="task-title-container">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => toggleTask(task.id)}
                  />
                  {isSubtask && (
                    <span
                      style={{
                        fontSize: "0.85em",
                        color: "#2196f3",
                        marginRight: "6px",
                        fontWeight: 500,
                        letterSpacing: "0.5px",
                      }}
                      title="Subtask"
                    >
                      ⮑ Subtask
                    </span>
                  )}
                  {hasChildren && (
                    <span 
                      className="task-collapse-toggle"
                      onClick={() => toggleCollapsed(task.id)}
                      role="button"
                      aria-label={isCollapsed ? "Expand subtasks" : "Collapse subtasks"}
                    >
                      {isCollapsed ? '+' : '-'}
                    </span>
                  )}
                  
                  <h3 
                    className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}
                    onClick={() => {
                      setEditingId(task.id);
                      setEditTitle(task.title);
                      setEditDueDate(task.dueDate || '');
                      setEditDueTime(task.dueTime || '');
                      setEditCategories(task.categories || []);
                      setEditProjectId(task.projectId ?? null);
                      setEditPriority(task.priority ?? null);
                    }}
                  >
                    {task.title}
                  </h3>
                </div>
                
                <div className="task-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      // Automatically expand the task when adding a subtask
                      if (collapsedTasks[task.id]) {
                        toggleCollapsed(task.id);
                      }
                      setAddingSubtaskFor(task.id);
                    }}
                  >
                    Add Subtask
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)} 
                    className="btn btn-sm btn-muted" 
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="task-meta">
                {task.dueDate && (
                  <span className="task-date">
                    {/* Apply consistent date formatting with timezone handling */}
                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                    {task.dueTime && (
                      <span className="task-time">
                        {" at "}
                        {task.dueTime.substring(0, 5)}
                      </span>
                    )}
                  </span>
                )}

                {/* Display priority indicator */}
                {task.priority && (
                  <span className={`priority-badge ${task.priority}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                )}
                
                {/* Add time estimator component */}
                {updateTaskEstimate && startTaskTimer && completeTaskTimer && (
                  <TimeEstimator
                    task={task}
                    updateTaskEstimate={updateTaskEstimate}
                    startTaskTimer={startTaskTimer}
                    completeTaskTimer={completeTaskTimer}
                  />
                )}

                {task.categories && task.categories.length > 0 &&
                  task.categories.map(categoryId => {
                    const category = categories.find(c => c.id === categoryId);
                    return category ? (
                      <span
                        key={categoryId}
                        className="task-category"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                    ) : null;
                  })
                }

                {task.projectId && (
                  <span className="task-project">
                    {projects.find(p => p.id === task.projectId)?.name || 'Unknown Project'}
                  </span>
                )}
              </div>
              
              {/* Add subtask form */}
              {addingSubtaskFor === task.id && (
                <div className="subtask-form">
                  <div className="flex gap-sm">
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="New subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    />
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleAddSubtask(task.id)}
                    >
                      Add
                    </button>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setAddingSubtaskFor(null);
                        setNewSubtaskTitle('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {/* Add TaskBreakdown for top-level tasks only */}
              {depth === 0 && !task.parentId && (
                <TaskBreakdown 
                  task={task} 
                  subtasks={getSubtasks(task.id)} 
                  addSubtask={addSubtask}
                  toggleTask={toggleTask}
                  updateTaskDescription={updateTaskDescription}
                />
              )}
            </>
          )}
        </div>

        {/* Render subtasks */}
        {hasChildren && !isCollapsed && (
          <div className="subtasks">
            {taskSubtasks.map(subtask => renderTask(subtask, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="task-list">
      {topLevelTasks.map(task => renderTask(task))}
      
      {topLevelTasks.length === 0 && (
        <div className="empty-state">
          <p>No tasks yet. Add your first task above.</p>
        </div>
      )}
    </div>
  );
}