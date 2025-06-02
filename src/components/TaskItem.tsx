import React from 'react';
import { Task, Category, Project, PriorityLevel } from '../types';
import TaskBreakdown from './TaskBreakdown';
import TimeEstimator from './TimeEstimator';

// Forward declaration for recursive type
interface TaskItemProps {
  task: Task;
  allTasks: Task[]; // To find subtasks and for parent selection
  depth?: number;
  collapsedTasks: { [key: string]: boolean };
  addingSubtaskFor: string | null;
  subtaskTitles: { [parentId: string]: string };
  convertTaskId: string | null;
  selectedParentId: string | null;
  topLevelTasks: Task[]; // For parent selection dropdown
  categories: Category[];
  projects: Project[];
  enableBulkActions?: boolean;
  selectedTaskIds: Set<string>;

  // Functions from TaskListProps (and App.tsx)
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskDescription: (id: string, description: string) => void;
  addSubtask: (parentId: string, title: string) => void;
  updateTaskEstimate?: (id: string, estimatedMinutes: number | null) => void;
  startTaskTimer?: (id: string) => void;
  completeTaskTimer?: (id: string) => void;
  moveTaskToParent: (id: string, parentId: string | null) => void;
  setEditingTaskId: (id: string | null) => void;
  setEditTaskTitle: (title: string) => void;
  setEditTaskDueDate: (date: string) => void;
  setEditTaskDueTime: (time: string) => void;
  setEditTaskCategories: (categories: string[]) => void;
  setEditTaskProjectId: (id: string | null) => void;
  setEditTaskPriority: (priority: PriorityLevel | null) => void;
  setShowTaskEditModal: (show: boolean) => void;

  // Functions to manage state in TaskList.tsx
  toggleCollapsed: (taskId: string) => void;
  setAddingSubtaskFor: (parentId: string | null) => void;
  setSubtaskTitles: (updater: (prev: { [key: string]: string }) => { [key: string]: string }) => void;
  setConvertTaskId: (taskId: string | null) => void;
  setSelectedParentId: (parentId: string | null) => void;
  toggleTaskSelection: (taskId: string) => void;
  // handleAddSubtask is simplified as addSubtask prop is directly available
}

