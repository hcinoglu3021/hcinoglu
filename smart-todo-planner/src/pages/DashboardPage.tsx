import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import QuickAddBar from '../components/QuickAddBar';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import PomodoroTimer from '../components/PomodoroTimer';
import { isOverdue, isDueToday, isDueThisWeek, formatDate } from '../utils/dates';
import { priorityOrder } from '../utils/helpers';

export default function DashboardPage() {
  const tasks = useStore(s => s.tasks);
  const activityLog = useStore(s => s.activityLog);
  const [showForm, setShowForm] = useState(false);

  const stats = useMemo(() => {
    const active = tasks.filter(t => !t.archived && t.status !== 'completed');
    const completedToday = tasks.filter(t => t.completedAt && isDueToday(t.completedAt.split('T')[0]));
    const overdue = active.filter(t => isOverdue(t.dueDate, t.status));
    const dueToday = active.filter(t => isDueToday(t.dueDate));
    const dueThisWeek = active.filter(t => isDueThisWeek(t.dueDate));
    const topPriority = active
      .filter(t => t.priority === 'urgent' || t.priority === 'high')
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 5);
    const totalCompleted = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.filter(t => !t.archived).length;
    const progressPct = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    return { active: active.length, completedToday: completedToday.length, overdue, dueToday, dueThisWeek: dueThisWeek.length, topPriority, totalCompleted, totalTasks, progressPct };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm hidden sm:flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Task
        </button>
      </div>

      <QuickAddBar />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active', value: stats.active, icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z', accent: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Done Today', value: stats.completedToday, icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', accent: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Overdue', value: stats.overdue.length, icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z', accent: stats.overdue.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400', bg: stats.overdue.length > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800' },
          { label: 'This Week', value: stats.dueThisWeek, icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5', accent: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-transparent`}>
            <div className="flex items-center gap-2 mb-2">
              <svg className={`w-4 h-4 ${s.accent}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400 tabular-nums">{stats.progressPct}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700/80 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500 ease-out" style={{ width: `${stats.progressPct}%` }} />
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">{stats.totalCompleted} of {stats.totalTasks} tasks completed</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {stats.overdue.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2.5 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>
                Overdue
                <span className="text-[11px] bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded-full">{stats.overdue.length}</span>
              </h2>
              <TaskList tasks={stats.overdue} compact />
            </section>
          )}

          <section>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2.5">Due Today <span className="text-gray-400 font-medium">({stats.dueToday.length})</span></h2>
            <TaskList tasks={stats.dueToday} emptyTitle="All clear for today" emptyDescription="No tasks due today. Enjoy your free time!" compact />
          </section>

          {stats.topPriority.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2.5">Top Priorities</h2>
              <TaskList tasks={stats.topPriority} compact />
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <PomodoroTimer />

          {/* Activity */}
          <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Recent Activity</h3>
            {activityLog.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 py-4 text-center">No activity yet</p>
            ) : (
              <div className="space-y-2.5">
                {activityLog.slice(0, 6).map(entry => (
                  <div key={entry.id} className="flex items-start gap-2.5">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                      entry.type === 'completed' ? 'bg-emerald-500' :
                      entry.type === 'created' ? 'bg-primary-500' :
                      entry.type === 'deleted' ? 'bg-red-400' :
                      'bg-gray-300 dark:bg-gray-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        <span className="font-medium capitalize">{entry.type}</span>{' '}
                        <span className="text-gray-500 dark:text-gray-500">{entry.taskTitle}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
