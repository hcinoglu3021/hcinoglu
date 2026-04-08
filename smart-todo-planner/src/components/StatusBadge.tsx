import type { Status } from '../types';
import { statusLabels, statusColors } from '../utils/helpers';

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
