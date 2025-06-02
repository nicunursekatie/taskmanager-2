import React from 'react';
import { Task, Project, Category, PriorityLevel } from '../types'; // Assuming types are in src/types.ts

interface ProjectsViewProps {
  tasks: Task[];
  projects: Project[];
  // categories: Category[]; // Decided this is not directly needed per subtask description
  startEditingProjectOrCategory: (item: Project | Category) => void; // Renamed for clarity
  deleteProject: (projectId: string) => void;
  toggleTaskWithUndo: (taskId: string) => void;
  setEditingTaskId: (id: string | null) => void;
  setEditTaskTitle: (title: string) => void;
  setEditTaskDueDate: (date: string) => void;
  setEditTaskDueTime: (time: string) => void;
  setEditTaskCategories: (categories: string[]) => void;
  setEditTaskProjectId: (id: string | null) => void;
  setEditTaskPriority: (priority: PriorityLevel | null) => void;
  setShowTaskEditModal: (show: boolean) => void;
  // Props from App.tsx that might be needed by task items under projects
  updateTask: (id: string, title: string, dueDate: string | null, categories?: string[], projectId?: string | null, dependsOn?: string[], priority?: PriorityLevel) => void;
  updateTaskDescription: (id: string, description: string) => void;
  addSubtask: (parentId: string, title: string) => string;
  moveTaskToParent: (id: string, parentId: string | null) => void;
  updateTaskEstimate: (id: string, estimatedMinutes: number | null) => void;
  startTaskTimer: (id: string) => void;
  completeTaskTimer: (id: string) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({
  tasks,
  projects,
  startEditingProjectOrCategory,
  deleteProject,
  toggleTaskWithUndo,
  setEditingTaskId,
  setEditTaskTitle,
  setEditTaskDueDate,
  setEditTaskDueTime,
  setEditTaskCategories,
  setEditTaskProjectId,
  setEditTaskPriority,
  setShowTaskEditModal,
  // updateTask, // These will be needed if we use TaskList, or for direct task interactions
  // updateTaskDescription,
  // addSubtask,
  // moveTaskToParent,
  // updateTaskEstimate,
  // startTaskTimer,
  // completeTaskTimer,
}) => {
  if (projects.length === 0) {
    return <div className="empty-message">No projects yet. Create one to get started.</div>;
  }

  return (
    <div className="projects-view">
      <div className="grid grid-3 gap-lg"> {/* Assuming grid-3 and gap-lg are defined CSS classes */}
        {projects.map((project) => {
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const completedCount = projectTasks.filter(t => t.status === 'completed').length;
          const activeCount = projectTasks.filter(t => t.status !== 'completed').length;
          const progressPercentage = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;

          // Find the task to edit to get its dueTime, similar to logic in DashboardView
          const getTaskDueTime = (taskId: string): string => {
            const task = tasks.find(t => t.id === taskId);
            return task?.dueTime || '';
          };

          return (
            <div id={`project-${project.id}`} key={project.id} className="project-card flex flex-col gap-md p-lg mb-md shadow-md border border-border rounded-xl bg-white">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-primary mb-xs">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-light mb-xs">{project.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-sm btn-outline" onClick={() => startEditingProjectOrCategory(project)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteProject(project.id)}>Delete</button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-success">{activeCount} active</span>
                {completedCount > 0 && <span className="text-xs text-light">{completedCount} done</span>}
                {project.dueDate && (
                  <span className="text-xs text-warning">Due: {new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
                )}
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-background rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <div className="flex items-center justify-between text-xs text-light">
                <span>{progressPercentage}% complete</span>
                <span>{projectTasks.length} tasks</span>
              </div>
              {/* List a few tasks */}
              {projectTasks.length > 0 && (
                <div className="mt-md">
                  <div className="text-xs text-light mb-xs">Sample tasks:</div>
                  <ul className="flex flex-col gap-xs">
                    {projectTasks.slice(0, 3).map(task => (
                      <li key={task.id} className="flex items-center gap-2 group">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={() => toggleTaskWithUndo(task.id)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                        <span
                          className={`${task.status === 'completed' ? 'line-through text-light' : ''} flex-1 cursor-pointer group-hover:text-primary`}
                          onClick={() => {
                            setEditingTaskId(task.id);
                            setEditTaskTitle(task.title);
                            setEditTaskDueDate(task.dueDate || '');
                            setEditTaskDueTime(getTaskDueTime(task.id));
                            setEditTaskCategories(task.categories || []);
                            setEditTaskProjectId(task.projectId ?? null);
                            setEditTaskPriority(task.priority ?? null);
                            setShowTaskEditModal(true);
                          }}
                        >
                          {task.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsView;
