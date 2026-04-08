import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useToastStore } from '../hooks/useToast';
import type { Priority } from '../types';

export default function QuickAddBar() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('');
  const [expanded, setExpanded] = useState(false);
  const addTask = useStore(s => s.addTask);
  const addToast = useToastStore(s => s.addToast);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title: title.trim(), priority, category: category || undefined });
    setTitle('');
    setCategory('');
    setPriority('medium');
    setExpanded(false);
    addToast('Task created');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" />
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="Add a task... (press Enter to save)"
          className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-40 transition-colors shrink-0"
        >
          Add
        </button>
      </div>
      {expanded && (
        <div className="px-3 pb-3 pt-1 flex items-center gap-3 border-t border-gray-100 dark:border-gray-700">
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
            className="text-xs bg-gray-100 dark:bg-gray-700 border-0 rounded-md px-2 py-1 text-gray-700 dark:text-gray-300 outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <input
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Category"
            className="text-xs bg-gray-100 dark:bg-gray-700 border-0 rounded-md px-2 py-1 text-gray-700 dark:text-gray-300 outline-none w-24"
          />
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-auto"
          >
            Collapse
          </button>
        </div>
      )}
    </form>
  );
}
