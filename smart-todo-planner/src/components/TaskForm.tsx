import { useState, useEffect, useRef } from 'react';
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
  const titleRef = useRef<HTMLInputElement>(null);

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

  const set = (key: string, val: string | boolean) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
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
    if (task) { updateTask(task.id, data); addToast('Task updated'); }
    else { addTask(data); addToast('Task created'); }
    onClose();
  };

  useEffect(() => {
    titleRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const inp = 'w-full text-sm bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700/60 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30 transition-all placeholder-gray-400 dark:placeholder-gray-500';
  const lbl = 'block text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[8vh] sm:pt-[12vh] overflow-y-auto animate-fade-in" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl animate-slide-up border border-gray-200/50 dark:border-gray-700/40"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 id="task-form-title" className="text-base font-bold text-gray-900 dark:text-white">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-2 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <input ref={titleRef} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title" className={`${inp} !text-base font-medium !border-0 !bg-transparent !px-0 !ring-0`} required />

          {/* Description */}
          <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Add description..." rows={2} className={`${inp} resize-none`} />

          {/* Priority + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className={inp}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className={inp}>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="deferred">Deferred</option>
              </select>
            </div>
          </div>

          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className={inp} />
            </div>
            <div>
              <label className={lbl}>Due Time</label>
              <input type="time" value={form.dueTime} onChange={e => set('dueTime', e.target.value)} className={inp} />
            </div>
          </div>

          {/* Category + Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Category</label>
              <input list="categories" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Work" className={inp} />
              <datalist id="categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label className={lbl}>Tags</label>
              <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="comma separated" className={inp} />
            </div>
          </div>

          {/* Time + Recurrence */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={lbl}>Est. Time (min)</label>
              <input type="number" min="0" value={form.estimatedTime} onChange={e => set('estimatedTime', e.target.value)} className={inp} placeholder="60" />
            </div>
            <div>
              <label className={lbl}>Actual (min)</label>
              <input type="number" min="0" value={form.actualTime} onChange={e => set('actualTime', e.target.value)} className={inp} placeholder="45" />
            </div>
            <div>
              <label className={lbl}>Recurrence</label>
              <select value={form.recurrence} onChange={e => set('recurrence', e.target.value)} className={inp}>
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={lbl}>Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={`${inp} resize-none`} placeholder="Additional notes..." />
          </div>

          {/* Reminder */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.reminderEnabled} onChange={e => set('reminderEnabled', e.target.checked)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Reminder</span>
            </label>
            {form.reminderEnabled && (
              <input type="datetime-local" value={form.reminderDatetime} onChange={e => set('reminderDatetime', e.target.value)} className={`${inp} !w-auto text-xs`} />
            )}
          </div>

          {/* Subtasks (edit mode only) */}
          {task && task.subtasks.length > 0 && (
            <div>
              <label className={lbl}>Subtasks</label>
              <SubtaskList taskId={task.id} subtasks={task.subtasks} />
            </div>
          )}
          {task && task.subtasks.length === 0 && (
            <div>
              <label className={lbl}>Subtasks</label>
              <SubtaskList taskId={task.id} subtasks={task.subtasks} />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100 dark:border-gray-700/50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button onClick={() => handleSubmit()} disabled={!form.title.trim()} className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:opacity-40 transition-colors">
            {task ? 'Save' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
