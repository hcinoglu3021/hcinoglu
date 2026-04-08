import { useStore } from '../store/useStore';
import { getAllCategories, getAllTags } from '../utils/helpers';
import type { Priority, Status, SortField } from '../types';

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
  const hasActiveFilters = filter.status !== 'all' || filter.priority !== 'all' || filter.category !== 'all' || filter.tags.length > 0 || filter.dateRange !== 'all' || filter.recurrence !== 'all';

  const sel = 'text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg px-2.5 py-2 text-gray-700 dark:text-gray-300 outline-none focus:border-primary-400 transition-colors font-medium';

  return (
    <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Filters</h3>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <select value={filter.status} onChange={e => setFilter({ status: e.target.value as Status | 'all' })} className={sel} aria-label="Filter by status">
          <option value="all">All Status</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="deferred">Deferred</option>
        </select>

        <select value={filter.priority} onChange={e => setFilter({ priority: e.target.value as Priority | 'all' })} className={sel} aria-label="Filter by priority">
          <option value="all">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select value={filter.category} onChange={e => setFilter({ category: e.target.value })} className={sel} aria-label="Filter by category">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={filter.dateRange} onChange={e => setFilter({ dateRange: e.target.value as 'all' | 'today' | 'this_week' | 'this_month' | 'overdue' })} className={sel} aria-label="Filter by date">
          <option value="all">Any Date</option>
          <option value="today">Due Today</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="overdue">Overdue</option>
        </select>

        <select value={filter.recurrence} onChange={e => setFilter({ recurrence: e.target.value as 'all' | 'recurring' | 'non_recurring' })} className={sel} aria-label="Filter by recurrence">
          <option value="all">All Types</option>
          <option value="recurring">Recurring</option>
          <option value="non_recurring">One-time</option>
        </select>

        {allTags.length > 0 && (
          <select
            value=""
            onChange={e => {
              const tag = e.target.value;
              if (tag && !filter.tags.includes(tag)) setFilter({ tags: [...filter.tags, tag] });
            }}
            className={sel}
            aria-label="Filter by tag"
          >
            <option value="">Add tag...</option>
            {allTags.filter(t => !filter.tags.includes(t)).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      {filter.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filter.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              #{tag}
              <button onClick={() => setFilter({ tags: filter.tags.filter(t => t !== tag) })} className="hover:text-primary-900 dark:hover:text-primary-100" aria-label={`Remove ${tag} filter`}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {showSort && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Sort</span>
          <select value={sort.field} onChange={e => setSort({ field: e.target.value as SortField })} className={sel} aria-label="Sort field">
            <option value="orderIndex">Manual</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created</option>
            <option value="title">Name</option>
          </select>
          <button
            onClick={() => setSort({ direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={sort.direction === 'asc' ? 'Sort descending' : 'Sort ascending'}
          >
            {sort.direction === 'asc' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" /></svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
