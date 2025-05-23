import { useState } from 'react';
import { Task } from '../types';

type SuggestionWizardProps = {
  tasks: Task[];
  generalTasks: string[];
  extraSuggestions?: string[];
  addTask: (title: string, dueDate: string | null, parentId?: string, categories?: string[]) => void;
  onClose: () => void;
};

const timeOptions = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
];

const energyOptions = [
  { label: 'High energy', value: 'high' },
  { label: 'Medium energy', value: 'medium' },
  { label: 'Low energy', value: 'low' },
];
const categoryOptions = [
  { label: 'Work follow‑up', value: 'work' },
  { label: 'Home chores', value: 'home' },
  { label: 'Self‑care', value: 'self' },
  { label: 'Brain dump', value: 'brain' },
  { label: 'Family boundaries', value: 'family' },
];

export default function SuggestionWizard({
  tasks,
  addTask,
  onClose,
}: SuggestionWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'work' | 'home' | 'self' | 'brain' | 'family' | null>(null);

  // Filter pending tasks and sort by due date
  const pending = tasks.filter(t => t.status === 'pending');
  const sorted = [...pending].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  let dynamicSuggestions: string[] = [];
  if (selectedCategory === 'work') {
    dynamicSuggestions = ['Follow up on NeoBelly feedback from Marie'];
  } else if (selectedCategory === 'home') {
    dynamicSuggestions = ['Wash and dry your NICU scrubs', 'Prep snacks for Carter and Charlotte'];
  } else if (selectedCategory === 'self') {
    dynamicSuggestions = ['Schedule time for self‑care today', 'Plan a small craft project'];
  } else if (selectedCategory === 'brain') {
    dynamicSuggestions = ['Brain dump everything on your mind'];
  } else if (selectedCategory === 'family') {
    dynamicSuggestions = ['Reflect on boundaries with your mom and stepmom'];
  } else {
    // default to nearest pending tasks
    dynamicSuggestions = sorted.slice(0, 3).map(t => t.title);
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 24,
          borderRadius: 8,
          width: 320,
        }}
      >
        {step === 0 && (
          <>
            <h3>How much time do you have?</h3>
            <select
              style={{ width: '100%', padding: 8 }}
              onChange={e => setSelectedTime(Number(e.target.value))}
              defaultValue=""
            >
              <option value="" disabled>
                Select…
              </option>
              {timeOptions.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              style={{ marginTop: 16 }}
              disabled={selectedTime === null}
              onClick={() => setStep(1)}
            >
              Next
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <h3>What’s your energy level?</h3>
            <select
              style={{ width: '100%', padding: 8 }}
              onChange={e => setSelectedEnergy(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Select…
              </option>
              {energyOptions.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              style={{ marginTop: 16 }}
              disabled={!selectedEnergy}
              onClick={() => setStep(2)}
            >
              Next
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h3>What kind of suggestion?</h3>
            <select
              style={{ width: '100%', padding: 8 }}
              onChange={e => {
                const value = e.target.value as string;
                if (['work', 'home', 'self', 'brain', 'family'].includes(value)) {
                  setSelectedCategory(value as 'work' | 'home' | 'self' | 'brain' | 'family');
                } else {
                  setSelectedCategory(null);
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Select type…</option>
              {categoryOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              style={{ marginTop: 16 }}
              disabled={!selectedCategory}
              onClick={() => setStep(3)}
            >
              Show Suggestions
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <h3>Try one of these:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {dynamicSuggestions.map((title, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  <button
                    style={{
                      padding: '4px 8px',
                      width: '100%',
                      textAlign: 'left',
                    }}
                    onClick={() => {
                      addTask(title, null, undefined, selectedCategory ? [selectedCategory] : undefined);
                      onClose();
                    }}
                  >
                    {title}
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={onClose} style={{ marginTop: 8 }}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}