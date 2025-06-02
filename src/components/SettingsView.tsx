import React from 'react';
import { TabType } from '../types'; // Assuming TabType is in src/types.ts
import Settings from './Settings'; // The actual Settings component

interface SettingsViewProps {
  setActiveTab: (tab: TabType) => void;
  // Any other props that might be needed by the Settings component when rendered as a tab
  // For now, we'll assume it needs an 'isOpen' and 'onClose' similar to its modal usage.
}

const SettingsView: React.FC<SettingsViewProps> = ({
  setActiveTab,
}) => {
  const handleCloseSettingsTab = () => {
    setActiveTab('dashboard'); // Or whatever the desired default tab is after closing settings
  };

  return (
    <div className="settings-view"> {/* This class is from App.tsx */}
      {/*
        The Settings component is currently used as a modal in App.tsx (triggered by showSettings)
        and also directly rendered for the 'settings' tab.
        When rendered as a tab, it seems to be always "open" in the context of the tab,
        and closing it means navigating to another tab.
      */}
      <Settings
        isOpen={true} // When it's a tab, it's effectively always "open" within that tab.
        onClose={handleCloseSettingsTab} // "Closing" the tab view navigates away.
        // Pass any other necessary props if the main Settings component requires them
      />
    </div>
  );
};

export default SettingsView;
