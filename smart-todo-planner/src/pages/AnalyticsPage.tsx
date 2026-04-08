import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const tasks = useStore(s => s.tasks);
  const clearAllTasks = useStore(s => s.clearAllTasks);

  const analytics = useMemo(() => {
    const all = tasks.filter(t => !t.archived);
    const completed = all.filter(t => t.status === 'completed');
    const active = all.filter(t => t.status !== 'completed');

    // Completion over last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const count = completed.filter(t => t.completedAt && isSameDay(parseISO(t.completedAt), date)).length;
      return { name: format(date, 'EEE'), completed: count };
    });

    // By priority
    const byPriority = [
      { name: 'Urgent', value: active.filter(t => t.priority === 'urgent').length },
      { name: 'High', value: active.filter(t => t.priority === 'high').length },
      { name: 'Medium', value: active.filter(t => t.priority === 'medium').length },
      { name: 'Low', value: active.filter(t => t.priority === 'low').length },
    ].filter(d => d.value > 0);

    // By category
    const categories = new Map<string, number>();
    all.forEach(t => {
      const cat = t.category || 'Uncategorized';
      categories.set(cat, (categories.get(cat) || 0) + 1);
    });
    const byCategory = Array.from(categories.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // By status
    const byStatus = [
      { name: 'Not Started', value: all.filter(t => t.status === 'not_started').length },
      { name: 'In Progress', value: all.filter(t => t.status === 'in_progress').length },
      { name: 'Completed', value: completed.length },
      { name: 'Deferred', value: all.filter(t => t.status === 'deferred').length },
    ].filter(d => d.value > 0);

    // Time stats
    const totalEstimated = all.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
    const totalActual = all.reduce((sum, t) => sum + (t.actualTime || 0), 0);

    // Streak: consecutive days with at least 1 completed task
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const date = subDays(new Date(), i);
      const dayCompleted = completed.filter(t => t.completedAt && isSameDay(parseISO(t.completedAt), date)).length;
      if (dayCompleted > 0) streak++;
      else break;
    }

    return { last7Days, byPriority, byCategory, byStatus, totalEstimated, totalActual, total: all.length, completed: completed.length, active: active.length, streak };
  }, [tasks]);

  const exportTasks = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-todo-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTasks = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const imported = JSON.parse(text);
        if (Array.isArray(imported)) {
          useStore.getState().importTasks(imported);
        }
      } catch {
        alert('Invalid JSON file');
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your productivity</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportTasks} className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Export JSON
          </button>
          <button onClick={importTasks} className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Import JSON
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Tasks', value: analytics.total, color: 'text-gray-900 dark:text-white' },
          { label: 'Active', value: analytics.active, color: 'text-primary-600 dark:text-primary-400' },
          { label: 'Completed', value: analytics.completed, color: 'text-green-600 dark:text-green-400' },
          { label: 'Streak', value: `${analytics.streak}d`, color: 'text-orange-600 dark:text-orange-400' },
          { label: 'Time Tracked', value: `${Math.round(analytics.totalActual / 60)}h`, color: 'text-purple-600 dark:text-purple-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Completion trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Tasks Completed (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.last7Days}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
              <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By priority */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Active Tasks by Priority</h3>
          {analytics.byPriority.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={analytics.byPriority} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {analytics.byPriority.map((_, i) => <Cell key={i} fill={['#ef4444', '#f97316', '#eab308', '#3b82f6'][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">No active tasks</div>
          )}
        </div>

        {/* By category */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Tasks by Category</h3>
          {analytics.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.byCategory} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" width={100} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">No data</div>
          )}
        </div>

        {/* By status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Tasks by Status</h3>
          {analytics.byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={analytics.byStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {analytics.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">No data</div>
          )}
        </div>
      </div>

      {/* Data management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Data Management</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Export your tasks as JSON for backup, or import from a previous export.</p>
        <div className="flex gap-2">
          <button onClick={() => { if (confirm('Clear all tasks and activity? This cannot be undone.')) clearAllTasks(); }} className="px-3 py-2 text-sm font-medium rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 transition-colors">
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
