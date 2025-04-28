import { useState } from 'react';

type MoreOptionsMenuProps = {
  onManageCategories: () => void;
  onImportExport: () => void;
  onLoadSample: () => void;
  onResetData: () => void;
};

const MoreOptionsMenu = ({ 
  onManageCategories, 
  onImportExport, 
  onLoadSample, 
  onResetData 
}: MoreOptionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  return (
    <div className="dropdown-container">
      <button 
        className="btn btn-outline dropdown-toggle"
        onClick={toggleMenu}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        More Options
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => { onManageCategories(); toggleMenu(); }}>
            Manage Categories
          </button>
          <button className="dropdown-item" onClick={() => { onImportExport(); toggleMenu(); }}>
            Import/Export
          </button>
          <button className="dropdown-item" onClick={() => { onLoadSample(); toggleMenu(); }}>
            Load Sample Data
          </button>
          <button className="dropdown-item danger" onClick={() => { onResetData(); toggleMenu(); }}>
            Reset Data
          </button>
        </div>
      )}
    </div>
  );
};

export default MoreOptionsMenu;