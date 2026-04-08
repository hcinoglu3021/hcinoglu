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
  const [showActions, setShowActions] = useState(false);
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
  const isComplete = task.status === 'completed';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleComplete(task.id);
    addToast(isComplete ? 'Task reopened' : 'Task completed');
  };

  const handleDelete = () => {
    deleteTask(task.id);
    addToast('Task deleted');
    setShowConfirm(false);
  };

  return (
    <>
      <div
        className={`group relative bg-white dark:bg-gray-800/80 rounded-xl border-l-[3px] ${priorityBorderColors[task.priority]} ${
          isSelected ? 'ring-2 ring-primary-400/50 dark:ring-primary-500/30' : ''
        } ${overdue && !isComplete ? 'bg-red-50/40 dark:bg-red-950/10' : ''} border border-l-[3px] border-gray-200/80 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-none transition-all duration-150`}
      >
        <div className={`p-3.5 ${compact ? 'py-3' : ''}`}>
          <div className="flex items-start gap-3">
            {selectable && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelection(task.id)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 shrink-0"
                aria-label={`Select ${task.title}`}
              />
            )}

            {/* Completion toggle */}
            <button
              onClick={handleToggle}
              aria-label={isComplete ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
              className={`mt-0.5 w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-150 ${
                isComplete
                  ? 'bg-green-500 border-green-500 text-white scale-100'
                  : overdue
                  ? 'border-red-400 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30'
              }`}
            >
              {isComplete && (
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-medium leading-snug line-clamp-2 ${isComplete ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                  {task.title}
                </h3>
                {task.recurrence !== 'none' && (
                  <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                )}
              </div>

              {!compact && task.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <PriorityBadge priority={task.priority} />
                <CategoryBadge category={task.category} />
                {task.dueDate && (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                    overdue && !isComplete
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {formatDate(task.dueDate)}{task.dueTime ? `, ${formatTime(task.dueTime)}` : ''}
                  </span>
                )}
                {task.estimatedTime && !compact && (
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">~{formatMinutes(task.estimatedTime)}</span>
                )}
                {subtaskProgress.total > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" /></svg>
                    {subtaskProgress.completed}/{subtaskProgress.total}
                  </span>
                )}
                {task.tags.length > 0 && !compact && (
                  <>
                    {task.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[11px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/80 text-gray-500 dark:text-gray-400">#{tag}</span>
                    ))}
                    {task.tags.length > 2 && (
                      <span className="text-[11px] text-gray-400">+{task.tags.length - 2}</span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="relative shrink-0">
              <button
                onClick={e => { e.stopPropagation(); setShowActions(!showActions); }}
                className="p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                aria-label="Task actions"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
              </button>

              {showActions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 w-40 animate-slide-up">
                    {onEdit && (
                      <button onClick={() => { setShowActions(false); onEdit(task); }} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit
                      </button>
                    )}
                    <button onClick={() => { setShowActions(false); duplicateTask(task.id); addToast('Task duplicated'); }} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Duplicate
                    </button>
                    <button onClick={() => { setShowActions(false); archiveTask(task.id); addToast('Task archived'); }} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                      Archive
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                    <button onClick={() => { setShowActions(false); setShowConfirm(true); }} className="w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Expanded details */}
          {expanded && (
            <div className="mt-3 ml-[30px] space-y-3 animate-slide-up">
              {task.notes && (
                <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/60 rounded-lg p-3 border border-gray-100 dark:border-gray-700/50">
                  {task.notes}
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
        message={`Delete "${task.title}"? This will also remove all subtasks and cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        variant="danger"
      />
    </>
  );
}
