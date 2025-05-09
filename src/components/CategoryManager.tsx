// src/components/CategoryManager.tsx
import React, { useState } from 'react';
import { Category } from '../types';

type CategoryManagerProps = {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  onClose: () => void;
};

export default function CategoryManager({
  categories,
  addCategory,
  updateCategory,
  deleteCategory,
  onClose,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3B82F6'); // Default to a blue color
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Manage Categories</h2>
          <button className="btn btn-sm btn-outline" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleAddCategory} className="input-group">
            <label className="form-label">Add New Category</label>
            <div className="flex gap-sm">
              <input
                type="text"
                className="form-control"
                placeholder="Category name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                type="color"
                className="form-control"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                style={{ width: '60px', padding: '0', height: '38px' }}
              />
              <button type="submit" className="btn btn-primary">Add</button>
            </div>
          </form>
          
          <div className="item-list">
            {categories.map((category) => (
              <div key={category.id} className="item-card">
                {editId === category.id ? (
                  <div className="task-edit-form">
                    <input
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Category name"
                    />
                    <div className="flex gap-sm mt-sm">
                      <input
                        type="color"
                        className="form-control"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        style={{ width: '60px', padding: '0', height: '38px' }}
                      />
                      <button 
                        className="btn btn-primary"
                        onClick={handleUpdateCategory}
                      >
                        Save
                      </button>
                      <button 
                        className="btn btn-outline"
                        onClick={() => setEditId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="item-header">
                    <div className="flex items-center">
                      <span 
                        className="color-dot" 
                        style={{ backgroundColor: category.color, width: '16px', height: '16px', borderRadius: '50%', marginRight: '8px' }}
                      />
                      <span className="item-title">{category.name}</span>
                    </div>
                    <div className="flex gap-sm">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => startEditing(category)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteCategory(category.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {categories.length === 0 && (
              <div className="text-center text-light mt-lg">
                No categories yet. Add one above to get started.
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}