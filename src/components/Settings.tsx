import React, { useState, useEffect } from 'react';
import { checkApiKeyStatus } from '../utils/groqService';
import '../styles/settings.css';

interface SettingsProps {
  // Add any props needed later
}

const Settings: React.FC<SettingsProps> = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<{ available: boolean; mode: string } | null>(null);
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    // Check current API key status
    const status = checkApiKeyStatus();
    setApiKeyStatus(status);
    
    // Try to load saved API key from localStorage
    const savedKey = localStorage.getItem('user_groq_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('user_groq_api_key', apiKey.trim());
      setTestResult('API key saved! Test it below to verify it works.');
    } else {
      localStorage.removeItem('user_groq_api_key');
      setTestResult('API key removed.');
    }
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setTestResult('Please enter an API key first.');
      return;
    }

    setTestingKey(true);
    setTestResult(null);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTestResult('✅ API key is valid and working!');
      } else {
        setTestResult('❌ API key is invalid or expired.');
      }
    } catch (error) {
      setTestResult('❌ Failed to test API key. Check your internet connection.');
    } finally {
      setTestingKey(false);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="settings-container">
      <h2 className="section-title">Settings</h2>
      
      {/* AI Configuration Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">AI Task Breakdown</h3>
        <p className="settings-description">
          Configure your Groq API key to enable AI-powered task breakdown. You can get a free API key from{' '}
          <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">
            Groq Console
          </a>.
        </p>
        
        <div className="api-key-form">
          <div className="form-group">
            <label htmlFor="groq-api-key">Groq API Key:</label>
            <input
              id="groq-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Groq API key (gsk_...)"
              className="form-control"
            />
          </div>
          
          <div className="api-key-actions">
            <button 
              className="btn btn-primary"
              onClick={handleSaveApiKey}
            >
              Save API Key
            </button>
            <button 
              className="btn btn-outline"
              onClick={handleTestApiKey}
              disabled={testingKey || !apiKey.trim()}
            >
              {testingKey ? 'Testing...' : 'Test API Key'}
            </button>
          </div>
          
          {testResult && (
            <div className={`test-result ${testResult.includes('✅') ? 'success' : 'error'}`}>
              {testResult}
            </div>
          )}
        </div>
        
        {apiKeyStatus && (
          <div className="api-status">
            <h4>Current Status:</h4>
            <p>Environment: {apiKeyStatus.mode}</p>
            <p>API Key Available: {apiKeyStatus.available ? '✅ Yes' : '❌ No'}</p>
            {!apiKeyStatus.available && (
              <p className="status-note">
                AI task breakdown will use fallback suggestions until a valid API key is configured.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Data Management Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">Data Management</h3>
        <p className="settings-description">
          Manage your task data and application settings.
        </p>
        
        <div className="data-actions">
          <button 
            className="btn btn-danger"
            onClick={handleClearData}
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">About</h3>
        <p className="settings-description">
          Task Manager with AI-powered task breakdown and smart organization features.
        </p>
        <div className="about-info">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Features:</strong> Task management, AI breakdown, calendar sync, time tracking</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;