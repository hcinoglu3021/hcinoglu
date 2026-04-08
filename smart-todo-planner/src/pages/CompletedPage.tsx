import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import TaskList from '../components/TaskList';
import SearchBar from '../components/SearchBar';
import { searchTasks } from '../utils/helpers';
import { format, parseISO, isToday, isYesterday, isThisWeek } from 'date-fns';

export default function CompletedPage() {
  const tasks = useStore(s => s.tasks);
  const search = useStore(s => s.filter.search);

  const grouped = useMemo(() => {
    let completed = tasks.filter(t => t.status === 'completed' && !t.archived);
    if (search) completed = searchTasks(completed, search);
    completed.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));

    const groups: { label: string; tasks: typeof completed }[] = [];
    const today: typeof completed = [];
    const yesterday: typeof completed = [];
    const thisWeek: typeof completed = [];
    const older: typeof completed = [];

    for (const t of completed) {
      if (!t.completedAt) { older.push(t); continue; }
      const d = parseISO(t.completedAt);
      if (isToday(d)) today.push(t);
      else if (isYesterday(d)) yesterday.push(t);
      else if (isThisWeek(d, { weekStartsOn: 1 })) thisWeek.push(t);
      else older.push(t);
    }

    if (today.length) groups.push({ label: 'Today', tasks: today });
    if (yesterday.length) groups.push({ label: 'Yesterday', tasks: yesterday });
    if (thisWeek.length) groups.push({ label: 'This Week', tasks: thisWeek });
    if (older.length) groups.push({ label: 'Earlier', tasks: older });
    return { groups, total: completed.length };
  }, [tasks, search]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Completed</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{grouped.total} tasks completed</p>
      </div>

      <SearchBar />

      {grouped.groups.length === 0 && (
        <TaskList tasks={[]} emptyTitle="No completed tasks" emptyDescription="Complete a task and it will show up here." />
      )}

      {grouped.groups.map(group => (
        <section key={group.label}>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2.5">{group.label} <span className="text-gray-400 font-medium">({group.tasks.length})</span></h2>
          <TaskList tasks={group.tasks} compact />
        </section>
      ))}
    </div>
  );
}
