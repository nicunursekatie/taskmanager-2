import React from 'react';

interface MoreOptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

const MoreOptionsMenu: React.FC<MoreOptionsMenuProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onArchive
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col gap-sm">
          <button onClick={onEdit} className="btn btn-outline">
            Edit
          </button>
          <button onClick={onArchive} className="btn btn-outline">
            Archive
          </button>
          <button onClick={onDelete} className="btn btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoreOptionsMenu;