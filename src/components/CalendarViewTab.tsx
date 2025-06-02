import React from 'react';
import { Task, Category, Project } from '../types';
import CalendarView from './CalendarView'; // The actual calendar implementation

interface CalendarViewTabProps {
  tasks: Task[];
  toggleTaskWithUndo: (taskId: string) => void;
  categories: Category[];
  projects: Project[];
  // Add any other props CalendarView itself might need if they are passed from App.tsx
  // For now, assuming CalendarView takes these specific props based on App.tsx usage.
}

const CalendarViewTab: React.FC<CalendarViewTabProps> = ({
  tasks,
  toggleTaskWithUndo,
  categories,
  projects,
}) => {
  return (
    <div className="calendar-view-container">
      <div className="section-card">
        <h2 className="section-title">Calendar</h2>
        <CalendarView
          tasks={tasks}
          toggleTask={toggleTaskWithUndo}
          categories={categories}
          projects={projects}
        />
      </div>
    </div>
  );
};

export default CalendarViewTab;
