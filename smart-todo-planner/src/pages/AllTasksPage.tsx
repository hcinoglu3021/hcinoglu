import { useState } from 'react';
import { useFilteredTasks } from '../hooks/useFilteredTasks';
import { useStore } from '../store/useStore';
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
  const totalTasks = useStore(s => s.tasks.filter(t => !t.archived).length);
  const hasFilters = useStore(s => s.filter.status !== 'all' || s.filter.priority !== 'all' || s.filter.category !== 'all' || s.filter.search !== '' || s.filter.tags.length > 0 || s.filter.dateRange !== 'all');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">All Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {hasFilters ? `${tasks.length} of ${totalTasks} tasks` : `${tasks.length} tasks`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 text-sm font-medium rounded-xl border transition-colors flex items-center gap-1.5 ${
              showFilters || hasFilters
                ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800/60 dark:text-primary-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
          </button>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>

      <SearchBar />
      {showFilters && <FilterPanel />}
      <QuickAddBar />
      <BulkActions />
      <TaskList
        tasks={tasks}
        selectable
        emptyTitle={hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
        emptyDescription={hasFilters ? 'Try adjusting your filters or search query.' : 'Create your first task to get started.'}
      />
      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
