import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import TaskList from '../components/TaskList';
import QuickAddBar from '../components/QuickAddBar';
import { isDueToday, isOverdue } from '../utils/dates';
import { priorityOrder } from '../utils/helpers';

export default function TodayPage() {
  const tasks = useStore(s => s.tasks);

  const { todayTasks, overdueTasks } = useMemo(() => {
    const active = tasks.filter(t => !t.archived);
    const today = active
      .filter(t => isDueToday(t.dueDate) && t.status !== 'completed')
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    const overdue = active
      .filter(t => isOverdue(t.dueDate, t.status))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    return { todayTasks: today, overdueTasks: overdue };
  }, [tasks]);

  const completedToday = useMemo(() =>
    tasks.filter(t => t.completedAt && isDueToday(t.completedAt.split('T')[0])),
  [tasks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Today</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <QuickAddBar />

      {overdueTasks.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-3">Overdue ({overdueTasks.length})</h2>
          <TaskList tasks={overdueTasks} />
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Due Today ({todayTasks.length})</h2>
        <TaskList tasks={todayTasks} emptyTitle="All clear for today" emptyDescription="No tasks due today. Take a break or plan ahead!" />
      </div>

      {completedToday.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-green-600 dark:text-green-400 mb-3">Completed Today ({completedToday.length})</h2>
          <TaskList tasks={completedToday} compact />
        </div>
      )}
    </div>
  );
}
