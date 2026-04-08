import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useToastStore } from '../hooks/useToast';
import ConfirmDialog from './ConfirmDialog';

export default function BulkActions() {
  const [showConfirm, setShowConfirm] = useState(false);
  const selectedIds = useStore(s => s.selectedTaskIds);
  const clearSelection = useStore(s => s.clearSelection);
  const deleteTasks = useStore(s => s.deleteTasks);
  const archiveTasks = useStore(s => s.archiveTasks);
  const addToast = useToastStore(s => s.addToast);

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl p-3 flex items-center justify-between">
        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
          {selectedIds.length} task{selectedIds.length > 1 ? 's' : ''} selected
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { archiveTasks(selectedIds); addToast(`${selectedIds.length} tasks archived`); }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Archive
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
          >
            Delete
          </button>
          <button onClick={clearSelection} className="px-3 py-1.5 text-xs font-medium rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            Cancel
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Delete Tasks"
        message={`Are you sure you want to delete ${selectedIds.length} task${selectedIds.length > 1 ? 's' : ''}? This cannot be undone.`}
        confirmLabel="Delete All"
        onConfirm={() => { deleteTasks(selectedIds); addToast(`${selectedIds.length} tasks deleted`); setShowConfirm(false); }}
        onCancel={() => setShowConfirm(false)}
        variant="danger"
      />
    </>
  );
}
