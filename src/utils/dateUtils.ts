// src/utils/dateUtils.ts

export const isDateBefore = (taskDateStr: string | null | undefined, compareDate: Date): boolean => {
  if (!taskDateStr) return false;
  // Attempt to handle various date string formats that might come from tasks
  // This might need more robust parsing if dates are not consistently ISO
  const taskDate = new Date(taskDateStr);

  // Check if taskDate is valid after parsing
  if (isNaN(taskDate.getTime())) {
    // console.warn(`Invalid date string encountered in isDateBefore: ${taskDateStr}`);
    return false;
  }

  // Normalize to start of day for comparison
  const normalizedTaskDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  const normalizedCompareDate = new Date(compareDate.getFullYear(), compareDate.getMonth(), compareDate.getDate());

  return normalizedTaskDate < normalizedCompareDate;
};

export const isDateBetween = (taskDateStr: string | null | undefined, startDate: Date, endDate: Date): boolean => {
  if (!taskDateStr) return false;
  const taskDate = new Date(taskDateStr);

  // Check if taskDate is valid after parsing
  if (isNaN(taskDate.getTime())) {
    // console.warn(`Invalid date string encountered in isDateBetween: ${taskDateStr}`);
    return false;
  }

  // Normalize to start of day
  const normalizedTaskDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
  const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  return normalizedTaskDate >= normalizedStartDate && normalizedTaskDate < normalizedEndDate;
};
