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
    addToast('Sample tasks loaded', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slide-up border border-gray-200/50 dark:border-gray-700/40">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1.5">
          Welcome to Smart Todo
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Your personal productivity command center.
        </p>

        <div className="space-y-2 mb-6">
          {[
            { icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z', title: 'Quick capture', desc: 'Press N anywhere to add tasks instantly' },
            { icon: 'M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z', title: 'Multiple views', desc: 'Kanban, calendar, priority, focus mode & more' },
            { icon: 'M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z', title: 'Track progress', desc: 'Analytics, streaks, and Pomodoro timer built in' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/30">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => setOnboardingDone()} className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors">
            Start Empty
          </button>
          <button onClick={handleLoadSamples} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm">
            Try with Samples
          </button>
        </div>
      </div>
    </div>
  );
}
