// src/components/ProjectManager.tsx
import React, { useState, useEffect } from 'react';
import { Project, Category, PriorityLevel } from '../types';

type ProjectManagerProps = {
  projects: Project[];
  categories: Category[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Omit<Project, 'id'>) => void;
  deleteProject: (id: string) => void;
  editingProject: Project | null;
  onClose: () => void;
};

export default function ProjectManager({
  projects,
  categories,
  addProject,
  updateProject,
  deleteProject,
  editingProject,
  onClose,
}: ProjectManagerProps) {
  // State for new project form
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newColor, setNewColor] = useState('#4361ee'); // Default to primary color
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel | null>(null);
  const [newCategoryIds, setNewCategoryIds] = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState<Project['status']>('not-started');

  // State for editing projects
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState<PriorityLevel | null>(null);
  const [editCategoryIds, setEditCategoryIds] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<Project['status']>('not-started');

  // Initialize edit state from editingProject
  useEffect(() => {
    if (editingProject) {
      setEditName(editingProject.name);
      setEditDescription(editingProject.description || '');
      setEditColor(editingProject.color || '#4361ee');
      setEditDueDate(editingProject.dueDate ? editingProject.dueDate.split('T')[0] : '');
      setEditPriority(editingProject.priority || null);
      setEditCategoryIds(editingProject.categoryIds || []);
      setEditStatus(editingProject.status || 'not-started');
    } else {
      setEditName('');
      setEditDescription('');
      setEditColor('#4361ee');
      setEditDueDate('');
      setEditPriority(null);
      setEditCategoryIds([]);
      setEditStatus('not-started');
    }
  }, [editingProject]);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    // Format due date properly if provided
    let formattedDueDate = null;
    if (newDueDate) {
      formattedDueDate = `${newDueDate}T00:00:00Z`;
    }

    addProject({
      name: newName.trim(),
      description: newDescription.trim(),
      color: newColor,
      dueDate: formattedDueDate,
      priority: newPriority,
      categoryIds: newCategoryIds.length > 0 ? newCategoryIds : undefined,
      status: newStatus
    });

    // Reset form
    setNewName('');
    setNewDescription('');
    setNewColor('#4361ee');
    setNewDueDate('');
    setNewPriority(null);
    setNewCategoryIds([]);
    setNewStatus('not-started');
  };

  const handleUpdateProject = () => {
    if (!editName.trim()) return;

    // Format due date properly if provided
    let formattedDueDate = null;
    if (editDueDate) {
      formattedDueDate = `${editDueDate}T00:00:00Z`;
    }

    updateProject(editingProject!.id, {
      name: editName.trim(),
      description: editDescription.trim(),
      color: editColor,
      dueDate: formattedDueDate,
      priority: editPriority,
      categoryIds: editCategoryIds.length > 0 ? editCategoryIds : undefined,
      status: editStatus
    });

    // Reset form
    setEditName('');
    setEditDescription('');
    setEditColor('#4361ee');
    setEditDueDate('');
    setEditPriority(null);
    setEditCategoryIds([]);
    setEditStatus('not-started');
  };

  // Helper function to toggle category selection
  const toggleCategory = (categoryId: string, isNewForm: boolean) => {
    if (isNewForm) {
      if (newCategoryIds.includes(categoryId)) {
        setNewCategoryIds(newCategoryIds.filter(id => id !== categoryId));
      } else {
        setNewCategoryIds([...newCategoryIds, categoryId]);
      }
    } else {
      if (editCategoryIds.includes(categoryId)) {
        setEditCategoryIds(editCategoryIds.filter(id => id !== categoryId));
      } else {
        setEditCategoryIds([...editCategoryIds, categoryId]);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Manage Projects</h2>
          <button className="btn btn-sm btn-outline" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Only show Add New Project form when not editing */}
          {editingProject === null && (
            <form onSubmit={handleAddProject} className="project-form">
              <h3 className="form-section-title">Add New Project</h3>

              <div className="form-row">
                <div className="input-group flex-grow">
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter project name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group color-picker">
                  <label className="form-label">Color</label>
                  <input
                    type="color"
                    className="form-control"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Project description (optional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                  <div className="date-shortcuts">
                    <button
                      type="button"
                      className="date-shortcut-btn"
                      onClick={() => {
                        const today = new Date();
                        const dateString = today.toISOString().split('T')[0];
                        setNewDueDate(dateString);
                      }}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      className="date-shortcut-btn"
                      onClick={() => {
                        const nextWeek = new Date();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        const dateString = nextWeek.toISOString().split('T')[0];
                        setNewDueDate(dateString);
                      }}
                    >
                      +1 Week
                    </button>
                    <button
                      type="button"
                      className="date-shortcut-btn"
                      onClick={() => {
                        const nextMonth = new Date();
                        nextMonth.setMonth(nextMonth.getMonth() + 1);
                        const dateString = nextMonth.toISOString().split('T')[0];
                        setNewDueDate(dateString);
                      }}
                    >
                      +1 Month
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-control"
                    value={newPriority || ''}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel || null)}
                  >
                    <option value="">No Priority</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Project['status'])}
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {categories.length > 0 && (
                <div className="input-group">
                  <label className="form-label">Categories</label>
                  <div className="category-selector">
                    {categories.map(category => (
                      <div
                        key={category.id}
                        className={`category-option ${newCategoryIds.includes(category.id) ? 'selected' : ''}`}
                        style={{
                          backgroundColor: newCategoryIds.includes(category.id) ? category.color : 'transparent',
                          border: `1px solid ${category.color}`
                        }}
                        onClick={() => toggleCategory(category.id, true)}
                      >
                        {category.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="px-5 py-2 rounded-lg font-semibold text-base transition shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-dark active:bg-primary-dark">Create Project</button>
              </div>
            </form>
          )}
          
          <h3 className="section-title mt-lg">Your Projects</h3>
          
          <div className="item-list">
            {projects.map((project) => (
              <div key={project.id} className="item-card">
                {editingProject === project ? (
                  <div className="project-edit-form">
                    <div className="form-row">
                      <div className="input-group flex-grow">
                        <label className="form-label">Project Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Project name"
                          required
                        />
                      </div>

                      <div className="input-group color-picker">
                        <label className="form-label">Color</label>
                        <input
                          type="color"
                          className="form-control"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Project description (optional)"
                        rows={2}
                      />
                    </div>

                    <div className="form-row">
                      <div className="input-group">
                        <label className="form-label">Due Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                        />
                        <div className="date-shortcuts">
                          <button
                            type="button"
                            className="date-shortcut-btn"
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
                              const nextWeek = new Date();
                              nextWeek.setDate(nextWeek.getDate() + 7);
                              const dateString = nextWeek.toISOString().split('T')[0];
                              setEditDueDate(dateString);
                            }}
                          >
                            +1 Week
                          </button>
                          <button
                            type="button"
                            className="date-shortcut-btn"
                            onClick={() => setEditDueDate('')}
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="input-group">
                        <label className="form-label">Priority</label>
                        <select
                          className="form-control"
                          value={editPriority || ''}
                          onChange={(e) => setEditPriority(e.target.value as PriorityLevel || null)}
                        >
                          <option value="">No Priority</option>
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-group">
                        <label className="form-label">Status</label>
                        <select
                          className="form-control"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as Project['status'])}
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="on-hold">On Hold</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    {categories.length > 0 && (
                      <div className="input-group">
                        <label className="form-label">Categories</label>
                        <div className="category-selector">
                          {categories.map(category => (
                            <div
                              key={category.id}
                              className={`category-option ${editCategoryIds.includes(category.id) ? 'selected' : ''}`}
                              style={{
                                backgroundColor: editCategoryIds.includes(category.id) ? category.color : 'transparent',
                                border: `1px solid ${category.color}`
                              }}
                              onClick={() => toggleCategory(category.id, false)}
                            >
                              {category.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="form-actions">
                      <button
                        type="button"
                        className="px-5 py-2 rounded-lg font-semibold text-base transition shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-primary text-white hover:bg-primary-dark active:bg-primary-dark"
                        onClick={handleUpdateProject}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="item-header" style={{ borderLeft: project.color ? `4px solid ${project.color}` : undefined }}>
                      <div className="item-title-section">
                        <h3 className="item-title">{project.name}</h3>
                        {project.status && project.status !== 'not-started' && (
                          <span className={`project-status status-${project.status}`}>
                            {project.status.replace('-', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-sm">
                        <button
                          className="px-5 py-2 rounded-lg font-semibold text-base transition shadow-sm focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 bg-danger text-white hover:bg-danger/90 active:bg-danger/80"
                          onClick={() => deleteProject(project.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="item-details">
                      {project.description && (
                        <p className="item-description">{project.description}</p>
                      )}

                      <div className="item-meta">
                        {project.dueDate && (
                          <span className="item-due-date">
                            Due: {new Date(project.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              timeZone: 'UTC'
                            })}
                          </span>
                        )}

                        {project.priority && (
                          <span className={`task-priority ${project.priority}`}>
                            {project.priority === 'critical' ? 'Critical' :
                             project.priority === 'high' ? 'High' :
                             project.priority === 'medium' ? 'Medium' :
                             'Low'}
                          </span>
                        )}

                        {project.categoryIds && project.categoryIds.length > 0 && (
                          <div className="item-categories">
                            {project.categoryIds.map(categoryId => {
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
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {projects.length === 0 && (
              <div className="text-center text-light mt-lg">
                No projects yet. Add one above to get started.
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}