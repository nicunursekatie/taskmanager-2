import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../common/Button';

interface AITaskBreakdownProps {
  parentTaskId: string;
  onSubtasksChange: (subtaskIds: string[]) => void;
}

const AITaskBreakdown: React.FC<AITaskBreakdownProps> = ({
  parentTaskId,
  onSubtasksChange,
}) => {
  const { addTask } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This function calls the AI API and parses the subtasks.
  const handleBreakdown = async () => {
    setLoading(true);
    setError(null);

    try {
      // --- FAKE API CALL EXAMPLE (replace with your actual logic) ---
      const aiResponse = await fetch('/api/ai-task-breakdown', {
        method: 'POST',
        body: JSON.stringify({ parentTaskId }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!aiResponse.ok) throw new Error('API request failed');

      const { subtasks } = await aiResponse.json(); // subtasks: string[]
      if (!Array.isArray(subtasks)) throw new Error('Invalid AI response format');

      // --- FIX: Add all subtasks, collect their IDs ---
      const newSubtaskIds: string[] = [];
      for (const title of subtasks) {
        const timestamp = new Date().toISOString();
        const newSubtask = addTask({
          title,
          parentTaskId,
          completed: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        newSubtaskIds.push(newSubtask.id);
      }

      // --- IMPORTANT: Update all subtask IDs for parent! ---
      onSubtasksChange(newSubtaskIds);

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setLoading(false);
    }
  };

  return (
    <div className="ai-task-breakdown">
      <Button onClick={handleBreakdown} disabled={loading}>
        {loading ? 'Generating...' : 'Break Down with AI'}
      </Button>
      {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
    </div>
  );
};

export default AITaskBreakdown;