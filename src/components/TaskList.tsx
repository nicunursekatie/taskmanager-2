// src/components/TaskList.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Added React import
import { Task, TaskListProps, Category, Project, PriorityLevel } from '../types'; // Removed Subtask as it's not used
// import TaskBreakdown from './TaskBreakdown'; // Now imported in TaskItem
// import TimeEstimator from './TimeEstimator'; // Now imported in TaskItem
import { TaskItem } from './TaskItem'; // Import the new TaskItem component

export default function TaskList({
  tasks,
  toggleTask,
  deleteTask,
  updateTask,
  updateTaskDescription,
  addSubtask,
  updateTaskEstimate,
  startTaskTimer,
  completeTaskTimer,
  categories,
  projects,
  moveTaskToParent,
  enableBulkActions = false,
  onBulkAction,
  // Props for centralized modal editing
  setEditingTaskId,
  setEditTaskTitle,
  setEditTaskDueDate,
  setEditTaskDueTime,
  setEditTaskCategories,
  setEditTaskProjectId,
  setEditTaskPriority,
  setShowTaskEditModal,
}: TaskListProps) {
  // Removed internal editing state: editingId, editTitle, editDueDate, editDueTime, editCategories, editProjectId, editPriority
  
  // Bulk selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  
  // States for subtask creation
  const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null);
  const [subtaskTitles, setSubtaskTitles] = useState<{ [parentId: string]: string }>({});
  
  const initialCollapsedState = useMemo(() => {
    const initialState: {[key: string]: boolean} = {};
    
    // For each task, check if it has subtasks and initialize it as expanded
    tasks.forEach(t => {
      const hasSubtasks = tasks.some(subtask => subtask.parentId === t.id);
      if (hasSubtasks) {
        // Set to false means expanded
        initialState[t.id] = false;
      }
    });
    
    return initialState;
  }, [tasks]);
  
  // State for expanded/collapsed tasks
  const [collapsedTasks, setCollapsedTasks] = useState<{[key: string]: boolean}>(initialCollapsedState);

  // Only render top-level tasks (no parentId) - optimized with useMemo
  const topLevelTasks = useMemo(() => tasks.filter(t => !t.parentId), [tasks]);
  

  // Toggle collapsed state of a task - optimized with useCallback
  const toggleCollapsed = useCallback((taskId: string) => {
    setCollapsedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  }, []);
  
  // Listen for custom events to expand a task's subtasks
  useEffect(() => {
    const handleExpandTask = (e: any) => {
      const { taskId } = e.detail;
      
      // Ensure the task is expanded
      setCollapsedTasks(prev => ({
        ...prev,
        [taskId]: false
      }));
      
      // Scroll to the task if possible
      try {
        setTimeout(() => {
          // Delayed scroll to ensure elements are updated
          const taskElement = document.getElementById(`task-${taskId}`);
          if (taskElement) {
            taskElement.scrollIntoView({ behavior: 'smooth' });
            taskElement.classList.add('highlight-task');
            setTimeout(() => {
              taskElement.classList.remove('highlight-task');
            }, 2000);
          } else {
          }
        }, 300); // Delay scroll to ensure DOM is updated
      } catch (e) {
      }
    };
    
    document.addEventListener('expandTaskSubtasks', handleExpandTask);
    
    return () => {
      document.removeEventListener('expandTaskSubtasks', handleExpandTask);
    };
  }, []);

  // Check if a task has subtasks - optimized with useMemo
  const hasSubtasks = useMemo(() => {
    return (taskId: string) => {
      return tasks.some(t => t.parentId === taskId);
    };
  }, [tasks]);

  // Get all subtasks for a given parent - optimized with useMemo
  const getSubtasks = useMemo(() => {
    return (parentId: string): Task[] => {
      return tasks.filter(t => t.parentId === parentId);
    };
  }, [tasks]);

  // Handle subtask creation
  const handleAddSubtask = (parentId: string) => {
    const title = subtaskTitles[parentId]?.trim();
    if (title) {
      addSubtask(parentId, title);
      setSubtaskTitles(prev => {
        const updated = { ...prev };
        delete updated[parentId];
        return updated;
      });
      setAddingSubtaskFor(null);
    }
  };
  
  // State for converting a task to a subtask
  const [convertTaskId, setConvertTaskId] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  
  // Toggle task selection - optimized with useCallback
  const toggleTaskSelection = useCallback((taskId: string) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      setShowBulkActions(newSet.size > 0);
      return newSet;
    });
  }, []);
  
  // Select all tasks - optimized with useCallback
  const selectAllTasks = useCallback(() => {
    const allTaskIds = new Set(topLevelTasks.map(t => t.id));
    setSelectedTaskIds(allTaskIds);
    setShowBulkActions(true);
  }, [topLevelTasks]);
  
  // Clear selection - optimized with useCallback
  const clearSelection = useCallback(() => {
    setSelectedTaskIds(new Set());
    setShowBulkActions(false);
  }, []);
  
  // Handle bulk actions - optimized with useCallback
  const handleBulkAction = useCallback((action: string, data?: any) => {
    if (onBulkAction) {
      onBulkAction(action, Array.from(selectedTaskIds), data);
      clearSelection();
    }
  }, [onBulkAction, selectedTaskIds, clearSelection]);
  
  // renderTask function is removed as its logic is now in TaskItem.tsx

  return (
    <div>
      {enableBulkActions && showBulkActions && (
        <div className="bulk-actions-toolbar">
          <div className="bulk-actions-info">
            <span>{selectedTaskIds.size} task{selectedTaskIds.size > 1 ? 's' : ''} selected</span>
            <button onClick={selectAllTasks} className="btn btn-sm btn-link">
              Select All
            </button>
            <button onClick={clearSelection} className="btn btn-sm btn-link">
              Clear Selection
            </button>
          </div>
          <div className="bulk-actions-buttons">
            <button 
              onClick={() => handleBulkAction('delete')}
              className="btn btn-sm btn-danger"
            >
              Delete Selected
            </button>
            <select 
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction('assignProject', { projectId: e.target.value });
                }
              }}
              className="form-control form-control-sm"
              defaultValue=""
            >
              <option value="">Assign to Project...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <select 
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction('convertToSubtasks', { parentId: e.target.value });
                }
              }}
              className="form-control form-control-sm"
              defaultValue=""
            >
              <option value="">Convert to Subtasks of...</option>
              {topLevelTasks
                .filter(t => !selectedTaskIds.has(t.id))
                .map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
            </select>
            <button 
              onClick={() => handleBulkAction('markComplete')}
              className="btn btn-sm btn-success"
            >
              Mark Complete
            </button>
          </div>
        </div>
      )}
      {topLevelTasks.length === 0 ? (
        <div className="text-center text-light py-lg">No tasks yet. Add your first task above.</div>
      ) : (
        <div className="tasks-container">
          {topLevelTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              allTasks={tasks} // Pass the full tasks array for subtask filtering
              depth={0} // Top-level tasks are at depth 0
              collapsedTasks={collapsedTasks}
              addingSubtaskFor={addingSubtaskFor}
              subtaskTitles={subtaskTitles}
              convertTaskId={convertTaskId}
              selectedParentId={selectedParentId}
              topLevelTasks={topLevelTasks} // For parent selection in TaskItem
              categories={categories}
              projects={projects}
              enableBulkActions={enableBulkActions} // Pass down to top-level TaskItems
              selectedTaskIds={selectedTaskIds}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
              updateTaskDescription={updateTaskDescription}
              addSubtask={addSubtask}
              updateTaskEstimate={updateTaskEstimate}
              startTaskTimer={startTaskTimer}
              completeTaskTimer={completeTaskTimer}
              moveTaskToParent={moveTaskToParent}
              setEditingTaskId={setEditingTaskId}
              setEditTaskTitle={setEditTaskTitle}
              setEditTaskDueDate={setEditTaskDueDate}
              setEditTaskDueTime={setEditTaskDueTime}
              setEditTaskCategories={setEditTaskCategories}
              setEditTaskProjectId={setEditTaskProjectId}
              setEditTaskPriority={setEditTaskPriority}
              setShowTaskEditModal={setShowTaskEditModal}
              toggleCollapsed={toggleCollapsed}
              setAddingSubtaskFor={setAddingSubtaskFor}
              setSubtaskTitles={setSubtaskTitles}
              setConvertTaskId={setConvertTaskId}
              setSelectedParentId={setSelectedParentId}
              toggleTaskSelection={toggleTaskSelection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
