import { useState } from 'react';
import { Task, Project, Category } from '../types';
import TaskList from './TaskList';

type ProjectViewProps = {
  projects: Project[];
  tasks: Task[];
  categories: Category[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (
    id: string, 
    title: string, 
    dueDate: string | null,
    categories?: string[],
    projectId?: string | null
  ) => void;
  addSubtask: (parentId: string, title: string) => void;
};

export default function ProjectView({
  projects,
  tasks,
  categories,
  toggleTask,
  deleteTask,
  updateTask,
  addSubtask,
}: ProjectViewProps) {
  const [newSubtaskParent, setNewSubtaskParent] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Handle adding a subtask - properly using the title parameter
  const handleAddSubtask = (parentId: string) => {
    if (newSubtaskTitle.trim()) {
      addSubtask(parentId, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setNewSubtaskParent(null);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <p>No projects created yet. Create a project to organize related tasks together.</p>
      </div>
    );
  }

  return (
    <div className="project-view-container">
      {projects.map(project => {
        // Filter tasks for this project
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        
        // Further filter by status
        const pendingTasks = projectTasks.filter(task => task.status === 'pending');
        const completedTasks = projectTasks.filter(task => task.status === 'completed');
        
        return (
          <div key={project.id} className="project-view-card">
            <div className="project-view-header">
              <h2 className="project-view-title">{project.name}</h2>
            </div>
            
            {project.description && (
              <p className="project-view-description">{project.description}</p>
            )}
            
            {projectTasks.length > 0 ? (
              <>
                {pendingTasks.length > 0 && (
                  <div className="project-view-section">
                    <h3 className="project-view-section-title">Pending</h3>
                    <TaskList 
                      tasks={pendingTasks} 
                      toggleTask={toggleTask} 
                      deleteTask={deleteTask} 
                      updateTask={updateTask}
                      addSubtask={addSubtask}
                      categories={categories}
                      projects={projects}
                    />
                    
                    {/* Add subtask interface */}
                    {pendingTasks.map(task => (
                      <div key={`add-subtask-${task.id}`} className="project-view-subtask-form">
                        {newSubtaskParent === task.id ? (
                          <div className="project-view-subtask-input">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="New subtask..."
                              value={newSubtaskTitle}
                              onChange={(e) => setNewSubtaskTitle(e.target.value)}
                            />
                            <div className="project-view-subtask-buttons">
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => handleAddSubtask(task.id)}
                              >
                                Add
                              </button>
                              <button 
                                className="btn btn-sm btn-outline"
                                onClick={() => {
                                  setNewSubtaskParent(null);
                                  setNewSubtaskTitle('');
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            className="btn btn-sm btn-outline project-view-add-subtask-btn"
                            onClick={() => setNewSubtaskParent(task.id)}
                          >
                            + Add Subtask
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {completedTasks.length > 0 && (
                  <div className="project-view-section">
                    <h3 className="project-view-section-title">Completed</h3>
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
              </>
            ) : (
              <div className="project-view-empty-message">
                No tasks in this project yet.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}