import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import QuickAddBar from '../components/QuickAddBar';
import TaskList from '../components/TaskList';
import PomodoroTimer from '../components/PomodoroTimer';
import { isOverdue, isDueToday, isDueThisWeek, formatDate } from '../utils/dates';
import { priorityOrder } from '../utils/helpers';

export default function DashboardPage() {
  const tasks = useStore(s => s.tasks);
  const activityLog = useStore(s => s.activityLog);

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

    return { active: active.length, completedToday: completedToday.length, overdue, dueToday, dueThisWeek: dueThisWeek.length, topPriority, totalCompleted, totalTasks };
  }, [tasks]);

  const progressPercent = stats.totalTasks > 0 ? Math.round((stats.totalCompleted / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back. Here's your overview.</p>
      </div>

      <QuickAddBar />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Tasks', value: stats.active, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/30' },
          { label: 'Completed Today', value: stats.completedToday, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
          { label: 'Overdue', value: stats.overdue.length, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
          { label: 'Due This Week', value: stats.dueThisWeek, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4`}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{progressPercent}%</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{stats.totalCompleted} of {stats.totalTasks} tasks completed</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Due Today */}
        <div className="lg:col-span-2 space-y-4">
          {stats.overdue.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                Overdue ({stats.overdue.length})
              </h2>
              <TaskList tasks={stats.overdue} compact />
            </div>
          )}

          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Due Today ({stats.dueToday.length})</h2>
            <TaskList tasks={stats.dueToday} emptyTitle="Nothing due today" emptyDescription="Enjoy your free time or plan ahead!" compact />
          </div>

          {stats.topPriority.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Top Priorities</h2>
              <TaskList tasks={stats.topPriority} compact />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <PomodoroTimer />

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
            {activityLog.length === 0 ? (
              <p className="text-xs text-gray-400">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {activityLog.slice(0, 8).map(entry => (
                  <div key={entry.id} className="flex items-start gap-2">
                    <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      entry.type === 'completed' ? 'bg-green-500' :
                      entry.type === 'created' ? 'bg-blue-500' :
                      entry.type === 'deleted' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        <span className="capitalize font-medium">{entry.type}</span> {entry.taskTitle}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(entry.timestamp.split('T')[0])}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
