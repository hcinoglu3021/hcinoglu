import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useToastStore } from '../hooks/useToast';
import type { Priority } from '../types';

export default function QuickAddBar() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useStore(s => s.addTask);
  const addToast = useToastStore(s => s.addToast);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      priority,
      category: category || undefined,
      dueDate: dueDate || null,
    });
    setTitle('');
    setCategory('');
    setDueDate('');
    setPriority('medium');
    addToast('Task created');
    inputRef.current?.focus();
  };

  // Keyboard shortcut: focus quick add on "n"
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'SELECT') {
        e.preventDefault();
        inputRef.current?.focus();
        setExpanded(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
      <div className="flex items-center gap-3 px-4 py-3">
        <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        <input
          ref={inputRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="Add a task..."
          className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          aria-label="New task title"
        />
        {title.trim() && (
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors shrink-0"
          >
            Add
          </button>
        )}
      </div>
      {expanded && (
        <div className="px-4 pb-3 pt-0 flex items-center gap-2 flex-wrap">
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
            aria-label="Priority"
            className="text-xs bg-gray-100 dark:bg-gray-700/80 border-0 rounded-lg px-2.5 py-1.5 text-gray-600 dark:text-gray-300 outline-none font-medium"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            aria-label="Due date"
            className="text-xs bg-gray-100 dark:bg-gray-700/80 border-0 rounded-lg px-2.5 py-1.5 text-gray-600 dark:text-gray-300 outline-none font-medium"
          />
          <input
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Category"
            aria-label="Category"
            className="text-xs bg-gray-100 dark:bg-gray-700/80 border-0 rounded-lg px-2.5 py-1.5 text-gray-600 dark:text-gray-300 outline-none font-medium w-24 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto hidden sm:inline">Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">n</kbd> to quick add</span>
        </div>
      )}
    </form>
  );
}
