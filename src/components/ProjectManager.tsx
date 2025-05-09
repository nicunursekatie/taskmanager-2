// src/components/ProjectManager.tsx
import React, { useState } from 'react';
import { Project } from '../types';

type ProjectManagerProps = {
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, project: Omit<Project, 'id'>) => void;
  deleteProject: (id: string) => void;
  onClose: () => void;
};

export default function ProjectManager({
  projects,
  addProject,
  updateProject,
  deleteProject,
  onClose,
}: ProjectManagerProps) {
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    addProject({
      name: newName.trim(),
      description: newDescription.trim(),
    });
    
    setNewName('');
    setNewDescription('');
  };

  const startEditing = (project: Project) => {
    setEditId(project.id);
    setEditName(project.name);
    setEditDescription(project.description || '');
  };

  const handleUpdateProject = () => {
    if (!editId || !editName.trim()) return;
    
    updateProject(editId, {
      name: editName.trim(),
      description: editDescription.trim(),
    });
    
    setEditId(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Manage Projects</h2>
          <button className="btn btn-sm btn-outline" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleAddProject} className="input-group">
            <label className="form-label">Add New Project</label>
            <input
              type="text"
              className="form-control"
              placeholder="Project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <textarea
              className="form-control mt-sm"
              placeholder="Project description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
            />
            <button type="submit" className="btn btn-primary mt-sm">Add Project</button>
          </form>
          
          <h3 className="section-title mt-lg">Your Projects</h3>
          
          <div className="item-list">
            {projects.map((project) => (
              <div key={project.id} className="item-card">
                {editId === project.id ? (
                  <div className="task-edit-form">
                    <input
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Project name"
                    />
                    <textarea
                      className="form-control mt-sm"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Project description (optional)"
                      rows={3}
                    />
                    <div className="flex gap-sm mt-sm">
                      <button 
                        className="btn btn-primary"
                        onClick={handleUpdateProject}
                      >
                        Save
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => setEditId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="item-header">
                      <h3 className="item-title">{project.name}</h3>
                      <div className="flex gap-sm">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => startEditing(project)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteProject(project.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {project.description && (
                      <p className="item-description mt-sm">{project.description}</p>
                    )}
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