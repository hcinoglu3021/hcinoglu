import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useToastStore } from '../hooks/useToast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

export default function AnalyticsPage() {
  const tasks = useStore(s => s.tasks);
  const clearAllTasks = useStore(s => s.clearAllTasks);
  const importTasksFn = useStore(s => s.importTasks);
  const addToast = useToastStore(s => s.addToast);

  const analytics = useMemo(() => {
    const all = tasks.filter(t => !t.archived);
    const completed = all.filter(t => t.status === 'completed');
    const active = all.filter(t => t.status !== 'completed');

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return { name: format(date, 'EEE'), completed: completed.filter(t => t.completedAt && isSameDay(parseISO(t.completedAt), date)).length };
    });

    const byPriority = [
      { name: 'Urgent', value: active.filter(t => t.priority === 'urgent').length, color: '#ef4444' },
      { name: 'High', value: active.filter(t => t.priority === 'high').length, color: '#f97316' },
      { name: 'Medium', value: active.filter(t => t.priority === 'medium').length, color: '#eab308' },
      { name: 'Low', value: active.filter(t => t.priority === 'low').length, color: '#0ea5e9' },
    ].filter(d => d.value > 0);

    const catMap = new Map<string, number>();
    all.forEach(t => { const c = t.category || 'Uncategorized'; catMap.set(c, (catMap.get(c) || 0) + 1); });
    const byCategory = Array.from(catMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const byStatus = [
      { name: 'Not Started', value: all.filter(t => t.status === 'not_started').length, color: '#6b7280' },
      { name: 'In Progress', value: all.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
      { name: 'Completed', value: completed.length, color: '#10b981' },
      { name: 'Deferred', value: all.filter(t => t.status === 'deferred').length, color: '#8b5cf6' },
    ].filter(d => d.value > 0);

    const totalActual = all.reduce((sum, t) => sum + (t.actualTime || 0), 0);

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const date = subDays(new Date(), i);
      if (completed.some(t => t.completedAt && isSameDay(parseISO(t.completedAt), date))) streak++;
      else break;
    }

    return { last7Days, byPriority, byCategory, byStatus, totalActual, total: all.length, completed: completed.length, active: active.length, streak };
  }, [tasks]);

  const exportTasks = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-todo-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Tasks exported');
  };

  const importTasks = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const imported = JSON.parse(await file.text());
        if (Array.isArray(imported)) { importTasksFn(imported); addToast(`Imported ${imported.length} tasks`); }
        else addToast('Invalid format', 'error');
      } catch { addToast('Invalid JSON file', 'error'); }
    };
    input.click();
  };

  const tooltipStyle = { background: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track your productivity</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportTasks} className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Export
          </button>
          <button onClick={importTasks} className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Import
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: analytics.total, accent: 'text-gray-900 dark:text-white' },
          { label: 'Active', value: analytics.active, accent: 'text-primary-600 dark:text-primary-400' },
          { label: 'Completed', value: analytics.completed, accent: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Streak', value: `${analytics.streak}d`, accent: 'text-orange-600 dark:text-orange-400' },
          { label: 'Tracked', value: `${Math.round(analytics.totalActual / 60)}h`, accent: 'text-purple-600 dark:text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 p-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.accent} tabular-nums`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">Completed (7 days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={analytics.last7Days}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
              <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">By Priority</h3>
          {analytics.byPriority.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={analytics.byPriority} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {analytics.byPriority.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">No active tasks</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">By Category</h3>
          {analytics.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analytics.byCategory} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" width={90} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">No data</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">By Status</h3>
          {analytics.byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={analytics.byStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {analytics.byStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">No data</div>
          )}
        </div>
      </div>

      {/* Data management */}
      <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Data Management</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Export your tasks as JSON for backup, or clear everything to start fresh.</p>
        <button onClick={() => { if (confirm('Clear all tasks and activity? This cannot be undone.')) { clearAllTasks(); addToast('All data cleared'); } }} className="px-3 py-2 text-xs font-semibold rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-red-200/60 dark:border-red-800/40">
          Clear All Data
        </button>
      </div>
    </div>
  );
}
