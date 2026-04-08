import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import TaskList from '../components/TaskList';
import { getAllCategories } from '../utils/helpers';

export default function ProjectsPage() {
  const tasks = useStore(s => s.tasks);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeTasks = useMemo(() => tasks.filter(t => !t.archived), [tasks]);
  const categories = useMemo(() => getAllCategories(tasks), [tasks]);

  const categoryStats = useMemo(() =>
    categories.map(cat => {
      const catTasks = activeTasks.filter(t => t.category === cat);
      const completed = catTasks.filter(t => t.status === 'completed').length;
      return { name: cat, total: catTasks.length, completed, tasks: catTasks };
    }),
  [categories, activeTasks]);

  const uncategorized = useMemo(() => activeTasks.filter(t => !t.category), [activeTasks]);

  const displayTasks = selectedCategory !== null
    ? (selectedCategory === '' ? uncategorized : activeTasks.filter(t => t.category === selectedCategory))
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Projects</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{categories.length} categories</p>
      </div>

      {selectedCategory !== null ? (
        <div>
          <button onClick={() => setSelectedCategory(null)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-4 flex items-center gap-1 font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            All projects
          </button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{selectedCategory || 'Uncategorized'}</h2>
          <TaskList tasks={displayTasks!} emptyTitle="No tasks in this project" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryStats.map(cat => {
            const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 p-4 text-left hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none"
              >
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">{cat.name}</h3>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mb-2.5">
                  <span>{cat.total} tasks</span>
                  <span className="text-gray-300 dark:text-gray-600">&middot;</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{cat.completed} done</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700/80 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">{pct}%</span>
              </button>
            );
          })}

          {uncategorized.length > 0 && (
            <button onClick={() => setSelectedCategory('')} className="bg-white dark:bg-gray-800/80 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4 text-left hover:border-gray-400 dark:hover:border-gray-500 transition-all">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">Uncategorized</h3>
              <span className="text-[11px] text-gray-400">{uncategorized.length} tasks</span>
            </button>
          )}

          {categories.length === 0 && uncategorized.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">Assign categories to your tasks to see them here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
