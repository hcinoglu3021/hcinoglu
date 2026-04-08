import { useStore } from '../store/useStore';
import { generateSampleTasks } from '../data/sampleTasks';
import { useToastStore } from '../hooks/useToast';

export default function Onboarding() {
  const setOnboardingDone = useStore(s => s.setOnboardingDone);
  const importTasks = useStore(s => s.importTasks);
  const addToast = useToastStore(s => s.addToast);

  const handleLoadSamples = () => {
    importTasks(generateSampleTasks());
    setOnboardingDone();
    addToast('Sample tasks loaded! Explore the app.', 'info');
  };

  const handleSkip = () => {
    setOnboardingDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Welcome to Smart Todo Planner
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
          Your personal productivity command center. Capture tasks, organize by priority, and track your progress.
        </p>

        <div className="space-y-3 mb-8">
          {[
            { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', title: 'Dashboard', desc: 'Overview of your tasks, stats, and daily planning' },
            { icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2', title: 'Kanban Board', desc: 'Drag tasks between status columns' },
            { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Pomodoro Timer', desc: 'Focus on tasks with timed work sessions' },
            { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', title: 'Calendar & Views', desc: 'See tasks by day, week, priority, or project' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              <svg className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={handleSkip} className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Start Empty
          </button>
          <button onClick={handleLoadSamples} className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors">
            Load Sample Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
