export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'not_started' | 'in_progress' | 'completed' | 'deferred';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';
export type ViewMode = 'list' | 'grid' | 'kanban';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: Priority;
  status: Status;
  category: string;
  tags: string[];
  estimatedTime: number | null; // minutes
  actualTime: number | null; // minutes
  notes: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  recurrence: Recurrence;
  reminderEnabled: boolean;
  reminderDatetime: string | null;
  subtasks: Subtask[];
  orderIndex: number;
  archived: boolean;
}

export interface FilterState {
  status: Status | 'all';
  priority: Priority | 'all';
  category: string | 'all';
  tags: string[];
  dateRange: 'all' | 'today' | 'this_week' | 'this_month' | 'overdue';
  completion: 'all' | 'completed' | 'incomplete';
  recurrence: 'all' | 'recurring' | 'non_recurring';
  search: string;
}

export type SortField = 'dueDate' | 'priority' | 'createdAt' | 'title' | 'orderIndex';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface PomodoroState {
  isRunning: boolean;
  taskId: string | null;
  timeRemaining: number; // seconds
  sessionType: 'work' | 'break';
  sessionsCompleted: number;
  workDuration: number; // minutes
  breakDuration: number; // minutes
}

export interface ActivityEntry {
  id: string;
  type: 'created' | 'completed' | 'updated' | 'deleted' | 'archived';
  taskTitle: string;
  timestamp: string;
}
