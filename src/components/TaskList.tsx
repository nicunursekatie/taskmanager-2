// src/components/TaskList.tsx
import { useState } from 'react';
import { Task, Category, Project } from '../types';

type TaskListProps = {
  tasks: Task[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (
    id: string, 
    title: string, 
    dueDate: string | null,
    categories?: string[],
    projectId?: string | null
  ) => void;
  categories: Category[];
  projects: Project[];
};

export default function TaskList({
  tasks,
  toggleTask,
  deleteTask,
  updateTask,
  categories,
  projects,
}: TaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);

  // Only render top-level tasks (no parentId)
  const topTasks = tasks.filter(t => !t.parentId);

  // Helper function to get task classes
  const getTaskClasses = (task: Task) => {
    let classes = 'task-item';
    
    if (task.status === 'completed') {
      classes += ' completed';
    } else {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      if (task.dueDate && task.dueDate < today) {
        classes += ' overdue';
      }
    }
    
    return classes;
  };

  return (
    <div className="task-list">
      {topTasks.map(task => (
        <div 
          key={task.id} 
          className={getTaskClasses(task)}
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
                        border: `1px solid ${category.color}`,
                        color: editCategories.includes(category.id) ? 'white' : category.color,
                        padding: '4px 8px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'inline-block',
                        margin: '0 4px 4px 0'
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
              
              <div className="flex justify-between gap-sm">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    updateTask(task.id, editTitle, editDueDate || null, editCategories, editProjectId);
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
                <div className="task-title-wrapper">
                  <input 
                    type="checkbox" 
                    checked={task.status === 'completed'}
                    onChange={() => toggleTask(task.id)}
                    className="task-checkbox"
                  />
                  <h3 
                    className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}
                    onClick={() => {
                      setEditingId(task.id);
                      setEditTitle(task.title);
                      setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                      setEditCategories(task.categories || []);
                      setEditProjectId(task.projectId ?? null);
                    }}
                  >
                    {task.title}
                  </h3>
                </div>
                
                <div className="task-actions">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => {
                      setEditingId(task.id);
                      setEditTitle(task.title);
                      setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
                      setEditCategories(task.categories || []);
                      setEditProjectId(task.projectId ?? null);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="task-meta">
                {task.dueDate && (
                  <span className="task-date">
                    {new Date(task.dueDate).toLocaleDateString()}
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
            </>
          )}

          {/* Subtasks */}
          {tasks.filter(sub => sub.parentId === task.id).length > 0 && (
            <div className="subtasks">
              {tasks
                .filter(sub => sub.parentId === task.id)
                .map(sub => (
                  <div key={sub.id} className="subtask-item">
                    <input 
                      type="checkbox"
                      checked={sub.status === 'completed'}
                      onChange={() => toggleTask(sub.id)}
                      className="subtask-checkbox"
                    />
                    <span
                      className={`subtask-title ${sub.status === 'completed' ? 'completed' : ''}`}
                    >
                      {sub.title}
                      {sub.dueDate && (
                        <span className="task-date ml-xs">
                          {new Date(sub.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => deleteTask(sub.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}
      
      {topTasks.length === 0 && (
        <p className="empty-message">No tasks found</p>
      )}
    </div>
  );
}