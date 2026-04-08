import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import TaskList from '../components/TaskList';
import { format, addDays, parseISO, isSameDay, isAfter, startOfDay } from 'date-fns';

export default function UpcomingPage() {
  const tasks = useStore(s => s.tasks);

  const { grouped, noDueDateTasks } = useMemo(() => {
    const active = tasks.filter(t => !t.archived && t.status !== 'completed');
    const today = startOfDay(new Date());
    const days: { label: string; tasks: typeof active }[] = [];

    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'EEEE, MMM d');
      const dayTasks = active.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), date));
      if (dayTasks.length > 0) days.push({ label, tasks: dayTasks });
    }

    const laterDate = addDays(today, 14);
    const later = active.filter(t => t.dueDate && isAfter(parseISO(t.dueDate), laterDate));
    if (later.length > 0) days.push({ label: 'Later', tasks: later });

    return {
      grouped: days,
      noDueDateTasks: active.filter(t => !t.dueDate),
    };
  }, [tasks]);

  const totalUpcoming = grouped.reduce((sum, g) => sum + g.tasks.length, 0) + noDueDateTasks.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Upcoming</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{totalUpcoming} tasks in the next 14 days</p>
      </div>

      {grouped.length === 0 && noDueDateTasks.length === 0 && (
        <TaskList tasks={[]} emptyTitle="No upcoming tasks" emptyDescription="You're all caught up!" />
      )}

      {grouped.map(group => (
        <section key={group.label}>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2.5 flex items-center gap-2">
            {group.label}
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">{group.tasks.length}</span>
          </h2>
          <TaskList tasks={group.tasks} compact />
        </section>
      ))}

      {noDueDateTasks.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2.5">No Due Date <span className="font-medium text-gray-400">({noDueDateTasks.length})</span></h2>
          <TaskList tasks={noDueDateTasks} compact />
        </section>
      )}
    </div>
  );
}
