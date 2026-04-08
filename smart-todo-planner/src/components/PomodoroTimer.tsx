import { usePomodoro } from '../hooks/usePomodoro';
import { useStore } from '../store/useStore';

export default function PomodoroTimer() {
  const pomodoro = usePomodoro();
  const tasks = useStore(s => s.tasks);
  const startPomodoro = useStore(s => s.startPomodoro);
  const stopPomodoro = useStore(s => s.stopPomodoro);
  const resetPomodoro = useStore(s => s.resetPomodoro);
  const focusTaskId = useStore(s => s.focusModeTaskId);

  const task = tasks.find(t => t.id === (pomodoro.taskId || focusTaskId));
  const minutes = Math.floor(pomodoro.timeRemaining / 60);
  const seconds = pomodoro.timeRemaining % 60;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pomodoro Timer</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          pomodoro.sessionType === 'work'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
            : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
        }`}>
          {pomodoro.sessionType === 'work' ? 'Focus' : 'Break'}
        </span>
      </div>

      <div className="text-center">
        <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-1">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        {task && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">{task.title}</p>}
        <p className="text-xs text-gray-400 mb-3">Sessions: {pomodoro.sessionsCompleted}</p>

        <div className="flex items-center justify-center gap-2">
          {pomodoro.isRunning ? (
            <button onClick={stopPomodoro} className="px-4 py-2 text-sm font-medium rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">
              Pause
            </button>
          ) : (
            <button
              onClick={() => {
                const tid = pomodoro.taskId || focusTaskId;
                if (tid) startPomodoro(tid);
              }}
              disabled={!pomodoro.taskId && !focusTaskId}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 transition-colors"
            >
              {pomodoro.timeRemaining < pomodoro.workDuration * 60 ? 'Resume' : 'Start'}
            </button>
          )}
          <button onClick={resetPomodoro} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
