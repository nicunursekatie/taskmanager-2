// src/components/TaskList.tsx
import { useState } from 'react';
import { Task, Subtask, TaskListProps, Category, Project } from '../types';

export default function TaskList({
  tasks,
  toggleTask,
  deleteTask,
  updateTask,
  addSubtask,
  categories,
  projects,
}: TaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [editPriority, setEditPriority] = useState<string | null>(null);
  
  // States for subtask creation
  const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // State for expanded/collapsed tasks
  const [collapsedTasks, setCollapsedTasks] = useState<{[key: string]: boolean}>({});

  // Only render top-level tasks (no parentId)
  const topLevelTasks = tasks.filter(t => !t.parentId);

  // Toggle collapsed state of a task
  const toggleCollapsed = (taskId: string) => {
    setCollapsedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Check if a task has subtasks
  const hasSubtasks = (taskId: string) => {
    return tasks.some(t => t.parentId === taskId);
  };

  // Get all subtasks for a given parent
  const getSubtasks = (parentId: string): Task[] => {
    return tasks.filter(t => t.parentId === parentId);
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

    // Get the category color for the task's left border
    const categoryColor = task.categories?.length
      ? categories.find(c => c.id === task.categories![0])?.color || '#666'
      : '#666';

    // Get priority class
    const priorityClass = task.priority ? `priority-${task.priority}` : '';

    return (
      <div key={task.id} style={{ marginLeft: `${depth * 20}px` }}>
        <div
          id={`task-${task.id}`}
          className={`task-item ${task.status === 'completed' ? 'completed' : ''} ${priorityClass}`}
          style={{
            borderLeft: hasChildren ? `4px solid ${categoryColor}` : undefined
          }}
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
                <input
                  type="date"
                  className="form-control"
                  value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)}
                />
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
                    onClick={() => setEditDueDate('')}
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
                <select
                  className="form-control"
                  value={editPriority || ''}
                  onChange={(e) => setEditPriority(e.target.value || null)}
                >
                  <option value="">No Priority</option>
                  <option value="must-do">Must Do</option>
                  <option value="want-to-do">Want To Do</option>
                  <option value="when-i-can">When I Can</option>
                </select>
              </div>
              
              <div className="flex justify-between gap-sm">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    // Fix timezone issue by ensuring date is in consistent format
                    let formattedDueDate = null;
                    if (editDueDate) {
                      formattedDueDate = `${editDueDate}T00:00:00Z`;
                    }
                    updateTask(
                      task.id,
                      editTitle,
                      formattedDueDate,
                      editCategories,
                      editProjectId,
                      undefined, // dependsOn parameter (not changed)
                      editPriority as any // pass priority
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
                      setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
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
                      day: 'numeric',
                      timeZone: 'UTC'  // Use UTC to maintain consistent date
                    })}
                  </span>
                )}

                {/* Display priority indicator */}
                {task.priority && (
                  <span className={`task-priority ${task.priority}`}>
                    {task.priority === 'must-do' ? 'Must Do' :
                     task.priority === 'want-to-do' ? 'Want To Do' :
                     'When I Can'}
                  </span>
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