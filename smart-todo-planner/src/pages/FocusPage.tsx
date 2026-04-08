import { useMemo } from 'react';
import { useStore } from '../store/useStore';
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

  const priorityTasks = useMemo(() =>
    tasks
      .filter(t => !t.archived && t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high'))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 10),
  [tasks]);

  const focusTask = focusTaskId ? tasks.find(t => t.id === focusTaskId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Focus Mode</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select a task to focus on with the Pomodoro timer</p>
      </div>

      {focusTask ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-primary-400 dark:border-primary-600 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{focusTask.title}</h2>
                <button
                  onClick={() => setFocusTaskId(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  Exit focus
                </button>
              </div>

              {focusTask.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{focusTask.description}</p>
              )}

              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <PriorityBadge priority={focusTask.priority} />
                <StatusBadge status={focusTask.status} />
                {focusTask.dueDate && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Due: {formatDate(focusTask.dueDate)} {focusTask.dueTime && `at ${formatTime(focusTask.dueTime)}`}
                  </span>
                )}
              </div>

              {focusTask.estimatedTime && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Estimated: {formatMinutes(focusTask.estimatedTime)}</p>
              )}
              {focusTask.actualTime !== null && focusTask.actualTime > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Time spent: {formatMinutes(focusTask.actualTime)}</p>
              )}

              {focusTask.subtasks.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtasks</h3>
                  <SubtaskList taskId={focusTask.id} subtasks={focusTask.subtasks} />
                </div>
              )}

              {focusTask.notes && (
                <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Notes:</span> {focusTask.notes}
                </div>
              )}

              <button
                onClick={() => toggleComplete(focusTask.id)}
                className="mt-4 w-full py-2.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Mark as Complete
              </button>
            </div>
          </div>

          <PomodoroTimer />
        </div>
      ) : (
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Select a task to focus on</h2>
          {priorityTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No high-priority tasks available</div>
          ) : (
            <div className="space-y-2">
              {priorityTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => setFocusTaskId(task.id)}
                  className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-left hover:border-primary-400 hover:shadow-md transition-all flex items-center gap-3"
                >
                  <PriorityBadge priority={task.priority} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{task.title}</span>
                  {task.dueDate && <span className="text-xs text-gray-400">{formatDate(task.dueDate)}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
