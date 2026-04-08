import type { Priority } from '../types';
import { priorityColors } from '../utils/helpers';

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${priorityColors[priority]}`}>
      {priority}
    </span>
  );
}
