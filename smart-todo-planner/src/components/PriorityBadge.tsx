import type { Priority } from '../types';

const styles: Record<Priority, string> = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  low: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-semibold capitalize ${styles[priority]}`}>
      {priority}
    </span>
  );
}
