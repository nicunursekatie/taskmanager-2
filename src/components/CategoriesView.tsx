import React, { useState, useMemo } from 'react';
import { Task, Project, Category, PriorityLevel, TabType } from '../types';
import TaskList from './TaskList'; // Assuming TaskList is in the same directory

interface CategoriesViewProps {
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  setShowCategoryManager: (show: boolean) => void;
  startEditingCategoryOrProject: (item: Category | Project) => void;
  addTask: (task: Omit<Task, 'id' | 'status' | 'order' | 'completedAt' | 'subtasks' | 'dependencies' | 'dueTime'> & { status?: 'pending' | 'completed' }) => void;
  toggleTaskWithUndo: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (id: string, title: string, dueDate: string | null, categories?: string[], projectId?: string | null, dependsOn?: string[], priority?: PriorityLevel) => void;
  updateTaskDescription: (id: string, description: string) => void;
  addSubtask: (parentId: string, title: string) => string;
  moveTaskToParent: (id: string, parentId: string | null) => void;
  setEditingTaskId: (id: string | null) => void;
  setEditTaskTitle: (title: string) => void;
  setEditTaskDueDate: (date: string) => void;
  setEditTaskDueTime: (time: string) => void;
  setEditTaskCategories: (categories: string[]) => void;
  setEditTaskProjectId: (id: string | null) => void;
  setEditTaskPriority: (priority: PriorityLevel | null) => void;
  setShowTaskEditModal: (show: boolean) => void;
  setActiveTab: (tab: TabType) => void;
  updateTaskEstimate: (id: string, estimatedMinutes: number | null) => void;
  startTaskTimer: (id: string) => void;
  completeTaskTimer: (id: string) => void;
}

