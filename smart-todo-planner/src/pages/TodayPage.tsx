import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import QuickAddBar from '../components/QuickAddBar';
import { isDueToday, isOverdue } from '../utils/dates';
import { priorityOrder } from '../utils/helpers';
import { format } from 'date-fns';

export default function TodayPage() {
  const tasks = useStore(s => s.tasks);
  const [showForm, setShowForm] = useState(false);

  const { todayTasks, overdueTasks, completedToday } = useMemo(() => {
    const active = tasks.filter(t => !t.archived);
    return {
      todayTasks: active
        .filter(t => isDueToday(t.dueDate) && t.status !== 'completed')
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
      overdueTasks: active
        .filter(t => isOverdue(t.dueDate, t.status))
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
      completedToday: tasks.filter(t => t.completedAt && isDueToday(t.completedAt.split('T')[0])),
    };
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Today</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {format(new Date(), 'EEEE, MMMM d')} &middot; {todayTasks.length + overdueTasks.length} tasks remaining
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      <QuickAddBar />

      {overdueTasks.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2.5 flex items-center gap-2">
            Overdue
            <span className="text-[11px] bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded-full">{overdueTasks.length}</span>
          </h2>
          <TaskList tasks={overdueTasks} />
        </section>
      )}

      <section>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2.5">Due Today <span className="text-gray-400 font-medium">({todayTasks.length})</span></h2>
        <TaskList tasks={todayTasks} emptyTitle="All clear for today" emptyDescription="No tasks due today. Nice work!" />
      </section>

      {completedToday.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2.5 flex items-center gap-2">
            Completed Today
            <span className="text-[11px] bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-full">{completedToday.length}</span>
          </h2>
          <TaskList tasks={completedToday} compact />
        </section>
      )}

      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
