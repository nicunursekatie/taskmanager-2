// src/components/CalendarView.tsx
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import type { Task } from '../types';

type CalendarViewProps = {
  tasks: Task[];
  toggleTask: (id: string) => void;
};

export default function CalendarView({ tasks, toggleTask }: CalendarViewProps) {
  const [date, setDate] = useState(new Date());

  // Filter tasks for the selected day
  const dayStr = date.toISOString().split('T')[0];
  const tasksForDay = tasks.filter(
    t => t.dueDate && t.dueDate.split('T')[0] === dayStr
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Calendar
        onChange={(value) => {
          if (value instanceof Date) {
            setDate(value);
          }
        }}
        value={date}
        tileContent={({ date: d }) => {
          const dStr = d.toISOString().split('T')[0];
          const count = tasks.filter(
            t => t.dueDate && t.dueDate.split('T')[0] === dStr
          ).length;
          return count > 0 ? <div style={{ fontSize: '0.8em', color: '#007acc' }}>{count}</div> : null;
        }}
      />
      <h2 style={{ marginTop: '16px' }}>Tasks on {date.toLocaleDateString()}</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasksForDay.map(task => (
          <li key={task.id} style={{ margin: '4px 0' }}>
            <button
              onClick={() => toggleTask(task.id)}
              style={{
                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {task.title}
            </button>
          </li>
        ))}
        {tasksForDay.length === 0 && <li style={{ color: '#666' }}>No tasks</li>}
      </ul>
    </div>
  );
}