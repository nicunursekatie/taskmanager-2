import React, { useState } from 'react';
import { breakdownTask } from '../utils/groqService';
import { Task } from '../types';
import '../styles/ai-task-breakdown.css';

interface AITaskBreakdownProps {
  task: Task;
  addSubtask: (parentId: string, title: string) => void;
  updateTaskDescription?: (id: string, description: string) => void;
  existingSubtasks: Task[];
  setShowAIBreakdown?: (show: boolean) => void;
  forceRefresh?: () => void;
}

const AITaskBreakdown: React.FC<AITaskBreakdownProps> = ({
  task,
  addSubtask,
  updateTaskDescription,
  existingSubtasks,
  setShowAIBreakdown,
  forceRefresh,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<string[]>([]);
  const [selectedSubtasks, setSelectedSubtasks] = useState<string[]>([]);
  const [editableSubtasks, setEditableSubtasks] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [needsClarification, setNeedsClarification] = useState(false);
  const [clarificationText, setClarificationText] = useState('');
  const [aiClarificationRequest, setAiClarificationRequest] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // 1. AI subtask generation
  const handleGenerateSubtasks = async () => {
    setIsLoading(true);
    setError(null);
    setNeedsClarification(false);
    try {
      const subtasks = await breakdownTask(task.title, task.description || '');
      if (!subtasks || !Array.isArray(subtasks) || subtasks.length === 0)
        throw new Error('No subtasks returned');
      const valid = subtasks.filter(s => typeof s === 'string' && s.trim());
      if (!valid.length) throw new Error('No valid subtasks generated');
      if (valid.length === 1 && valid[0].startsWith('NEEDS_CLARIFICATION')) {
        setNeedsClarification(true);
        setAiClarificationRequest(valid[0].replace('NEEDS_CLARIFICATION:', '').trim());
        setGeneratedSubtasks([]);
        setSelectedSubtasks([]);
      } else {
        setGeneratedSubtasks(valid);
        setSelectedSubtasks(valid.map((_, i) => i.toString()));
        const edits: { [key: number]: string } = {};
        valid.forEach((t, i) => (edits[i] = t));
        setEditableSubtasks(edits);
      }
    } catch (err: any) {
      console.error('AI breakdown error:', err);
      // Custom error messages for API key issues
      if (err.message && err.message.toLowerCase().includes('api key')) {
        setError('Your Groq API key is missing or invalid. Please set it in Settings and try again.');
      } else {
        console.error('Task breakdown error:', err);
      setError(err.message || 'Error generating subtasks');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Toggle and edit
  const toggleSubtaskSelection = (key: string) => {
    setSelectedSubtasks(prev =>
      prev.includes(key) ? prev.filter(st => st !== key) : [...prev, key]
    );
  };
  const handleSubtaskEdit = (key: number, value: string) => {
    setEditableSubtasks(e => ({ ...e, [key]: value }));
  };

  // 3. Add subtasks and CLOSE overlay
  const handleAddSubtasks = () => {
    const subtasksToAdd = selectedSubtasks
      .map(k => editableSubtasks[Number(k)]?.trim())
      .filter(Boolean);

    subtasksToAdd.forEach(subtaskTitle => addSubtask(task.id, subtaskTitle));
    setSuccess(true);
    forceRefresh?.();
    // Brief success, then close
    setTimeout(() => {
      setShowAIBreakdown?.(false);
      // Reset everything else (defensive, but not strictly necessary)
      setGeneratedSubtasks([]);
      setSelectedSubtasks([]);
      setEditableSubtasks({});
      setSuccess(false);
    }, 1000);
  };

  // 4. Clarification/save/cancel logic (unchanged)
  const handleSaveClarification = () => {
    if (updateTaskDescription && clarificationText) {
      const curr = task.description || '';
      const updated = curr ? `${curr}\n\nTask clarification: ${clarificationText}` : `Task clarification: ${clarificationText}`;
      updateTaskDescription(task.id, updated);
    }
    // Hide and reset
    setShowAIBreakdown?.(false);
    setGeneratedSubtasks([]);
    setSelectedSubtasks([]);
    setEditableSubtasks({});
    setError(null);
    setNeedsClarification(false);
    setClarificationText('');
    setAiClarificationRequest('');
  };

  const handleSubmitClarification = async () => {
    if (!updateTaskDescription || !clarificationText.trim()) return;
    const curr = task.description || '';
    const updated = curr ? `${curr}\n\nTask details: ${clarificationText}` : `Task details: ${clarificationText}`;
    updateTaskDescription(task.id, updated);
    setIsLoading(true);
    setNeedsClarification(false);
    try {
      const subtasks = await breakdownTask(task.title, updated);
      const valid = subtasks.filter(s => typeof s === 'string' && s.trim());
      if (!valid.length) throw new Error('No valid subtasks were generated');
      if (valid.length === 1 && valid[0].startsWith('NEEDS_CLARIFICATION')) {
        throw new Error('Still needs more details. Try again.');
      }
      setGeneratedSubtasks(valid);
      setSelectedSubtasks(valid.map((_, i) => i.toString()));
      const edits: { [key: number]: string } = {};
      valid.forEach((t, i) => (edits[i] = t));
      setEditableSubtasks(edits);
    } catch (err: any) {
      setError(err.message || 'Failed to generate subtasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setGeneratedSubtasks([]);
    setSelectedSubtasks([]);
    setEditableSubtasks({});
    setError(null);
    setNeedsClarification(false);
    setClarificationText('');
    setAiClarificationRequest('');
    setIsLoading(false);
    setSuccess(false);
    setShowAIBreakdown?.(false);
  };

  // Auto-trigger on mount
  React.useEffect(() => {
    if (!hasInitialized && !isLoading && !generatedSubtasks.length) {
      setHasInitialized(true);
      handleGenerateSubtasks();
    }
  }, [hasInitialized, isLoading, generatedSubtasks.length]);

  // --- UI ---
  return (
    <div className="ai-task-breakdown">
      {success ? (
        <div className="ai-success-message">
          <span className="success-icon">✅</span> Subtasks added!
        </div>
      ) : !generatedSubtasks.length && !isLoading && !needsClarification ? (
        <button
          className="ai-breakdown-btn"
          onClick={handleGenerateSubtasks}
          disabled={isLoading}
        >
          <span className="ai-icon">🤖</span> Break Down Task with AI
        </button>
      ) : (
        <div className="ai-breakdown-results">
          {isLoading ? (
            <div className="ai-loading">
              <div className="ai-spinner"></div>
              <p>Generating smart subtasks with AI...</p>
            </div>
          ) : error ? (
            <div className="ai-error">
              <div className="error-icon">⚠️</div>
              <p className="error-message">{error}</p>
              <div className="error-help">
                {error.includes('API key') ? (
                  <p className="error-tip">The AI service is currently unavailable. You can still add subtasks manually below.</p>
                ) : (
                  <p className="error-tip">Don't worry - you can still break down tasks manually or try the AI again.</p>
                )}
              </div>
              <div className="error-actions">
                <button onClick={handleGenerateSubtasks} className="retry-btn" disabled={isLoading}>
                  Try AI Again
                </button>
                <button onClick={handleCancel} className="ai-cancel-btn" disabled={isLoading}>
                  Add Manually Instead
                </button>
              </div>
            </div>
          ) : needsClarification ? (
            <div className="ai-clarification">
              <h4 className="ai-clarification-heading">
                Quick Task Context <span className="ai-badge">AI</span>
              </h4>
              <div className="ai-clarification-questions">
                <p className="ai-clarification-text">{aiClarificationRequest}</p>
                <div className="ai-clarification-tips">
                  <p className="clarification-tip">Add a bit more context:</p>
                  <ul>
                    <li>General purpose (why or what for)</li>
                    <li>Rough timeframe (is this urgent?)</li>
                    <li>Your role (personal, work, etc.)</li>
                    <li>Optional: any key constraints</li>
                  </ul>
                </div>
              </div>
              <textarea
                className="ai-clarification-input"
                placeholder="Add additional details about this task..."
                value={clarificationText}
                onChange={e => setClarificationText(e.target.value)}
                rows={4}
              />
              <div className="ai-actions">
                <button className="ai-cancel-btn" onClick={handleCancel}>Cancel</button>
                <button className="ai-save-btn" onClick={handleSaveClarification}>Skip & Save Note</button>
                <button
                  className="ai-generate-btn"
                  onClick={handleSubmitClarification}
                  disabled={!clarificationText.trim()}
                >
                  Generate Subtasks
                </button>
              </div>
            </div>
          ) : (
            <>
              <h4 className="ai-subtasks-heading">
                AI-Suggested Subtasks <span className="ai-badge">{generatedSubtasks.length}</span>
              </h4>
              <div className="ai-subtasks-notification">
                Review and confirm these suggested subtasks
              </div>
              <div className="ai-subtasks-header">
                <div className="ai-select-all">
                  <input
                    type="checkbox"
                    id="select-all-subtasks"
                    checked={selectedSubtasks.length === generatedSubtasks.length}
                    onChange={() => {
                      if (selectedSubtasks.length === generatedSubtasks.length) {
                        setSelectedSubtasks([]);
                      } else {
                        setSelectedSubtasks(generatedSubtasks.map((_, i) => i.toString()));
                      }
                    }}
                  />
                  <label htmlFor="select-all-subtasks">
                    {selectedSubtasks.length === generatedSubtasks.length ? 'Deselect All' : 'Select All'}
                  </label>
                </div>
              </div>
              <div className="ai-subtasks-list">
                {generatedSubtasks.map((subtask, index) => (
                  <div key={index} className={`ai-subtask-item ${selectedSubtasks.includes(index.toString()) ? 'selected' : ''}`}>
                    <div className="ai-checkbox-container">
                      <input
                        type="checkbox"
                        id={`subtask-${index}`}
                        checked={selectedSubtasks.includes(index.toString())}
                        onChange={() => toggleSubtaskSelection(index.toString())}
                      />
                      <span className="ai-checkmark"></span>
                      <input
                        type="text"
                        className="ai-subtask-edit"
                        value={editableSubtasks[index] || ''}
                        onChange={e => handleSubtaskEdit(index, e.target.value)}
                        disabled={!selectedSubtasks.includes(index.toString())}
                        placeholder="Edit subtask..."
                        style={{ color: '#222', background: '#fff', fontSize: 16, minWidth: 250, minHeight: 30, border: '1px solid #ccc', padding: '4px 8px', opacity: 1, zIndex: 10 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="ai-actions">
                <button className="ai-cancel-btn" onClick={handleCancel}>Cancel</button>
                <button
                  className="ai-add-btn"
                  onClick={handleAddSubtasks}
                  disabled={selectedSubtasks.length === 0}
                >
                  Add Selected Subtasks
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AITaskBreakdown;