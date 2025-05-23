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
  onEdit: (project: Project) => void;
  onClose: () => void;
};

export default function ProjectManager({
  projects,
  categories,
  addProject,
  updateProject,
  deleteProject,
  editingProject,
  onEdit,
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
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h2 className="project-title">{project.name}</h2>
                  <div className="project-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => onEdit(project)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteProject(project.id)}>Delete</button>
                  </div>
                </div>
                {project.description && (
                  <p className="project-description">{project.description}</p>
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