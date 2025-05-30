import React, { useState, useEffect } from 'react';
import { ENV } from '../utils/env';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load existing API key from localStorage
    const storedKey = localStorage.getItem('GROQ_API_KEY');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Ensure the key is trimmed and not empty
      const trimmedKey = apiKey.trim();
      if (!trimmedKey) {
        throw new Error('API key cannot be empty');
      }
      
      // Save API key to localStorage
      localStorage.setItem('GROQ_API_KEY', trimmedKey);
      
      // Verify it was saved correctly
      const savedKey = localStorage.getItem('GROQ_API_KEY');
      if (savedKey !== trimmedKey) {
        throw new Error('Failed to save API key correctly');
      }
      
      console.log('API key saved successfully. Length:', savedKey.length);
      setSaveStatus('success');
      
      // Optional reload - user can close modal and it will work immediately
      setTimeout(() => {
        if (window.confirm('API key saved! Reload page to ensure all components use the new key?')) {
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      console.error('Error saving API key:', error);
      setSaveStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              Groq API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Enter your Groq API key"
            />
            <p className="mt-1 text-sm text-gray-500">
              Get your API key from{' '}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark"
              >
                console.groq.com
              </a>
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {saveStatus === 'success' && (
            <p className="text-sm text-success">Settings saved successfully!</p>
          )}
          {saveStatus === 'error' && (
            <p className="text-sm text-danger">Error saving settings. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 