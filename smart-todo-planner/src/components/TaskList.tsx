import { useState } from 'react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import EmptyState from './EmptyState';
import type { Task } from '../types';

interface Props {
  tasks: Task[];
  emptyTitle?: string;
  emptyDescription?: string;
  selectable?: boolean;
  compact?: boolean;
}

export default function TaskList({ tasks, emptyTitle = 'No tasks', emptyDescription, selectable, compact }: Props) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        }
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <>
      <div className="space-y-2">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            compact={compact}
            selectable={selectable}
            onEdit={setEditingTask}
          />
        ))}
      </div>
      {editingTask && <TaskForm task={editingTask} onClose={() => setEditingTask(null)} />}
    </>
  );
}
