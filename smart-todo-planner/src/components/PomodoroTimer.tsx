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
  const progress = pomodoro.sessionType === 'work'
    ? 1 - pomodoro.timeRemaining / (pomodoro.workDuration * 60)
    : 1 - pomodoro.timeRemaining / (pomodoro.breakDuration * 60);

  const canStart = !!(pomodoro.taskId || focusTaskId);

  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Pomodoro</h3>
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
          pomodoro.sessionType === 'work'
            ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
        }`}>
          {pomodoro.sessionType === 'work' ? 'Focus' : 'Break'}
        </span>
      </div>

      <div className="text-center">
        {/* Timer ring */}
        <div className="relative w-32 h-32 mx-auto mb-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-100 dark:text-gray-700" />
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="4" strokeLinecap="round"
              className={pomodoro.sessionType === 'work' ? 'text-primary-500' : 'text-emerald-500'}
              stroke="currentColor"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress)}`}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-mono font-bold text-gray-900 dark:text-white tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {task && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate max-w-[180px] mx-auto">{task.title}</p>}
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-4">{pomodoro.sessionsCompleted} session{pomodoro.sessionsCompleted !== 1 ? 's' : ''} completed</p>

        <div className="flex items-center justify-center gap-2">
          {pomodoro.isRunning ? (
            <button onClick={stopPomodoro} className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 transition-colors">
              Pause
            </button>
          ) : (
            <button
              onClick={() => {
                const tid = pomodoro.taskId || focusTaskId;
                if (tid) startPomodoro(tid);
              }}
              disabled={!canStart}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:opacity-30 transition-colors"
            >
              {pomodoro.timeRemaining < pomodoro.workDuration * 60 ? 'Resume' : 'Start'}
            </button>
          )}
          <button onClick={resetPomodoro} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
            Reset
          </button>
        </div>

        {!canStart && !pomodoro.isRunning && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3">Select a task in Focus Mode to start</p>
        )}
      </div>
    </div>
  );
}
