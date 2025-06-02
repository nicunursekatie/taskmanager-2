import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { Category, Task } from '../types';

export function useCategories(setTasks: React.Dispatch<React.SetStateAction<Task[]>>) {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const id = Date.now().toString();
    const newCategory: Category = { id, ...category };
    setCategories(prev => [...prev, newCategory]);
  }, []);

  const updateCategory = useCallback((id: string, category: Omit<Category, 'id'>) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id
          ? { ...cat, ...category }
          : cat
      )
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    // Remove the category from all tasks
    setTasks(prev =>
      prev.map(task => ({
        ...task,
        categories: task.categories ? task.categories.filter(catId => catId !== id) : []
      }))
    );

    // Remove the category itself
    setCategories(prev => prev.filter(cat => cat.id !== id));
  }, [setTasks]);

  return {
    categories,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory
  };
}