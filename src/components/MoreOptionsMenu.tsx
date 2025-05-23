import React from 'react';

interface MoreOptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onManageCategories: () => void;
  onImportExport: () => void;
  onLoadSample: () => void;
  onResetData: () => void;
}

const MoreOptionsMenu: React.FC<MoreOptionsMenuProps> = ({
  isOpen,
  onClose,
  onManageCategories,
  onImportExport,
  onLoadSample,
  onResetData
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col gap-sm">
          <button onClick={() => { onManageCategories(); onClose(); }} className="btn btn-outline">
            Manage Categories
          </button>
          <button onClick={() => { onImportExport(); onClose(); }} className="btn btn-outline">
            Import/Export Data
          </button>
          <button onClick={() => { onLoadSample(); onClose(); }} className="btn btn-outline">
            Load Sample Data
          </button>
          <button onClick={() => { onResetData(); onClose(); }} className="btn btn-danger">
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoreOptionsMenu;