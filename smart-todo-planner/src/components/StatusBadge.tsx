import type { Status } from '../types';
import { statusLabels } from '../utils/helpers';

const styles: Record<Status, string> = {
  not_started: 'bg-gray-100 text-gray-600 dark:bg-gray-700/80 dark:text-gray-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  deferred: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-semibold ${styles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
