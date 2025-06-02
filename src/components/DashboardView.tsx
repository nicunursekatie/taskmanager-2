import React, { useMemo } from 'react';
import { Task, Project, Category, PriorityLevel, TabType } from '../types'; // Assuming types are in src/types.ts
import TaskList from './TaskList';
// import ProjectCard from './ProjectCard'; // Assuming ProjectCard.js is the one to use. Let's ensure App.tsx wasn't using a different one.
// Looking at App.tsx, it renders project cards directly. My ProjectCard.js might be different or not used there.
// For now, I will replicate the project display logic from App.tsx directly into DashboardView.
// If ProjectCard.js is indeed the correct component, this can be refactored later.

interface DashboardViewProps {
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  toggleTaskWithUndo: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (id: string, title: string, dueDate: string | null, categories?: string[], projectId?: string | null, dependsOn?: string[], priority?: PriorityLevel) => void;
  updateTaskDescription: (id: string, description: string) => void;
  addSubtask: (parentId: string, title: string) => string;
  updateTaskEstimate: (id: string, estimatedMinutes: number | null) => void;
  startTaskTimer: (id: string) => void;
  completeTaskTimer: (id: string) => void;
  moveTaskToParent: (id: string, parentId: string | null) => void;
  setActiveTab: (tab: TabType) => void;
  setEditingTaskId: (id: string | null) => void;
  setEditTaskTitle: (title: string) => void;
  setEditTaskDueDate: (date: string) => void;
  setEditTaskDueTime: (time: string) => void;
  setEditTaskCategories: (categories: string[]) => void;
  setEditTaskProjectId: (id: string | null) => void;
  setEditTaskPriority: (priority: PriorityLevel | null) => void;
  setShowTaskEditModal: (show: boolean) => void;
  // Props needed for project card navigation/interaction if ProjectCard component is used:
  // setViewingProjectId?: (id: string | null) => void; // Example if needed for project navigation
}

// Import date utility functions
import { isDateBefore, isDateBetween } from '../../utils/dateUtils';


