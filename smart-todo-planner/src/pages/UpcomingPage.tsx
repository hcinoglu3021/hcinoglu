import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import TaskList from '../components/TaskList';
import { format, addDays, parseISO, isSameDay, isAfter, startOfDay } from 'date-fns';

export default function UpcomingPage() {
  const tasks = useStore(s => s.tasks);

  const grouped = useMemo(() => {
    const active = tasks.filter(t => !t.archived && t.status !== 'completed' && t.dueDate);
    const today = startOfDay(new Date());
    const days: { date: Date; label: string; tasks: typeof active }[] = [];

    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'EEEE, MMM d');
      const dayTasks = active.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), date));
      if (dayTasks.length > 0) {
        days.push({ date, label, tasks: dayTasks });
      }
    }

    const laterDate = addDays(today, 14);
    const later = active.filter(t => t.dueDate && isAfter(parseISO(t.dueDate), laterDate));
    if (later.length > 0) {
      days.push({ date: laterDate, label: 'Later', tasks: later });
    }

    return days;
  }, [tasks]);

  const noDueDateTasks = useMemo(() =>
    tasks.filter(t => !t.archived && t.status !== 'completed' && !t.dueDate),
  [tasks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Next 14 days and beyond</p>
      </div>

      {grouped.length === 0 && noDueDateTasks.length === 0 && (
        <TaskList tasks={[]} emptyTitle="No upcoming tasks" emptyDescription="You're all caught up!" />
      )}

      {grouped.map(group => (
        <div key={group.label}>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            {group.label}
            <span className="text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{group.tasks.length}</span>
          </h2>
          <TaskList tasks={group.tasks} compact />
        </div>
      ))}

      {noDueDateTasks.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-3">No Due Date ({noDueDateTasks.length})</h2>
          <TaskList tasks={noDueDateTasks} compact />
        </div>
      )}
    </div>
  );
}
