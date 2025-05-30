// src/hooks/useTimeBlocks.ts
import { useState, useEffect } from 'react';
import { TimeBlock } from '../types';

// Format date to YYYY-MM-DD for storage
const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Create a hook to manage time blocks
export function useTimeBlocks() {
  // State to store time blocks for the current date
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  
  // Get date key for localStorage
  const currentDateKey = formatDateKey(currentDate);
  
  // Load time blocks for the current date from localStorage
  useEffect(() => {
    try {
      const storedBlocks = localStorage.getItem(`timeBlocks_${currentDateKey}`);
      if (storedBlocks) {
        setTimeBlocks(JSON.parse(storedBlocks));
      } else {
        // If no blocks for this date, set empty array
        setTimeBlocks([]);
      }
    } catch (error) {
      setTimeBlocks([]);
    }
  }, [currentDateKey]);
  
  // Save time blocks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(`timeBlocks_${currentDateKey}`, JSON.stringify(timeBlocks));
    } catch (error) {
      // Error saving time blocks
    }
  }, [timeBlocks, currentDateKey]);
  
  // Add a new time block
  const addTimeBlock = (block: Omit<TimeBlock, 'id'>) => {
    const newBlock: TimeBlock = {
      id: Date.now().toString(),
      ...block
    };
    setTimeBlocks(prev => [...prev, newBlock]);
  };
  
  // Update an existing time block
  const updateTimeBlock = (id: string, updates: Partial<TimeBlock>) => {
    setTimeBlocks(prev => 
      prev.map(block => 
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };
  
  // Delete a time block
  const deleteTimeBlock = (id: string) => {
    setTimeBlocks(prev => prev.filter(block => block.id !== id));
  };
  
  // Assign a task to a time block
  const assignTaskToBlock = (taskId: string, blockId: string | null) => {
    // If blockId is null, remove task from any blocks it's in
    if (blockId === null) {
      setTimeBlocks(prev => 
        prev.map(block => ({
          ...block,
          taskIds: block.taskIds.filter(id => id !== taskId)
        }))
      );
      return;
    }
    
    // First, remove the task from any other blocks
    const updatedBlocks = timeBlocks.map(block => ({
      ...block,
      taskIds: block.taskIds.filter(id => id !== taskId)
    }));
    
    // Then add the task to the specified block
    setTimeBlocks(
      updatedBlocks.map(block => 
        block.id === blockId
          ? { ...block, taskIds: [...block.taskIds, taskId] }
          : block
      )
    );
  };
  
  return {
    timeBlocks,
    currentDate,
    setCurrentDate,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    assignTaskToBlock
  };
}
