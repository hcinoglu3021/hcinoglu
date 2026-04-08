import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useToastStore } from '../hooks/useToast';
import PomodoroTimer from '../components/PomodoroTimer';
import SubtaskList from '../components/SubtaskList';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatTime } from '../utils/dates';
import { formatMinutes, priorityOrder } from '../utils/helpers';

export default function FocusPage() {
  const tasks = useStore(s => s.tasks);
  const focusTaskId = useStore(s => s.focusModeTaskId);
  const setFocusTaskId = useStore(s => s.setFocusModeTaskId);
  const toggleComplete = useStore(s => s.toggleTaskComplete);
  const addToast = useToastStore(s => s.addToast);

  const priorityTasks = useMemo(() =>
    tasks
      .filter(t => !t.archived && t.status !== 'completed')
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 15),
  [tasks]);

  const focusTask = focusTaskId ? tasks.find(t => t.id === focusTaskId) : null;

  // Auto-clear if task no longer exists
  if (focusTaskId && !focusTask) {
    setFocusTaskId(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Focus Mode</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {focusTask ? 'Working on a task' : 'Select a task to focus on'}
        </p>
      </div>

      {focusTask ? (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Task detail */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800/80 rounded-xl border-2 border-primary-300 dark:border-primary-600/40 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug pr-4">{focusTask.title}</h2>
                <button onClick={() => setFocusTaskId(null)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium shrink-0 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Exit focus
                </button>
              </div>

              {focusTask.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{focusTask.description}</p>
              )}

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <PriorityBadge priority={focusTask.priority} />
                <StatusBadge status={focusTask.status} />
                {focusTask.dueDate && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Due: {formatDate(focusTask.dueDate)}{focusTask.dueTime ? ` at ${formatTime(focusTask.dueTime)}` : ''}
                  </span>
                )}
              </div>

              <div className="flex gap-6 text-xs text-gray-500 dark:text-gray-400 mb-4">
                {focusTask.estimatedTime && <span>Estimated: {formatMinutes(focusTask.estimatedTime)}</span>}
                {focusTask.actualTime !== null && focusTask.actualTime > 0 && <span>Tracked: {formatMinutes(focusTask.actualTime)}</span>}
              </div>

              {focusTask.subtasks.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Subtasks</h3>
                  <SubtaskList taskId={focusTask.id} subtasks={focusTask.subtasks} />
                </div>
              )}

              {focusTask.notes && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/50 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {focusTask.notes}
                </div>
              )}

              <button
                onClick={() => { toggleComplete(focusTask.id); addToast('Task completed!'); setFocusTaskId(null); }}
                className="w-full py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 transition-colors"
              >
                Mark as Complete
              </button>
            </div>
          </div>

          {/* Pomodoro */}
          <div className="lg:col-span-2">
            <PomodoroTimer />
          </div>
        </div>
      ) : (
        <div>
          {priorityTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
              </div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No tasks to focus on</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Create some tasks first.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {priorityTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => setFocusTaskId(task.id)}
                  className="w-full bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 p-3.5 text-left hover:border-primary-300 dark:hover:border-primary-600/40 hover:shadow-md transition-all flex items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none"
                >
                  <PriorityBadge priority={task.priority} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 truncate">{task.title}</span>
                  {task.dueDate && <span className="text-[11px] text-gray-400 shrink-0">{formatDate(task.dueDate)}</span>}
                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