const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  projects,
  categories,
  toggleTaskWithUndo,
  deleteTask,
  updateTask,
  updateTaskDescription,
  addSubtask,
  updateTaskEstimate,
  startTaskTimer,
  completeTaskTimer,
  moveTaskToParent,
  setActiveTab,
  setEditingTaskId,
  setEditTaskTitle,
  setEditTaskDueDate,
  setEditTaskDueTime,
  setEditTaskCategories,
  setEditTaskProjectId,
  setEditTaskPriority,
  setShowTaskEditModal,
}) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const todayTasks = useMemo(() => tasks.filter(
    task => task.dueDate && isDateBetween(task.dueDate, todayStart, tomorrowStart) && task.status !== 'completed' && !task.parentId
  ), [tasks, todayStart, tomorrowStart]);

  const upcomingTasks = useMemo(() => {
    // Defines the period for "upcoming" as the next 7 days, starting from tomorrow.
    // isDateBetween checks [startDate, endDate), so endDate should be the day AFTER the 7-day period.
    // If todayStart is Day 0, tomorrowStart is Day 1. We want tasks from Day 1 to Day 7 inclusive.
    // So, endOfUpcomingPeriod should be Day 8.
    const endOfUpcomingPeriod = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() + 8);

    return tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed' || task.parentId) {
        return false;
      }
      // Check if the task falls strictly between tomorrow (exclusive of today) and the end of the 7-day window.
      return isDateBetween(task.dueDate, tomorrowStart, endOfUpcomingPeriod);
    });
  }, [tasks, todayStart, tomorrowStart]);

  return (
    <div className="space-y-8">
      {/* Today's Tasks Section */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-title">Today's Tasks</h2>
        </div>
        <div className="section-card-body">
          {todayTasks.length > 0 ? (
            <TaskList
              tasks={todayTasks}
              toggleTask={toggleTaskWithUndo}
              deleteTask={deleteTask}
              updateTask={updateTask}
              updateTaskDescription={updateTaskDescription}
              addSubtask={addSubtask}
              updateTaskEstimate={updateTaskEstimate}
              startTaskTimer={startTaskTimer}
              completeTaskTimer={completeTaskTimer}
              moveTaskToParent={moveTaskToParent}
              categories={categories}
              projects={projects}
              setEditingTaskId={setEditingTaskId}
              setEditTaskTitle={setEditTaskTitle}
              setEditTaskDueDate={setEditTaskDueDate}
              setEditTaskDueTime={setEditTaskDueTime}
              setEditTaskCategories={setEditTaskCategories}
              setEditTaskProjectId={setEditTaskProjectId}
              setEditTaskPriority={setEditTaskPriority}
              setShowTaskEditModal={setShowTaskEditModal}
              showProjectName={true}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <div className="empty-state-title">No tasks due today</div>
              <div className="empty-state-description">Great! You have a clear schedule for today.</div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Tasks Section - Using TaskList for consistency */}
      {upcomingTasks.length > 0 && (
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-title">Upcoming Tasks</h2>
          </div>
          <div className="section-card-body">
            <TaskList
              tasks={upcomingTasks}
              toggleTask={toggleTaskWithUndo}
              deleteTask={deleteTask}
              updateTask={updateTask}
              updateTaskDescription={updateTaskDescription}
              addSubtask={addSubtask}
              updateTaskEstimate={updateTaskEstimate}
              startTaskTimer={startTaskTimer}
              completeTaskTimer={completeTaskTimer}
              moveTaskToParent={moveTaskToParent}
              categories={categories}
              projects={projects}
              setEditingTaskId={setEditingTaskId}
              setEditTaskTitle={setEditTaskTitle}
              setEditTaskDueDate={setEditTaskDueDate}
              setEditTaskDueTime={setEditTaskDueTime}
              setEditTaskCategories={setEditTaskCategories}
              setEditTaskProjectId={setEditTaskProjectId}
              setEditTaskPriority={setEditTaskPriority}
              setShowTaskEditModal={setShowTaskEditModal}
              showProjectName={true}
            />
          </div>
        </div>
      )}

      {/* Projects Section - Replicating App.tsx structure */}
      <div className="section-card">
        <div className="section-card-header">
          <h2 className="section-title">Projects</h2>
        </div>
        <div className="section-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => {
              const projectTasks = tasks.filter(t =>
                t.projectId === project.id &&
                t.status !== 'completed' &&
                !t.parentId
              );

              if (projectTasks.length === 0 && projects.length > 1) return null; // Keep project if it's the only one, even if empty

              const totalProjectTaskCount = tasks.filter(t => t.projectId === project.id).length;
              const completedTaskCount = tasks.filter(t => t.projectId === project.id && t.status === 'completed').length;
              const progressPercentage = totalProjectTaskCount > 0
                ? Math.round((completedTaskCount / totalProjectTaskCount) * 100)
                : 0;

              const tasksWithDueDates = projectTasks.filter(t => t.dueDate);
              const nearestDueDate = tasksWithDueDates.length > 0
                ? tasksWithDueDates.reduce((nearest, task) =>
                    !nearest.dueDate || (task.dueDate && task.dueDate < nearest.dueDate)
                      ? task
                      : nearest,
                  tasksWithDueDates[0])
                : null;

              let urgencyClass = '';
              if (nearestDueDate && nearestDueDate.dueDate) {
                const dueDate = new Date(nearestDueDate.dueDate); // No Z, assume local as in App.tsx original
                const currentDate = new Date();
                const dueDateStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                const currentDateStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                const diffTime = dueDateStart.getTime() - currentDateStart.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) urgencyClass = 'border-danger';
                else if (diffDays <= 2) urgencyClass = 'border-warning';
                else if (diffDays <= 7) urgencyClass = 'border-primary';
              }

              return (
                <div
                  key={project.id}
                  className={`bg-white border border-border rounded-md shadow-sm p-3 mb-4 flex flex-col gap-2 ${urgencyClass} cursor-pointer hover:shadow-lg transition-shadow`}
                  onClick={() => {
                    setActiveTab('projects');
                    // Scrolling logic will be handled by Projects view itself after navigation
                    // Or pass setViewingProjectId if that's the mechanism for the Projects tab
                    setTimeout(() => {
                      const projectElement = document.getElementById(`project-${project.id}`);
                      if (projectElement) {
                        projectElement.scrollIntoView({ behavior: 'smooth' });
                        projectElement.classList.add('highlight');
                        setTimeout(() => projectElement.classList.remove('highlight'), 2000);
                      }
                    }, 100);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-text">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-text-light mt-1">
                          {project.description.length > 60
                            ? project.description.substring(0, 60) + '...'
                            : project.description}
                        </p>
                      )}
                    </div>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-semibold">
                      {projectTasks.length}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-text-light mt-1">{progressPercentage}% complete</p>
                  </div>

                  {nearestDueDate && nearestDueDate.dueDate && (
                    <div className="text-sm text-text-light">
                      <span className="font-medium">Next due:</span>{' '}
                      {new Date(nearestDueDate.dueDate).toLocaleDateString('en-US',
                        { weekday: 'short', month: 'short', day: 'numeric'})}
                      <p className="mt-1 text-text truncate">{nearestDueDate.title}</p>
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    {projectTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-primary/5 transition">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={(e) => {
                            e.stopPropagation(); // Prevent card click when toggling task
                            toggleTaskWithUndo(task.id);
                          }}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click when opening edit modal
                            setEditingTaskId(task.id);
                            setEditTaskTitle(task.title);
                            setEditTaskDueDate(task.dueDate || '');
                            // Ensure dueTime is correctly handled, App.tsx has task.dueTime
                            const taskToEdit = tasks.find(t => t.id === task.id);
                            setEditTaskDueTime(taskToEdit?.dueTime || '');
                            setEditTaskCategories(task.categories || []);
                            setEditTaskProjectId(task.projectId ?? null);
                            setEditTaskPriority(task.priority ?? null);
                            setShowTaskEditModal(true);
                          }}
                        >
                          <p className="text-sm text-text truncate">{task.title}</p>
                          {task.dueDate && (
                            <span className={`text-xs ${isDateBefore(task.dueDate, todayStart) ? 'text-danger' : 'text-text-light'}`}>
                              {new Date(task.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
