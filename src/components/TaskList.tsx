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
  moveTaskToParent,
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
  const [subtaskTitles, setSubtaskTitles] = useState<{ [parentId: string]: string }>({});
  
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

  // Get all subtasks for a given parent
  const getSubtasks = (parentId: string): Task[] => {
    const result = tasks.filter(t => t.parentId === parentId);
    console.log(`getSubtasks(${parentId}) found ${result.length} subtasks from props.`);
    // Optional: Log the found subtasks if needed for debugging, e.g.:
    // if (result.length > 0) {
    //   console.log(result.map(t => ({id: t.id, title: t.title})));
    // }
    return result;
  };

  // Handle subtask creation
  const handleAddSubtask = (parentId: string) => {
    const title = subtaskTitles[parentId]?.trim();
    if (title) {
      addSubtask(parentId, title);
      setSubtaskTitles(prev => {
        const updated = { ...prev };
        delete updated[parentId];
        return updated;
      });
      setAddingSubtaskFor(null);
    }
  };
  
  // State for converting a task to a subtask
  const [convertTaskId, setConvertTaskId] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  
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
              ? "task-list-item py-2 px-0 border-b border-gray-200 last:border-b-0"
              : "task-list-item subtask",
          ].join(' ')
        }
        style={isSubtask ? { marginLeft: depth * 24, background: '#f7faff', padding: '6px 12px', borderRadius: 4, fontSize: '0.95em', borderLeft: '2px solid #e0e0e0', marginTop: 4, marginBottom: 4 } : {}}
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
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleTask(task.id);
                    }}
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
                    style={{ color: task.status === 'completed' ? '#888' : '#222', fontWeight: 500 }}
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
                {/* Show actions for both top-level tasks and subtasks */}
                <div className="task-actions">
                  {!isSubtask && (
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setAddingSubtaskFor(task.id);
                        if (isCollapsed) {
                          toggleCollapsed(task.id);
                        }
                      }}
                    >
                      Add Subtask
                    </button>
                  )}
                  <button 
                    onClick={() => deleteTask(task.id)} 
                    className="btn btn-sm btn-muted" 
                    title="Delete task"
                  >
                    🗑️
                  </button>
                  {/* Convert to Subtask button - only for top-level tasks */}
                  {!isSubtask && (
                    <button
                      className="btn btn-sm btn-outline"
                      style={{ marginLeft: 8 }}
                      onClick={() => {
                        setConvertTaskId(task.id);
                        setSelectedParentId(null);
                      }}
                    >
                      Convert to Subtask
                    </button>
                  )}
                </div>
              </div>
              {/* Convert to Subtask dropdown */}
              {!isSubtask && convertTaskId === task.id && (
                <div className="convert-subtask-dropdown" style={{ marginTop: 8 }}>
                  <select
                    className="form-control"
                    value={selectedParentId || ''}
                    onChange={e => setSelectedParentId(e.target.value)}
                  >
                    <option value="">Select parent task...</option>
                    {topLevelTasks
                      .filter(t => t.id !== task.id) // Exclude self
                      .map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                  </select>
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ marginLeft: 8 }}
                    disabled={!selectedParentId}
                    onClick={() => {
                      if (selectedParentId) {
                        moveTaskToParent(task.id, selectedParentId);
                        setConvertTaskId(null);
                        setSelectedParentId(null);
                      }
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    style={{ marginLeft: 4 }}
                    onClick={() => {
                      setConvertTaskId(null);
                      setSelectedParentId(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="task-meta">
                {task.dueDate && (
                  <span className="task-date" style={{ color: '#444' }}>
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
                {task.priority && (
                  <span className={`priority-badge ${task.priority}`} style={{ color: '#222' }}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                )}
                {updateTaskEstimate && startTaskTimer && completeTaskTimer && !isSubtask && (
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
                        style={{ backgroundColor: category.color, color: '#fff' }}
                      >
                        {category.name}
                      </span>
                    ) : null;
                  })
                }
                {task.projectId && !isSubtask && (
                  <span className="task-project" style={{ color: '#4361ee' }}>
                    {projects.find(p => p.id === task.projectId)?.name || 'Unknown Project'}
                  </span>
                )}
              </div>
              {/* Add subtask form only for top-level tasks */}
              {!isSubtask && addingSubtaskFor === task.id && (
                <div className="subtask-form">
                  <div className="flex gap-sm">
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="New subtask..."
                    value={subtaskTitles[task.id] || ''}
                    onChange={(e) =>
                      setSubtaskTitles(prev => ({
                        ...prev,
                        [task.id]: e.target.value,
                      }))
                    }
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
                        setSubtaskTitles(prev => {
                          const updated = { ...prev };
                          delete updated[task.id];
                          return updated;
                        });
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
        {/* Render subtasks as a nested list */}
        {hasChildren && !isCollapsed && (
          <ul className="subtask-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
            {taskSubtasks.map(subtask => (
              <li key={subtask.id}>
                {renderTask(subtask, depth + 1)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-border rounded-lg p-0">
      <h2 className="px-6 pt-6 pb-2 text-xl font-bold text-primary">All Tasks</h2>
      {topLevelTasks.length === 0 ? (
        <div className="text-center text-light py-lg">No tasks yet. Add your first task above.</div>
      ) : (
        <div className="tasks-container">
          {topLevelTasks.map(task => renderTask(task))}
        </div>
      )}
    </div>
  );
}