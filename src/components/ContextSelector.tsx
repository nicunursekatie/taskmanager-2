// src/components/ContextSelector.tsx
import React from 'react';
import { ContextTag } from '../types';

// Icons for different contexts
const contextIcons: Record<ContextTag, string> = {
  'phone-call': '📞',
  'errand': '🚗',
  'online': '💻',
  'home': '🏠',
  'work': '🏥',
  'anywhere': '🌍'
};

// Colors for different contexts
const contextColors: Record<ContextTag, string> = {
  'phone-call': '#F59E0B', // Amber
  'errand': '#10B981',     // Green
  'online': '#3B82F6',     // Blue
  'home': '#8B5CF6',       // Purple
  'work': '#EC4899',       // Pink
  'anywhere': '#6B7280'    // Gray
};

type ContextSelectorProps = {
  selectedContext: ContextTag | null;
  onChange: (context: ContextTag | null) => void;
};

const ContextSelector: React.FC<ContextSelectorProps> = ({ 
  selectedContext, 
  onChange 
}) => {
  // All available context tags
  const contextTags: ContextTag[] = [
    'phone-call',
    'errand',
    'online',
    'home',
    'work',
    'anywhere'
  ];
  
  // Human-readable names for contexts
  const contextNames: Record<ContextTag, string> = {
    'phone-call': 'Phone Call',
    'errand': 'Errand',
    'online': 'Online',
    'home': 'At Home',
    'work': 'At Work',
    'anywhere': 'Anywhere'
  };
  
  return (
    <div className="context-selector">
      <div className="context-options">
        {contextTags.map(context => (
          <div
            key={context}
            className={`context-option ${selectedContext === context ? 'selected' : ''}`}
            style={{
              backgroundColor: selectedContext === context 
                ? contextColors[context] 
                : 'transparent',
              borderColor: contextColors[context],
              color: selectedContext === context ? 'white' : 'inherit'
            }}
            onClick={() => onChange(context === selectedContext ? null : context)}
          >
            <span className="context-icon">{contextIcons[context]}</span>
            <span className="context-name">{contextNames[context]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextSelector;