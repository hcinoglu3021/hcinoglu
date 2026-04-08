import { useState } from 'react';
import { useFilteredTasks } from '../hooks/useFilteredTasks';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import QuickAddBar from '../components/QuickAddBar';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import BulkActions from '../components/BulkActions';

export default function AllTasksPage() {
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const tasks = useFilteredTasks();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tasks.length} tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showFilters
                ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-800 dark:text-primary-300'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filters
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            + New Task
          </button>
        </div>
      </div>

      <SearchBar />
      {showFilters && <FilterPanel />}
      <QuickAddBar />
      <BulkActions />
      <TaskList tasks={tasks} selectable emptyTitle="No tasks found" emptyDescription="Create your first task or adjust your filters." />
      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