const CategoriesView: React.FC<CategoriesViewProps> = ({
  tasks,
  projects,
  categories,
  setShowCategoryManager,
  startEditingCategoryOrProject,
  addTask,
  toggleTaskWithUndo,
  deleteTask,
  updateTask,
  updateTaskDescription,
  addSubtask,
  moveTaskToParent,
  setEditingTaskId,
  setEditTaskTitle,
  setEditTaskDueDate,
  setEditTaskDueTime,
  setEditTaskCategories,
  setEditTaskProjectId,
  setEditTaskPriority,
  setShowTaskEditModal,
  setActiveTab,
  updateTaskEstimate,
  startTaskTimer,
  completeTaskTimer,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Helper to find task dueTime, similar to other views
  const getTaskDueTime = (taskId: string): string => {
    const task = tasks.find(t => t.id === taskId);
    return task?.dueTime || '';
  };

  if (selectedCategoryId === null) {
    // Grid View of All Categories
    return (
      <div className="categories-view" key="all-categories">
        <div className="view-header">
          <h2 className="view-title">Categories</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowCategoryManager(true)}
          >
            <span className="icon">+</span> New Category
          </button>
        </div>

        {categories.length > 0 ? (
          <div className="category-cards-grid">
            {categories.map(category => {
              const activeTasksCount = tasks.filter(t => t.categories?.includes(category.id) && t.status !== 'completed').length;
              const completedTasksCount = tasks.filter(t => t.categories?.includes(category.id) && t.status === 'completed').length;
              const totalTasksInCategory = activeTasksCount + completedTasksCount;
              const completionPercentage = totalTasksInCategory > 0
                ? Math.round((completedTasksCount / totalTasksInCategory) * 100)
                : 0;
              const projectsInCategoryCount = projects.filter(project =>
                project.categoryIds && project.categoryIds.includes(category.id)
              ).length;
              const recentActiveTasks = tasks
                .filter(t => t.categories?.includes(category.id) && t.status !== 'completed')
                .sort((a, b) => Number(b.id) - Number(a.id)) // Assuming higher ID is newer
                .slice(0, 1);

              return (
                <div
                  key={category.id}
                  className="compact-category-card"
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  <div className="category-color-bar" style={{ backgroundColor: category.color }}></div>
                  <div className="compact-category-content">
                    <h3 className="compact-category-title">{category.name}</h3>
                    <div className="compact-category-stats">
                      <span className="task-count">{totalTasksInCategory}</span>
                      <div className="task-status-breakdown">
                        {activeTasksCount > 0 && <span className="active-count">{activeTasksCount} active</span>}
                        {completedTasksCount > 0 && <span className="completed-count">{completedTasksCount} done</span>}
                        {projectsInCategoryCount > 0 && <span className="projects-count">{projectsInCategoryCount} projects</span>}
                      </div>
                    </div>
                    {totalTasksInCategory > 0 && (
                      <div className="category-progress">
                        <div className="category-progress-bar">
                          <div
                            className="category-progress-fill"
                            style={{ width: `${completionPercentage}%`, backgroundColor: category.color }}
                          ></div>
                        </div>
                        <span className="category-progress-text">{completionPercentage}% complete</span>
                      </div>
                    )}
                    {recentActiveTasks.length > 0 && (
                      <div className="category-recent-task">
                        <div className="recent-task-label">Recent task:</div>
                        <div className="recent-task-title">{recentActiveTasks[0].title}</div>
                      </div>
                    )}
                    <div className="category-actions">
                      <button
                        className="btn btn-sm btn-outline edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingCategoryOrProject(category);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-categories">
            <p>No categories yet. Create your first category to organize your tasks.</p>
            <button className="btn btn-primary" onClick={() => setShowCategoryManager(true)}>
              Create Category
            </button>
          </div>
        )}
      </div>
    );
  }

  // Single Category Detail View
  const category = categories.find(c => c.id === selectedCategoryId);
  if (!category) {
    // Should not happen if selectedCategoryId is valid, but good practice
    setSelectedCategoryId(null);
    return <p>Category not found.</p>;
  }

  const tasksInCategory = tasks.filter(t => t.categories?.includes(selectedCategoryId));
  const activeTasksInCategory = tasksInCategory.filter(t => t.status !== 'completed');
  const completedTasksInCategory = tasksInCategory.filter(t => t.status === 'completed');
  const projectsInCategory = projects.filter(p => p.categoryIds?.includes(selectedCategoryId));

  return (
    <div className="categories-view" key={selectedCategoryId}>
      <div className="single-category-view">
        <div className="view-header with-back-button">
          <button className="btn btn-sm btn-outline back-button" onClick={() => setSelectedCategoryId(null)}>
            <span className="back-icon">←</span> All Categories
          </button>
          <h2 className="view-title">
            <span className="color-dot large" style={{ backgroundColor: category.color }} />
            {category.name}
          </h2>
          <div className="header-actions">
            <button className="btn btn-sm btn-outline" onClick={() => startEditingCategoryOrProject(category)}>
              Edit
            </button>
          </div>
        </div>

        <div className="category-detail-section" style={{ backgroundColor: `${category.color}10` }}>
          <div className="category-summary">
            <div className="category-statistics">
              <div className="stat-item">
                <span className="stat-value">{tasksInCategory.length}</span>
                <span className="stat-label">Total Tasks</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{completedTasksInCategory.length}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{projectsInCategory.length}</span>
                <span className="stat-label">Projects</span>
              </div>
            </div>
            <div className="category-quick-add">
              <form onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                if (input && input.value.trim()) {
                  addTask({ title: input.value.trim(), dueDate: null, categories: selectedCategoryId ? [selectedCategoryId] : [] });
                  input.value = '';
                }
              }}>
                <div className="quick-add-form">
                  <input type="text" className="form-control" placeholder={`Add task to ${category.name}...`} />
                  <button type="submit" className="btn btn-primary">Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="category-detail-section">
          <div className="section-header">
            <h3 className="section-title">Active Tasks</h3>
            <span className="task-counter">{activeTasksInCategory.length}</span>
          </div>
          {activeTasksInCategory.length > 0 ? (
            <TaskList
              tasks={activeTasksInCategory}
              toggleTask={toggleTaskWithUndo}
              deleteTask={deleteTask}
              updateTask={updateTask}
              updateTaskDescription={updateTaskDescription}
              addSubtask={addSubtask}
              moveTaskToParent={moveTaskToParent}
              categories={categories} // Pass all categories for general use in TaskList
              projects={projects}     // Pass all projects for general use in TaskList
              updateTaskEstimate={updateTaskEstimate}
              startTaskTimer={startTaskTimer}
              completeTaskTimer={completeTaskTimer}
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
            <p className="empty-message">No active tasks in this category</p>
          )}
        </div>

        {projectsInCategory.length > 0 && (
          <div className="category-detail-section">
            <div className="section-header">
              <h3 className="section-title">Projects</h3>
              <span className="task-counter">{projectsInCategory.length}</span>
            </div>
            <div className="category-projects-grid">
              {projectsInCategory.map(project => {
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const completedCount = projectTasks.filter(t => t.status === 'completed').length;
                const activeCount = projectTasks.filter(t => t.status !== 'completed').length;
                const progressPercentage = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;
                return (
                  <div
                    key={project.id}
                    className="category-project-card"
                    style={{ borderLeft: `4px solid ${project.color || category.color}` }}
                    onClick={() => {
                      setActiveTab('projects');
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
                    <h4 className="project-title">{project.name}</h4>
                    <div className="project-progress-container">
                      <div className="project-progress-bar">
                        <div className="project-progress-fill" style={{ width: `${progressPercentage}%`, backgroundColor: project.color || category.color }}></div>
                      </div>
                      <div className="project-progress-text">{progressPercentage}% complete</div>
                    </div>
                    <div className="project-stats">
                      <span className="task-count">{activeCount} active</span>
                      {completedCount > 0 && <span className="completed-count">{completedCount} completed</span>}
                      {project.dueDate && <span className="due-date">Due: {new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {completedTasksInCategory.length > 0 && (
          <div className="category-detail-section">
            <div className="section-header">
              <h3 className="section-title">Completed</h3>
              <span className="task-counter completed">{completedTasksInCategory.length}</span>
            </div>
            <TaskList
              tasks={completedTasksInCategory}
              toggleTask={toggleTaskWithUndo}
              deleteTask={deleteTask}
              updateTask={updateTask}
              updateTaskDescription={updateTaskDescription}
              addSubtask={addSubtask}
              moveTaskToParent={moveTaskToParent}
              categories={categories}
              projects={projects}
              updateTaskEstimate={updateTaskEstimate}
              startTaskTimer={startTaskTimer}
              completeTaskTimer={completeTaskTimer}
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
        )}
      </div>
    </div>
  );
};

export default CategoriesView;
