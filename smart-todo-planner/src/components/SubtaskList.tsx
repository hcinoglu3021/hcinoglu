import { useState } from 'react';
import type { Subtask } from '../types';
import { useStore } from '../store/useStore';

interface Props {
  taskId: string;
  subtasks: Subtask[];
  compact?: boolean;
}

export default function SubtaskList({ taskId, subtasks, compact }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const addSubtask = useStore(s => s.addSubtask);
  const toggleSubtask = useStore(s => s.toggleSubtask);
  const updateSubtask = useStore(s => s.updateSubtask);
  const deleteSubtask = useStore(s => s.deleteSubtask);

  const completed = subtasks.filter(s => s.completed).length;
  const total = subtasks.length;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addSubtask(taskId, newTitle.trim());
    setNewTitle('');
  };

  const startEdit = (st: Subtask) => {
    setEditingId(st.id);
    setEditTitle(st.title);
  };

  const saveEdit = (subtaskId: string) => {
    if (editTitle.trim()) {
      updateSubtask(taskId, subtaskId, editTitle.trim());
    }
    setEditingId(null);
  };

  if (compact && total === 0) return null;

  return (
    <div className="space-y-1">
      {total > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${total === 0 ? 0 : (completed / total) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{completed}/{total}</span>
        </div>
      )}
      {subtasks.map(st => (
        <div key={st.id} className="flex items-center gap-2 group">
          <button
            onClick={() => toggleSubtask(taskId, st.id)}
            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
              st.completed
                ? 'bg-primary-500 border-primary-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            }`}
          >
            {st.completed && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            )}
          </button>
          {editingId === st.id ? (
            <input
              autoFocus
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={() => saveEdit(st.id)}
              onKeyDown={e => { if (e.key === 'Enter') saveEdit(st.id); if (e.key === 'Escape') setEditingId(null); }}
              className="flex-1 text-sm bg-transparent border-b border-primary-400 outline-none py-0.5 text-gray-900 dark:text-white"
            />
          ) : (
            <span
              onClick={() => !compact && startEdit(st)}
              className={`flex-1 text-sm cursor-pointer ${st.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}
            >
              {st.title}
            </span>
          )}
          {!compact && (
            <button
              onClick={() => deleteSubtask(taskId, st.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      ))}
      {!compact && (
        <div className="flex items-center gap-2 mt-2">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="Add subtask..."
            className="flex-1 text-sm bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none py-1 text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button
            onClick={handleAdd}
            disabled={!newTitle.trim()}
            className="text-primary-500 hover:text-primary-600 disabled:opacity-30 text-sm font-medium"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
