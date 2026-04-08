import { useStore } from '../store/useStore';

export default function SearchBar() {
  const search = useStore(s => s.filter.search);
  const setFilter = useStore(s => s.setFilter);

  return (
    <div className="relative">
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        value={search}
        onChange={e => setFilter({ search: e.target.value })}
        placeholder="Search tasks..."
        aria-label="Search tasks"
        className="w-full pl-10 pr-9 py-2.5 text-sm bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/60 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none"
      />
      {search && (
        <button
          onClick={() => setFilter({ search: '' })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}
