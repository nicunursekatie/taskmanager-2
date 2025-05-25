// src/components/CategoryManager.tsx
import React, { useState } from 'react';
import { Category } from '../types';

type CategoryManagerProps = {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  onClose: () => void;
  editingCategoryId?: string | null;
};

export default function CategoryManager({
  categories,
  addCategory,
  updateCategory,
  deleteCategory,
  onClose,
  editingCategoryId = null
}: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3B82F6'); // Default to a blue color
  const [editId, setEditId] = useState<string | null>(editingCategoryId);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  // Initialize edit form if an editingCategoryId is provided
  React.useEffect(() => {
    if (editingCategoryId) {
      const categoryToEdit = categories.find(c => c.id === editingCategoryId);
      if (categoryToEdit) {
        setEditId(categoryToEdit.id);
        setEditName(categoryToEdit.name);
        setEditColor(categoryToEdit.color);
      }
    }
  }, [editingCategoryId, categories]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    addCategory({
      name: newName.trim(),
      color: newColor,
    });
    
    setNewName('');
    setNewColor('#3B82F6'); // Reset to default blue
  };

  const startEditing = (category: Category) => {
    setEditId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  };

  const handleUpdateCategory = () => {
    if (!editId || !editName.trim()) return;
    
    updateCategory(editId, {
      name: editName.trim(),
      color: editColor,
    });
    
    setEditId(null);
  };

  return (
    <div className="card">
      <div className="flex flex-col gap-md">
        <div className="flex justify-between items-center">
          <h2>Categories</h2>
          <button onClick={onClose} className="btn btn-primary">
            Add Category
          </button>
        </div>

        <div className="grid grid-2 gap-md">
          {categories.map(category => (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <h3>{category.name}</h3>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm text-light">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}