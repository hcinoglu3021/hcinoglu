import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import TaskList from '../components/TaskList';
import type { Priority } from '../types';

const priorityConfig: { key: Priority; label: string; color: string }[] = [
  { key: 'urgent', label: 'Urgent', color: 'text-red-600 dark:text-red-400' },
  { key: 'high', label: 'High', color: 'text-orange-600 dark:text-orange-400' },
  { key: 'medium', label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' },
  { key: 'low', label: 'Low', color: 'text-blue-600 dark:text-blue-400' },
];

export default function PriorityPage() {
  const tasks = useStore(s => s.tasks);

  const groups = useMemo(() => {
    const active = tasks.filter(t => !t.archived && t.status !== 'completed');
    return priorityConfig.map(p => ({
      ...p,
      tasks: active.filter(t => t.priority === p.key),
    }));
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Priority View</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tasks grouped by priority level</p>
      </div>

      {groups.map(group => (
        <div key={group.key}>
          <h2 className={`text-base font-semibold mb-3 flex items-center gap-2 ${group.color}`}>
            {group.label}
            <span className="text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{group.tasks.length}</span>
          </h2>
          <TaskList tasks={group.tasks} emptyTitle={`No ${group.label.toLowerCase()} priority tasks`} compact />
        </div>
      ))}
    </div>
  );
}
