import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { useToastStore } from '../hooks/useToast';
import TaskCard from '../components/TaskCard';
import type { Status, Task } from '../types';
import { statusLabels } from '../utils/helpers';
import {
  DndContext, DragOverlay, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const columns: { status: Status; color: string; headerBg: string }[] = [
  { status: 'not_started', color: 'border-t-gray-400', headerBg: 'bg-gray-100 dark:bg-gray-700/50' },
  { status: 'in_progress', color: 'border-t-blue-500', headerBg: 'bg-blue-50 dark:bg-blue-900/20' },
  { status: 'completed', color: 'border-t-emerald-500', headerBg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { status: 'deferred', color: 'border-t-purple-500', headerBg: 'bg-purple-50 dark:bg-purple-900/20' },
];

function DroppableColumn({ status, children }: { status: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` });
  return (
    <div ref={setNodeRef} className={`p-2 space-y-2 min-h-[120px] rounded-b-xl transition-colors ${isOver ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
      {children}
    </div>
  );
}

function SortableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
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

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Dropped on a column droppable zone
    if (overId.startsWith('column-')) {
      const targetStatus = overId.replace('column-', '') as Status;
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== targetStatus) {
        updateTask(taskId, {
          status: targetStatus,
          completedAt: targetStatus === 'completed' ? new Date().toISOString() : null,
        });
        addToast(`Moved to ${statusLabels[targetStatus]}`);
      }
      return;
    }

    // Dropped on another task
    const overTask = tasks.find(t => t.id === overId);
    if (overTask) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== overTask.status) {
        updateTask(taskId, {
          status: overTask.status,
          completedAt: overTask.status === 'completed' ? new Date().toISOString() : null,
        });
        addToast(`Moved to ${statusLabels[overTask.status]}`);
      }
    }
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Kanban Board</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Drag tasks between columns to change status</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(col => {
            const colTasks = columnTasks.get(col.status) || [];
            return (
              <div key={col.status} className={`rounded-xl border-t-[3px] ${col.color} bg-gray-50/80 dark:bg-gray-900/50 border border-gray-200/60 dark:border-gray-700/40`}>
                <div className={`px-3 py-2.5 ${col.headerBg} rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">{statusLabels[col.status]}</h3>
                    <span className="text-[11px] font-semibold bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full tabular-nums">{colTasks.length}</span>
                  </div>
                </div>
                <SortableContext id={col.status} items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <DroppableColumn status={col.status}>
                    {colTasks.map(task => <SortableTask key={task.id} task={task} />)}
                    {colTasks.length === 0 && (
                      <div className="text-center py-8 text-[11px] text-gray-400 dark:text-gray-500">Drop tasks here</div>
                    )}
                  </DroppableColumn>
                </SortableContext>
              </div>
            );
          })}
        </div>
        <DragOverlay>
          {activeTask && <div className="opacity-90 rotate-2"><TaskCard task={activeTask} compact /></div>}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
