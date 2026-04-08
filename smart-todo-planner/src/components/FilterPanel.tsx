import { useStore } from '../store/useStore';
import { getAllCategories, getAllTags } from '../utils/helpers';
import type { Priority, Status, SortField, SortDirection } from '../types';

interface Props {
  showSort?: boolean;
}

export default function FilterPanel({ showSort = true }: Props) {
  const filter = useStore(s => s.filter);
  const sort = useStore(s => s.sort);
  const tasks = useStore(s => s.tasks);
  const setFilter = useStore(s => s.setFilter);
  const resetFilters = useStore(s => s.resetFilters);
  const setSort = useStore(s => s.setSort);

  const categories = getAllCategories(tasks);
  const allTags = getAllTags(tasks);
  const hasActiveFilters = filter.status !== 'all' || filter.priority !== 'all' || filter.category !== 'all' || filter.tags.length > 0 || filter.dateRange !== 'all' || filter.completion !== 'all' || filter.recurrence !== 'all';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-xs text-primary-500 hover:text-primary-600 font-medium">
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        <select value={filter.status} onChange={e => setFilter({ status: e.target.value as Status | 'all' })} className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 outline-none">
          <option value="all">All Status</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="deferred">Deferred</option>
        </select>

        <select value={filter.priority} onChange={e => setFilter({ priority: e.target.value as Priority | 'all' })} className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 outline-none">
          <option value="all">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select value={filter.category} onChange={e => setFilter({ category: e.target.value })} className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 outline-none">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={filter.dateRange} onChange={e => setFilter({ dateRange: e.target.value as 'all' | 'today' | 'this_week' | 'this_month' | 'overdue' })} className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 outline-none">
          <option value="all">All Dates</option>
          <option value="today">Due Today</option>
          <option value="this_week">This Week</option>
          <option value="overdue">Overdue</option>
        </select>

        <select value={filter.recurrence} onChange={e => setFilter({ recurrence: e.target.value as 'all' | 'recurring' | 'non_recurring' })} className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 outline-none">
          <option value="all">All Tasks</option>
          <option value="recurring">Recurring</option>
          <option value="non_recurring">Non-recurring</option>
        </select>

        {allTags.length > 0 && (
          <select
            value=""
            onChange={e => {
              const tag = e.target.value;
              if (tag && !filter.tags.includes(tag)) setFilter({ tags: [...filter.tags, tag] });
            }}
            className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 outline-none"
          >
            <option value="">Add tag filter...</option>
            {allTags.filter(t => !filter.tags.includes(t)).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      {filter.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filter.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
              {tag}
              <button onClick={() => setFilter({ tags: filter.tags.filter(t => t !== tag) })} className="hover:text-primary-900">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {showSort && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">Sort:</span>
          <select value={sort.field} onChange={e => setSort({ field: e.target.value as SortField })} className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-gray-700 dark:text-gray-300 outline-none">
            <option value="orderIndex">Manual Order</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created Date</option>
            <option value="title">Alphabetical</option>
          </select>
          <button
            onClick={() => setSort({ direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
          >
            {sort.direction === 'asc' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
