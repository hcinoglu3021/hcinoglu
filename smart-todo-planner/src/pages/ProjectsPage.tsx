import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import TaskList from '../components/TaskList';
import { getAllCategories } from '../utils/helpers';

export default function ProjectsPage() {
  const tasks = useStore(s => s.tasks);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => getAllCategories(tasks), [tasks]);
  const activeTasks = useMemo(() => tasks.filter(t => !t.archived), [tasks]);

  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const catTasks = activeTasks.filter(t => t.category === cat);
      const completed = catTasks.filter(t => t.status === 'completed').length;
      return { name: cat, total: catTasks.length, completed, tasks: catTasks };
    });
  }, [categories, activeTasks]);

  const uncategorized = useMemo(() => activeTasks.filter(t => !t.category), [activeTasks]);

  const displayTasks = selectedCategory
    ? activeTasks.filter(t => t.category === selectedCategory)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects / Categories</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{categories.length} categories</p>
      </div>

      {selectedCategory !== null ? (
        <div>
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-4 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to all projects
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{selectedCategory || 'Uncategorized'}</h2>
          <TaskList tasks={displayTasks!} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map(cat => {
            const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-left hover:shadow-md transition-all"
              >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{cat.name}</h3>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{cat.total} tasks</span>
                  <span className="text-xs text-green-600 dark:text-green-400">{cat.completed} done</span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 mt-1 block">{pct}% complete</span>
              </button>
            );
          })}

          {uncategorized.length > 0 && (
            <button
              onClick={() => setSelectedCategory('')}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-left hover:shadow-md transition-all border-dashed"
            >
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Uncategorized</h3>
              <span className="text-xs text-gray-400">{uncategorized.length} tasks</span>
            </button>
          )}

          {categories.length === 0 && uncategorized.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No projects yet. Assign categories to your tasks to see them here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
