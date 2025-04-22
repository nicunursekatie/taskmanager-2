// src/components/ProjectView.tsx
import React from 'react';
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
};

export default function ProjectView({
  projects,
  tasks,
  categories,
  toggleTask,
  deleteTask,
  updateTask,
}: ProjectViewProps) {
  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <p>No projects created yet. Create a project to organize related tasks together.</p>
      </div>
    );
  }

  return (
    <div className="project-view">
      {projects.map(project => {
        // Filter tasks for this project
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        
        // Further filter by status
        const pendingTasks = projectTasks.filter(task => task.status === 'pending');
        const completedTasks = projectTasks.filter(task => task.status === 'completed');
        
        return (
          <div key={project.id} className="item-card mb-lg">
            <div className="item-header">
              <h2 className="section-title mt-0">{project.name}</h2>
            </div>
            
            {project.description && (
              <p className="item-description mb-md">{project.description}</p>
            )}
            
            {projectTasks.length > 0 ? (
              <>
                {pendingTasks.length > 0 && (
                  <div className="mb-md">
                    <h3 className="font-lg mb-sm">Pending</h3>
                    <TaskList 
                      tasks={pendingTasks} 
                      toggleTask={toggleTask} 
                      deleteTask={deleteTask} 
                      updateTask={updateTask} 
                      categories={categories}
                      projects={projects}
                    />
                  </div>
                )}
                
                {completedTasks.length > 0 && (
                  <div>
                    <h3 className="font-lg mb-sm">Completed</h3>
                    <TaskList 
                      tasks={completedTasks} 
                      toggleTask={toggleTask} 
                      deleteTask={deleteTask} 
                      updateTask={updateTask} 
                      categories={categories}
                      projects={projects}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-light py-md">
                No tasks in this project yet.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}