const TaskItemComponent: React.FC<TaskItemProps> = ({
  task,
  allTasks,
  depth = 0,
  collapsedTasks,
  addingSubtaskFor,
  subtaskTitles,
  convertTaskId,
  selectedParentId,
  topLevelTasks,
  categories,
  projects,
  enableBulkActions,
  selectedTaskIds,
  toggleTask,
  deleteTask,
  updateTaskDescription,
  addSubtask,
  updateTaskEstimate,
  startTaskTimer,
  completeTaskTimer,
  moveTaskToParent,
  setEditingTaskId,
  setEditTaskTitle,
  setEditTaskDueDate,
  setEditTaskDueTime,
  setEditTaskCategories,
  setEditTaskProjectId,
  setEditTaskPriority,
  setShowTaskEditModal,
  toggleCollapsed,
  setAddingSubtaskFor,
  setSubtaskTitles,
  setConvertTaskId,
  setSelectedParentId,
  toggleTaskSelection,
}) => {
  const isCollapsed = collapsedTasks[task.id];
  const getSubtasks = (parentId: string): Task[] => allTasks.filter(t => t.parentId === parentId);
  const taskSubtasks = getSubtasks(task.id);
  const hasChildren = taskSubtasks.length > 0;
  const isSubtask = !!task.parentId;

  const handleAddSubtaskInternal = () => {
    const title = subtaskTitles[task.id]?.trim();
    if (title) {
      addSubtask(task.id, title);
      setSubtaskTitles(prev => {
        const updated = { ...prev };
        delete updated[task.id];
        return updated;
      });
      setAddingSubtaskFor(null);
    }
  };

  // Determine the color for the category (use the first category if available)
  // This logic was outside renderTask, but makes sense per item
  // const categoryColor =
  //   task.categories && task.categories.length > 0
  //     ? (categories.find(c => c.id === task.categories![0])?.color || "#bdbdbd")
  //     : "#bdbdbd";


  return (
    <div
      key={task.id} // key is used by React when mapping, not needed here if TaskItem is the mapped component
      className={
        [
          depth === 0
            ? "task-list-item py-2 px-0 border-b border-gray-200 last:border-b-0"
            : "task-list-item subtask",
        ].join(' ')
      }
      style={isSubtask ? { display: 'block', marginLeft: depth * 24, background: '#f7faff', padding: '6px 12px', borderRadius: 4, fontSize: '0.95em', borderLeft: '2px solid #e0e0e0', marginTop: 4, marginBottom: 4 } : { display: 'block' }}
    >
      <div
        id={`task-${task.id}`}
        className={
          [
            isSubtask ? "" : "flex flex-col gap-2",
            task.status === 'completed' ? 'opacity-60 line-through' : '',
            hasChildren && !isSubtask ? 'border-l-4 border-blue-200' : '',
            !isCollapsed && hasChildren ? 'bg-blue-50' : '',
          ].join(' ')
        }
      >
        <> {/* View mode is always active here as inline editing was removed */}
          <div className="task-header">
            <div className="task-title-container">
              {enableBulkActions && !isSubtask && (
                <input
                  type="checkbox"
                  checked={selectedTaskIds.has(task.id)}
                  onChange={(e) => { e.stopPropagation(); toggleTaskSelection(task.id); }}
                  onClick={(e) => e.stopPropagation()}
                  className="bulk-select-checkbox"
                  style={{ marginRight: '8px' }}
                />
              )}
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                onClick={(e) => e.stopPropagation()}
              />
              {isSubtask && (
                <span style={{ fontSize: "0.85em", color: "#2196f3", marginRight: "6px", fontWeight: 500, letterSpacing: "0.5px" }} title="Subtask">
                  ⮑ Subtask
                </span>
              )}
              {hasChildren && (
                <span className="task-collapse-toggle" onClick={() => toggleCollapsed(task.id)} role="button" aria-label={isCollapsed ? "Expand subtasks" : "Collapse subtasks"}>
                  {isCollapsed ? '+' : '-'}
                </span>
              )}
              <h3
                className={`task-title ${task.status === 'completed' ? 'completed' : ''}`}
                style={{ color: task.status === 'completed' ? '#888' : '#222', fontWeight: 500, cursor: 'pointer' }}
                onClick={() => {
                  if (setEditingTaskId && setShowTaskEditModal && setEditTaskTitle && setEditTaskDueDate && setEditTaskDueTime && setEditTaskCategories && setEditTaskProjectId && setEditTaskPriority) {
                    setEditingTaskId(task.id);
                    setEditTaskTitle(task.title);
                    setEditTaskDueDate(task.dueDate || '');
                    setEditTaskDueTime(task.dueTime || '');
                    setEditTaskCategories(task.categories || []);
                    setEditTaskProjectId(task.projectId ?? null);
                    setEditTaskPriority(task.priority ?? null);
                    setShowTaskEditModal(true);
                  }
                }}
              >
                {task.title}
              </h3>
            </div>
            <div className="task-actions">
              {!isSubtask && (
                <button className="btn btn-sm btn-outline" onClick={() => { setAddingSubtaskFor(task.id); if (isCollapsed) { toggleCollapsed(task.id); } }}>
                  Add Subtask
                </button>
              )}
              <button onClick={() => deleteTask(task.id)} className="btn btn-sm btn-muted" title="Delete task">
                🗑️
              </button>
              {!isSubtask && (
                <button className="btn btn-sm btn-outline" style={{ marginLeft: 8 }} onClick={() => { setConvertTaskId(task.id); setSelectedParentId(null); }}>
                  Convert to Subtask
                </button>
              )}
            </div>
          </div>

          {!isSubtask && convertTaskId === task.id && (
            <div className="convert-subtask-dropdown" style={{ marginTop: 8 }}>
              <select className="form-control" value={selectedParentId || ''} onChange={e => setSelectedParentId(e.target.value)}>
                <option value="">Select parent task...</option>
                {topLevelTasks.filter(t => t.id !== task.id).map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              <button className="btn btn-sm btn-primary" style={{ marginLeft: 8 }} disabled={!selectedParentId} onClick={() => { if (selectedParentId) { moveTaskToParent(task.id, selectedParentId); setConvertTaskId(null); setSelectedParentId(null); } }}>
                Confirm
              </button>
              <button className="btn btn-sm btn-outline" style={{ marginLeft: 4 }} onClick={() => { setConvertTaskId(null); setSelectedParentId(null); }}>
                Cancel
              </button>
            </div>
          )}

          <div className="task-meta">
            {task.dueDate && (
              <span className="task-date" style={{ color: '#444' }}>
                {new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                {task.dueTime && (<span className="task-time">{" at "}{task.dueTime.substring(0, 5)}</span>)}
              </span>
            )}
            {task.priority && (<span className={`priority-badge ${task.priority}`} style={{ color: '#222' }}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>)}
            {updateTaskEstimate && startTaskTimer && completeTaskTimer && !isSubtask && (
              <TimeEstimator task={task} updateTaskEstimate={updateTaskEstimate} startTaskTimer={startTaskTimer} completeTaskTimer={completeTaskTimer} />
            )}
            {task.categories && task.categories.length > 0 && task.categories.map(categoryId => {
              const category = categories.find(c => c.id === categoryId);
              return category ? (<span key={categoryId} className="task-category" style={{ backgroundColor: category.color, color: '#fff' }}>{category.name}</span>) : null;
            })}
            {task.projectId && !isSubtask && (<span className="task-project" style={{ color: '#4361ee' }}>{projects.find(p => p.id === task.projectId)?.name || 'Unknown Project'}</span>)}
          </div>

          {!isSubtask && addingSubtaskFor === task.id && (
            <div className="subtask-form">
              <div className="flex gap-sm">
                <input type="text" className="form-control" placeholder="New subtask..." value={subtaskTitles[task.id] || ''} onChange={(e) => setSubtaskTitles(prev => ({ ...prev, [task.id]: e.target.value }))} />
                <button className="btn btn-sm btn-primary" onClick={handleAddSubtaskInternal}>Add</button>
                <button className="btn btn-sm btn-outline" onClick={() => { setAddingSubtaskFor(null); setSubtaskTitles(prev => { const updated = { ...prev }; delete updated[task.id]; return updated; }); }}>Cancel</button>
              </div>
            </div>
          )}
          {depth === 0 && !task.parentId && (
            <TaskBreakdown task={task} subtasks={getSubtasks(task.id)} addSubtask={addSubtask} toggleTask={toggleTask} updateTaskDescription={updateTaskDescription} />
          )}
        </>
      </div>
      {hasChildren && !isCollapsed && (
        <ul className="subtask-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
          {taskSubtasks.map((subtask: Task) => (
            <li key={subtask.id}>
              {/* Recursive call to TaskItemComponent */}
              <TaskItemComponent
                {...{
                  task: subtask,
                  allTasks,
                  depth: depth + 1,
                  collapsedTasks,
                  addingSubtaskFor,
                  subtaskTitles,
                  convertTaskId,
                  selectedParentId,
                  topLevelTasks,
                  categories,
                  projects,
                  enableBulkActions: false, // Usually bulk actions not on subtasks directly in this UI
                  selectedTaskIds, // Pass down for consistency, though likely not used for sub-items
                  toggleTask,
                  deleteTask,
                  updateTaskDescription,
                  addSubtask,
                  updateTaskEstimate,
                  startTaskTimer,
                  completeTaskTimer,
                  moveTaskToParent,
                  setEditingTaskId,
                  setEditTaskTitle,
                  setEditTaskDueDate,
                  setEditTaskDueTime,
                  setEditTaskCategories,
                  setEditTaskProjectId,
                  setEditTaskPriority,
                  setShowTaskEditModal,
                  toggleCollapsed,
                  setAddingSubtaskFor,
                  setSubtaskTitles,
                  setConvertTaskId,
                  setSelectedParentId,
                  toggleTaskSelection,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const TaskItem = React.memo(TaskItemComponent);
