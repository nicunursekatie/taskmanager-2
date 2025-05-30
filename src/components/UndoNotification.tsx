import { useEffect } from 'react';

interface UndoNotificationProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number; // in milliseconds
}

export default function UndoNotification({
  message,
  onUndo,
  onDismiss,
  duration = 5000
}: UndoNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div className="undo-notification">
      <span className="undo-message">{message}</span>
      <div className="undo-actions">
        <button 
          className="undo-button"
          onClick={onUndo}
        >
          Undo
        </button>
        <button 
          className="dismiss-button"
          onClick={onDismiss}
        >
          ✕
        </button>
      </div>
    </div>
  );
}