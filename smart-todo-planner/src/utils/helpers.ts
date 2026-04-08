import { v4 as uuidv4 } from 'uuid';
import type { Task, Subtask, Priority, SortField, SortDirection } from '../types';

export function createId(): string {
  return uuidv4();
}

export function createTask(partial: Partial<Task> = {}): Task {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: '',
    description: '',
    dueDate: null,
    dueTime: null,
    priority: 'medium',
    status: 'not_started',
    category: '',
    tags: [],
    estimatedTime: null,
    actualTime: null,
    notes: '',
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    recurrence: 'none',
    reminderEnabled: false,
    reminderDatetime: null,
    subtasks: [],
    orderIndex: Date.now(),
    archived: false,
    ...partial,
  };
}

export function createSubtask(title: string): Subtask {
  return {
    id: createId(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

export function getSubtaskProgress(subtasks: Subtask[]): { completed: number; total: number; percent: number } {
  const total = subtasks.length;
  const completed = subtasks.filter(s => s.completed).length;
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

export const priorityOrder: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const priorityColors: Record<Priority, string> = {
  urgent: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-blue-500 text-white',
};

export const priorityBorderColors: Record<Priority, string> = {
  urgent: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-amber-500',
  low: 'border-l-sky-500',
};

export const statusLabels: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  deferred: 'Deferred',
};

export const statusColors: Record<string, string> = {
  not_started: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  deferred: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

export function sortTasks(tasks: Task[], field: SortField, direction: SortDirection): Task[] {
  return [...tasks].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) cmp = 0;
        else if (!a.dueDate) cmp = 1;
        else if (!b.dueDate) cmp = -1;
        else cmp = a.dueDate.localeCompare(b.dueDate);
        break;
      case 'priority':
        cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'createdAt':
        cmp = a.createdAt.localeCompare(b.createdAt);
        break;
      case 'title':
        cmp = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        break;
      case 'orderIndex':
        cmp = a.orderIndex - b.orderIndex;
        break;
    }
    return direction === 'desc' ? -cmp : cmp;
  });
}

export function searchTasks(tasks: Task[], query: string): Task[] {
  if (!query.trim()) return tasks;
  const q = query.toLowerCase();
  return tasks.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.notes.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

export function formatMinutes(minutes: number | null): string {
  if (minutes === null || minutes === 0) return '';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getAllCategories(tasks: Task[]): string[] {
  const cats = new Set(tasks.map(t => t.category).filter(Boolean));
  return Array.from(cats).sort();
}

export function getAllTags(tasks: Task[]): string[] {
  const tags = new Set(tasks.flatMap(t => t.tags));
  return Array.from(tags).sort();
}
