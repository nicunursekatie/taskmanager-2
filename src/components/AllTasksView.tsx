import React, { useMemo } from 'react';
import { Task, Project, Category, PriorityLevel } from '../types';
import TaskList from './TaskList';

interface AllTasksViewProps {
  tasks: Task[];
  categories: Category[];
  projects: Project[];
  toggleTaskWithUndo: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (id: string, title: string, dueDate: string | null, categories?: string[], projectId?: string | null, dependsOn?: string[], priority?: PriorityLevel) => void;
  updateTaskDescription: (id: string, description: string) => void;
  addSubtask: (parentId: string, title: string) => string;
  moveTaskToParent: (id: string, parentId: string | null) => void;
  handleBulkAction: (action: string, selectedIds: string[], data?: any) => void;
  updateTaskEstimate: (id: string, estimatedMinutes: number | null) => void;
  startTaskTimer: (id: string) => void;
  completeTaskTimer: (id: string) => void;
  setEditingTaskId: (id: string | null) => void;
  setEditTaskTitle: (title: string) => void;
  setEditTaskDueDate: (date: string) => void;
  setEditTaskDueTime: (time: string) => void;
  setEditTaskCategories: (categories: string[]) => void;
  setEditTaskProjectId: (id: string | null) => void;
  setEditTaskPriority: (priority: PriorityLevel | null) => void;
  setShowTaskEditModal: (show: boolean) => void;
}

const AllTasksView: React.FC<AllTasksViewProps> = ({
  tasks,
  categories,
  projects,
  toggleTaskWithUndo,
  deleteTask,
  updateTask,
  updateTaskDescription,
  addSubtask,
  moveTaskToParent,
  handleBulkAction,
  updateTaskEstimate,
  startTaskTimer,
  completeTaskTimer,
  setEditingTaskId,
  setEditTaskTitle,
  setEditTaskDueDate,
  setEditTaskDueTime,
  setEditTaskCategories,
  setEditTaskProjectId,
  setEditTaskPriority,
  setShowTaskEditModal,
}) => {
  const completedTasks = useMemo(() => {
    return tasks.filter(task => task.status === 'completed');
  }, [tasks]);

  const activeTasks = useMemo(() => {
    return tasks.filter(task => task.status !== 'completed');
  }, [tasks]);

  return (
    <div className="all-tasks-view">
      <div className="section-card">
        <h2 className="section-title">All Tasks</h2>
        {activeTasks.filter(task => !task.parentId).length > 0 ? (
          <TaskList
            tasks={activeTasks.filter(task => !task.parentId)} // Filter out sub-tasks from main list view
            toggleTask={toggleTaskWithUndo}
            deleteTask={deleteTask}
            updateTask={updateTask}
            updateTaskDescription={updateTaskDescription}
            addSubtask={addSubtask}
            moveTaskToParent={moveTaskToParent}
            categories={categories}
            projects={projects}
            enableBulkActions={true}
            onBulkAction={handleBulkAction}
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
          <p className="empty-message">No tasks yet. Create one above.</p>
        )}
      </div>

      {completedTasks.filter(task => !task.parentId).length > 0 && (
        <div className="section-card">
          <h2 className="section-title">Completed</h2>
          <TaskList
            tasks={completedTasks.filter(task => !task.parentId)} // Filter out sub-tasks from main list view
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
  );
};

export default AllTasksView;
