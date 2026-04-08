import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useToastStore } from '../hooks/useToast';
import TaskCard from '../components/TaskCard';
import type { Status, Task } from '../types';
import { statusLabels } from '../utils/helpers';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

const columns: { status: Status; color: string }[] = [
  { status: 'not_started', color: 'border-t-gray-400' },
  { status: 'in_progress', color: 'border-t-blue-500' },
  { status: 'completed', color: 'border-t-green-500' },
  { status: 'deferred', color: 'border-t-purple-500' },
];

function SortableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} compact />
    </div>
  );
}

export default function KanbanPage() {
  const tasks = useStore(s => s.tasks);
  const updateTask = useStore(s => s.updateTask);
  const addToast = useToastStore(s => s.addToast);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const columnTasks = useMemo(() => {
    const active = tasks.filter(t => !t.archived);
    const map = new Map<Status, Task[]>();
    columns.forEach(c => map.set(c.status, active.filter(t => t.status === c.status)));
    return map;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = columns.find(c => c.status === overId);
    if (targetColumn) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== targetColumn.status) {
        updateTask(taskId, {
          status: targetColumn.status,
          completedAt: targetColumn.status === 'completed' ? new Date().toISOString() : task.completedAt,
        });
        addToast(`Moved to ${statusLabels[targetColumn.status]}`);
      }
      return;
    }

    // Dropped on another task - find which column
    const overTask = tasks.find(t => t.id === overId);
    if (overTask) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== overTask.status) {
        updateTask(taskId, {
          status: overTask.status,
          completedAt: overTask.status === 'completed' ? new Date().toISOString() : task.completedAt,
        });
        addToast(`Moved to ${statusLabels[overTask.status]}`);
      }
    }
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag tasks between columns to update status</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(col => {
            const colTasks = columnTasks.get(col.status) || [];
            return (
              <div key={col.status} className={`bg-gray-50 dark:bg-gray-900 rounded-xl border-t-4 ${col.color} min-h-[200px]`}>
                <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{statusLabels[col.status]}</h3>
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                  </div>
                </div>
                <SortableContext id={col.status} items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="p-2 space-y-2">
                    {colTasks.map(task => (
                      <SortableTask key={task.id} task={task} />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="text-center py-8 text-xs text-gray-400">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} compact />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
