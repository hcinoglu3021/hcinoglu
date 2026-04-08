import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useToastStore } from '../hooks/useToast';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';
import SubtaskList from './SubtaskList';
import ConfirmDialog from './ConfirmDialog';
import { formatDate, formatTime, isOverdue } from '../utils/dates';
import { getSubtaskProgress, formatMinutes, priorityBorderColors } from '../utils/helpers';
import type { Task } from '../types';

interface Props {
  task: Task;
  compact?: boolean;
  selectable?: boolean;
  onEdit?: (task: Task) => void;
}

export default function TaskCard({ task, compact, selectable, onEdit }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const toggleComplete = useStore(s => s.toggleTaskComplete);
  const deleteTask = useStore(s => s.deleteTask);
  const duplicateTask = useStore(s => s.duplicateTask);
  const archiveTask = useStore(s => s.archiveTask);
  const selectedIds = useStore(s => s.selectedTaskIds);
  const toggleSelection = useStore(s => s.toggleTaskSelection);
  const addToast = useToastStore(s => s.addToast);

  const overdue = isOverdue(task.dueDate, task.status);
  const subtaskProgress = getSubtaskProgress(task.subtasks);
  const isSelected = selectedIds.includes(task.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleComplete(task.id);
    addToast(task.status === 'completed' ? 'Task marked incomplete' : 'Task completed');
  };

  const handleDelete = () => {
    deleteTask(task.id);
    addToast('Task deleted');
    setShowConfirm(false);
  };

  return (
    <>
      <div
        className={`group bg-white dark:bg-gray-800 rounded-xl border border-l-4 ${priorityBorderColors[task.priority]} ${
          isSelected ? 'border-primary-400 ring-2 ring-primary-200 dark:ring-primary-800' : 'border-gray-200 dark:border-gray-700'
        } ${overdue ? 'bg-red-50/50 dark:bg-red-950/20' : ''} shadow-sm hover:shadow-md transition-all cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {selectable && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelection(task.id)}
                onClick={e => e.stopPropagation()}
                className="mt-1 rounded border-gray-300 dark:border-gray-600 text-primary-600"
              />
            )}
            <button
              onClick={handleToggle}
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                task.status === 'completed'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
              }`}
            >
              {task.status === 'completed' && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                  {task.title}
                </h3>
                {task.recurrence !== 'none' && (
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                )}
              </div>

              {!compact && task.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
              )}

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <PriorityBadge priority={task.priority} />
                <CategoryBadge category={task.category} />
                {task.dueDate && (
                  <span className={`text-xs font-medium ${overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {overdue && '⚠ '}{formatDate(task.dueDate)}
                    {task.dueTime && ` at ${formatTime(task.dueTime)}`}
                  </span>
                )}
                {task.estimatedTime && (
                  <span className="text-xs text-gray-400">~{formatMinutes(task.estimatedTime)}</span>
                )}
                {subtaskProgress.total > 0 && (
                  <span className="text-xs text-gray-400">{subtaskProgress.completed}/{subtaskProgress.total} subtasks</span>
                )}
                {task.tags.length > 0 && !compact && (
                  <div className="flex gap-1">
                    {task.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {onEdit && (
                <button
                  onClick={e => { e.stopPropagation(); onEdit(task); }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
              )}
              <button
                onClick={e => { e.stopPropagation(); duplicateTask(task.id); addToast('Task duplicated'); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Duplicate"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); archiveTask(task.id); addToast('Task archived'); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Archive"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); setShowConfirm(true); }}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>

          {expanded && (
            <div className="mt-4 ml-8 space-y-3">
              {task.notes && (
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Notes:</span> {task.notes}
                </div>
              )}
              {task.subtasks.length > 0 && (
                <SubtaskList taskId={task.id} subtasks={task.subtasks} compact />
              )}
              {task.actualTime !== null && task.actualTime > 0 && (
                <p className="text-xs text-gray-400">Time spent: {formatMinutes(task.actualTime)}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This will also remove all subtasks. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        variant="danger"
      />
    </>
  );
}
