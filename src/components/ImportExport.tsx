// src/components/ImportExport.tsx
import React, { useState, useRef } from 'react';
import { downloadData, importData } from '../utils/dataUtils';
import { Task, Category, Project } from '../types';

type ImportExportProps = {
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  onClose: () => void;
};

export default function ImportExport({
  setTasks,
  setCategories,
  setProjects,
  onClose,
}: ImportExportProps) {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    downloadData(`taskmanager-export-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = event.target?.result as string;
        const data = importData(jsonData);
        
        setTasks(data.tasks);
        setCategories(data.categories);
        setProjects(data.projects);
        
        setImportSuccess(true);
      } catch (error) {
        setImportError((error as Error).message || 'Failed to import data');
      }
    };
    
    reader.onerror = () => {
      setImportError('Error reading file');
    };
    
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Check if this is likely a first-time setup
  const isFirstTimeSetup = tasks.length === 0 && categories.length === 0 && projects.length === 0;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Import/Export Data</h2>
          <button className="btn btn-sm btn-outline" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {isFirstTimeSetup && (
            <div className="section-card new-user-message">
              <h3>Welcome to Task Manager!</h3>
              <p>It looks like you're just getting started. You can:</p>
              <ul>
                <li>Import data from another task manager</li>
                <li>Use the "Load Sample Data" button on the main screen to get started with examples</li>
                <li>Or just start creating your own tasks, categories, and projects from scratch</li>
              </ul>
            </div>
          )}

          <div className="section-card">
            <h3>Export Data</h3>
            <p>Download all your tasks, categories, and projects as a JSON file.</p>
            <button className="btn btn-primary" onClick={handleExport}>
              Export Data
            </button>
          </div>
          
          <div className="section-card mt-lg">
            <h3>Import Data</h3>
            <p>Import tasks, categories, and projects from a JSON file.</p>
            <p className="text-light"><strong>Note:</strong> This will replace all your current data.</p>
            
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleImport}
            />
            
            <button className="btn btn-primary" onClick={triggerFileInput}>
              Choose File to Import
            </button>
            
            {importError && (
              <div className="error-message mt-sm">
                <p className="text-danger">{importError}</p>
              </div>
            )}
            
            {importSuccess && (
              <div className="success-message mt-sm">
                <p className="text-success">Data imported successfully!</p>
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