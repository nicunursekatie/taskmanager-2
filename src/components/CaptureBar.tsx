// src/components/CaptureBar.tsx
import React, { useState } from 'react';
import { Category, Project } from '../types';

type CaptureBarProps = {
  addTask: (
    title: string,
    dueDate: string | null,
    parentId?: string,
    categoryIds?: string[],
    projectId?: string | null
  ) => void;
  newParent: string;
  setNewParent: (id: string) => void;
  parentOptions: { id: string; title: string }[];
  categories: Category[];
  projects: Project[];
};

export default function CaptureBar({
  addTask,
  newParent,
  setNewParent,
  parentOptions,
  categories,
  projects
}: CaptureBarProps) {
  // Local state for form fields
  const [text, setText] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [dueTime, setDueTime] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    // Prepare the date string without automatically adding a time component if none is provided
    let dateValue = null;
    if (dueDate) {
      // Only add the time component if a time is actually provided
      dateValue = dueTime ? `${dueDate}T${dueTime}` : dueDate;
    }

    // Add the task
    addTask(
      trimmed,
      dateValue,
      newParent,
      selectedCategories.length > 0 ? selectedCategories : undefined,
      projectId, // Include the project ID
    );

    // Reset form fields
    setText('');
    setDueDate('');
    setDueTime('');
    setNewParent('');
    setSelectedCategories([]);
    setProjectId(null);
  };

  return (
    <div className="bg-white border border-border rounded-xl shadow-sm px-4 py-3 mb-8">
      <form className="flex flex-wrap items-center gap-3" onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-control flex-1 min-w-[180px]"
          placeholder="Quick capture a new task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="date"
          className="form-control w-[150px]"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
        <input
          type="time"
          className="form-control w-[120px]"
          value={dueTime}
          onChange={e => setDueTime(e.target.value)}
        />
        <select
          className="form-control w-[160px]"
          value={newParent}
          onChange={e => setNewParent(e.target.value)}
        >
          <option value="">No Parent Task</option>
          {parentOptions.map(o => (
            <option key={o.id} value={o.id}>{o.title}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary h-[42px] px-5">
          Add Task
        </button>
      </form>
      {showAdditionalOptions ? (
        <div className="additional-options mt-md">
          <select
            className="form-control"
            value={projectId || ''}
            onChange={e => setProjectId(e.target.value || null)}
          >
            <option value="">No Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <div className="category-selector mt-sm">
            <label className="form-label">Categories</label>
            <div className="category-options flex flex-wrap gap-xs">
              {categories.map(category => (
                <div
                  key={category.id}
                  className={`category-option ${selectedCategories.includes(category.id) ? 'selected' : ''}`}
                  style={{
                    backgroundColor: selectedCategories.includes(category.id) ? category.color : 'transparent',
                    border: `1px solid ${category.color}`,
                    color: selectedCategories.includes(category.id) ? 'white' : category.color,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    margin: '2px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (selectedCategories.includes(category.id)) {
                      setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                    } else {
                      setSelectedCategories([...selectedCategories, category.id]);
                    }
                  }}
                >
                  {category.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button 
          className="btn btn-sm btn-outline mt-sm" 
          onClick={() => setShowAdditionalOptions(true)}
          type="button"
        >
          Show more options
        </button>
      )}
    </div>
  );
}