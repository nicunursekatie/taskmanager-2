import React from 'react';
import { Task, TimeBlock } from '../types'; // Assuming TimeBlock type is defined in src/types.ts
import DailyPlanner from './DailyPlanner'; // The actual daily planner implementation

interface DailyPlannerViewProps {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, timeBlock: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  assignTaskToBlock: (blockId: string, taskId: string | null) => void;
  currentDate: Date; // Renamed from 'date' in DailyPlanner props to 'currentDate' for clarity at App level
  setCurrentDate: (date: Date) => void; // Renamed from 'setDate'
  updateTaskEstimate: (id: string, estimatedMinutes: number | null) => void;
}

const DailyPlannerView: React.FC<DailyPlannerViewProps> = ({
  tasks,
  timeBlocks,
  addTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  assignTaskToBlock,
  currentDate,
  setCurrentDate,
  updateTaskEstimate,
}) => {
  return (
    <div className="daily-planner-view"> {/* This class is from App.tsx */}
      <DailyPlanner
        tasks={tasks}
        timeBlocks={timeBlocks}
        addTimeBlock={addTimeBlock}
        updateTimeBlock={updateTimeBlock}
        deleteTimeBlock={deleteTimeBlock}
        assignTaskToBlock={assignTaskToBlock}
        date={currentDate} // Prop for DailyPlanner component is 'date'
        setDate={setCurrentDate} // Prop for DailyPlanner component is 'setDate'
        updateTaskEstimate={updateTaskEstimate}
      />
    </div>
  );
};

export default DailyPlannerView;
