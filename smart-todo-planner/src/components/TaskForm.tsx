import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useToastStore } from '../hooks/useToast';
import SubtaskList from './SubtaskList';
import type { Task, Priority, Status, Recurrence } from '../types';
import { getAllCategories } from '../utils/helpers';

interface Props {
  task?: Task | null;
  onClose: () => void;
}

export default function TaskForm({ task, onClose }: Props) {
  const addTask = useStore(s => s.addTask);
  const updateTask = useStore(s => s.updateTask);
  const tasks = useStore(s => s.tasks);
  const addToast = useToastStore(s => s.addToast);
  const categories = getAllCategories(tasks);

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate || '',
    dueTime: task?.dueTime || '',
    priority: task?.priority || 'medium' as Priority,
    status: task?.status || 'not_started' as Status,
    category: task?.category || '',
    tags: task?.tags?.join(', ') || '',
    estimatedTime: task?.estimatedTime?.toString() || '',
    actualTime: task?.actualTime?.toString() || '',
    notes: task?.notes || '',
    recurrence: task?.recurrence || 'none' as Recurrence,
    reminderEnabled: task?.reminderEnabled || false,
    reminderDatetime: task?.reminderDatetime ? task.reminderDatetime.slice(0, 16) : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const data: Partial<Task> = {
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || null,
      dueTime: form.dueTime || null,
      priority: form.priority,
      status: form.status,
      category: form.category.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      estimatedTime: form.estimatedTime ? Number(form.estimatedTime) : null,
      actualTime: form.actualTime ? Number(form.actualTime) : null,
      notes: form.notes.trim(),
      recurrence: form.recurrence,
      reminderEnabled: form.reminderEnabled,
      reminderDatetime: form.reminderDatetime ? new Date(form.reminderDatetime).toISOString() : null,
    };

    if (task) {
      updateTask(task.id, data);
      addToast('Task updated');
    } else {
      addTask(data);
      addToast('Task created');
    }
    onClose();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const inputClass = 'w-full text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors';
  const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              autoFocus
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="What needs to be done?"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Add more details..."
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Due Time</label>
              <input type="time" value={form.dueTime} onChange={e => setForm(f => ({ ...f, dueTime: e.target.value }))} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))} className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))} className={inputClass}>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="deferred">Deferred</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <input
                list="categories"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="e.g., Work, Personal"
                className={inputClass}
              />
              <datalist id="categories">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Tags (comma separated)</label>
              <input
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="e.g., bug, frontend"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Est. Time (min)</label>
              <input type="number" min="0" value={form.estimatedTime} onChange={e => setForm(f => ({ ...f, estimatedTime: e.target.value }))} className={inputClass} placeholder="e.g., 60" />
            </div>
            <div>
              <label className={labelClass}>Actual Time (min)</label>
              <input type="number" min="0" value={form.actualTime} onChange={e => setForm(f => ({ ...f, actualTime: e.target.value }))} className={inputClass} placeholder="e.g., 45" />
            </div>
            <div>
              <label className={labelClass}>Recurrence</label>
              <select value={form.recurrence} onChange={e => setForm(f => ({ ...f, recurrence: e.target.value as Recurrence }))} className={inputClass}>
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputClass} placeholder="Additional notes..." />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.reminderEnabled} onChange={e => setForm(f => ({ ...f, reminderEnabled: e.target.checked }))} className="rounded border-gray-300 dark:border-gray-600 text-primary-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable reminder</span>
            </label>
            {form.reminderEnabled && (
              <input type="datetime-local" value={form.reminderDatetime} onChange={e => setForm(f => ({ ...f, reminderDatetime: e.target.value }))} className={`${inputClass} w-auto`} />
            )}
          </div>

          {task && (
            <div>
              <label className={labelClass}>Subtasks</label>
              <SubtaskList taskId={task.id} subtasks={task.subtasks} />
            </div>
          )}
        </form>

        <div className="flex gap-3 justify-end p-5 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!form.title.trim()} className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 transition-colors">
            {task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
