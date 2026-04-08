import { useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../store/useStore';
import ThemeToggle from './ThemeToggle';
import { isOverdue, isDueToday } from '../utils/dates';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { to: '/tasks', label: 'All Tasks', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', countKey: 'active' as const },
    ],
  },
  {
    label: 'Schedule',
    items: [
      { to: '/today', label: 'Today', icon: 'M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.95 7.07l-.71-.71M4.76 4.76l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z', countKey: 'today' as const },
      { to: '/upcoming', label: 'Upcoming', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { to: '/calendar', label: 'Calendar', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
    ],
  },
  {
    label: 'Organize',
    items: [
      { to: '/projects', label: 'Projects', icon: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z' },
      { to: '/priority', label: 'Priority', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
      { to: '/kanban', label: 'Kanban', icon: 'M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z' },
      { to: '/completed', label: 'Completed', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },
  {
    label: 'Productivity',
    items: [
      { to: '/focus', label: 'Focus', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
      { to: '/analytics', label: 'Analytics', icon: 'M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z' },
    ],
  },
];

export default function Sidebar() {
  const sidebarOpen = useStore(s => s.sidebarOpen);
  const setSidebarOpen = useStore(s => s.setSidebarOpen);
  const tasks = useStore(s => s.tasks);

  const counts = useMemo(() => {
    const active = tasks.filter(t => !t.archived && t.status !== 'completed');
    const today = active.filter(t => isDueToday(t.dueDate));
    const overdue = active.filter(t => isOverdue(t.dueDate, t.status));
    return { active: active.length, today: today.length, overdue: overdue.length };
  }, [tasks]);

  // Close sidebar on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30 lg:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800 transform transition-transform duration-200 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 h-16 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              </div>
              <span className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">Smart Todo</span>
            </div>
            <button
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Overdue banner */}
          {counts.overdue > 0 && (
            <NavLink
              to="/tasks"
              onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className="mx-3 mb-1 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/60 flex items-center gap-2 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>
              {counts.overdue} overdue task{counts.overdue > 1 ? 's' : ''}
            </NavLink>
          )}

          {/* Nav sections */}
          <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-5">
            {navSections.map(section => (
              <div key={section.label}>
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{section.label}</p>
                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const count = item.countKey ? counts[item.countKey] : null;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                            isActive
                              ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400 shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-200'
                          }`
                        }
                      >
                        <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon} />
                        </svg>
                        <span className="flex-1">{item.label}</span>
                        {count !== null && count > 0 && (
                          <span className="text-[11px] font-semibold tabular-nums bg-gray-200/80 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-1.5 min-w-[20px] text-center">
                            {count}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
            <ThemeToggle />
            <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
