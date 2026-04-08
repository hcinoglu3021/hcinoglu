import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import TaskList from '../components/TaskList';
import type { Priority } from '../types';

const priorityConfig: { key: Priority; label: string; color: string; dot: string }[] = [
  { key: 'urgent', label: 'Urgent', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  { key: 'high', label: 'High', color: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  { key: 'medium', label: 'Medium', color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  { key: 'low', label: 'Low', color: 'text-sky-600 dark:text-sky-400', dot: 'bg-sky-500' },
];

export default function PriorityPage() {
  const tasks = useStore(s => s.tasks);

  const groups = useMemo(() => {
    const active = tasks.filter(t => !t.archived && t.status !== 'completed');
    return priorityConfig.map(p => ({ ...p, tasks: active.filter(t => t.priority === p.key) }));
  }, [tasks]);

  const total = groups.reduce((s, g) => s + g.tasks.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Priority View</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{total} active tasks by priority</p>
      </div>

      {groups.map(group => (
        <section key={group.key}>
          <h2 className={`text-sm font-bold mb-2.5 flex items-center gap-2 ${group.color}`}>
            <span className={`w-2 h-2 rounded-full ${group.dot}`} />
            {group.label}
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">{group.tasks.length}</span>
          </h2>
          <TaskList tasks={group.tasks} emptyTitle={`No ${group.label.toLowerCase()} priority tasks`} compact />
        </section>
      ))}
    </div>
  );
}
