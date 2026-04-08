import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import TaskList from '../components/TaskList';
import SearchBar from '../components/SearchBar';
import { searchTasks } from '../utils/helpers';

export default function CompletedPage() {
  const tasks = useStore(s => s.tasks);
  const filter = useStore(s => s.filter);

  const completedTasks = useMemo(() => {
    let completed = tasks.filter(t => t.status === 'completed' && !t.archived);
    if (filter.search) completed = searchTasks(completed, filter.search);
    return completed.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
  }, [tasks, filter.search]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Completed</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{completedTasks.length} completed tasks</p>
      </div>

      <SearchBar />
      <TaskList tasks={completedTasks} emptyTitle="No completed tasks yet" emptyDescription="Complete a task and it will show up here." />
    </div>
  );
}
