import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, FilterState, SortState, PomodoroState, ActivityEntry } from '../types';
import { createTask, createId } from '../utils/helpers';
import { getNextRecurrenceDate } from '../utils/dates';

interface AppState {
  tasks: Task[];
  filter: FilterState;
  sort: SortState;
  selectedTaskIds: string[];
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  onboardingDone: boolean;
  pomodoro: PomodoroState;
  activityLog: ActivityEntry[];
  focusModeTaskId: string | null;

  // Task CRUD
  addTask: (task: Partial<Task>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  deleteTasks: (ids: string[]) => void;
  toggleTaskComplete: (id: string) => void;
  duplicateTask: (id: string) => void;
  archiveTask: (id: string) => void;
  archiveTasks: (ids: string[]) => void;
  reorderTask: (id: string, newIndex: number) => void;
  importTasks: (tasks: Task[]) => void;
  clearAllTasks: () => void;

  // Subtask
  addSubtask: (taskId: string, title: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Filters/Sort
  setFilter: (filter: Partial<FilterState>) => void;
  resetFilters: () => void;
  setSort: (sort: Partial<SortState>) => void;

  // Selection
  setSelectedTaskIds: (ids: string[]) => void;
  toggleTaskSelection: (id: string) => void;
  clearSelection: () => void;

  // UI
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setOnboardingDone: () => void;
  setFocusModeTaskId: (id: string | null) => void;

  // Pomodoro
  startPomodoro: (taskId: string) => void;
  stopPomodoro: () => void;
  tickPomodoro: () => void;
  resetPomodoro: () => void;

  // Activity
  logActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
}

const defaultFilter: FilterState = {
  status: 'all',
  priority: 'all',
  category: 'all',
  tags: [],
  dateRange: 'all',
  completion: 'all',
  recurrence: 'all',
  search: '',
};

const defaultSort: SortState = {
  field: 'orderIndex',
  direction: 'asc',
};

const defaultPomodoro: PomodoroState = {
  isRunning: false,
  taskId: null,
  timeRemaining: 25 * 60,
  sessionType: 'work',
  sessionsCompleted: 0,
  workDuration: 25,
  breakDuration: 5,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: defaultFilter,
      sort: defaultSort,
      selectedTaskIds: [],
      theme: 'light',
      sidebarOpen: true,
      onboardingDone: false,
      pomodoro: defaultPomodoro,
      activityLog: [],
      focusModeTaskId: null,

      addTask: (partial) => {
        const task = createTask(partial);
        set(s => ({ tasks: [...s.tasks, task] }));
        get().logActivity({ type: 'created', taskTitle: task.title });
      },

      updateTask: (id, updates) => {
        const task = get().tasks.find(t => t.id === id);
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));
        if (task) get().logActivity({ type: 'updated', taskTitle: task.title });
      },

      deleteTask: (id) => {
        const task = get().tasks.find(t => t.id === id);
        set(s => ({
          tasks: s.tasks.filter(t => t.id !== id),
          selectedTaskIds: s.selectedTaskIds.filter(i => i !== id),
          focusModeTaskId: s.focusModeTaskId === id ? null : s.focusModeTaskId,
          pomodoro: s.pomodoro.taskId === id ? { ...defaultPomodoro } : s.pomodoro,
        }));
        if (task) get().logActivity({ type: 'deleted', taskTitle: task.title });
      },

      deleteTasks: (ids) => {
        set(s => ({
          tasks: s.tasks.filter(t => !ids.includes(t.id)),
          selectedTaskIds: [],
          focusModeTaskId: s.focusModeTaskId && ids.includes(s.focusModeTaskId) ? null : s.focusModeTaskId,
          pomodoro: s.pomodoro.taskId && ids.includes(s.pomodoro.taskId) ? { ...defaultPomodoro } : s.pomodoro,
        }));
      },

      toggleTaskComplete: (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;
        const now = new Date().toISOString();

        if (task.status === 'completed') {
          set(s => ({
            tasks: s.tasks.map(t =>
              t.id === id
                ? { ...t, status: 'not_started' as const, completedAt: null, updatedAt: now }
                : t
            ),
          }));
        } else {
          // Complete the task
          set(s => ({
            tasks: s.tasks.map(t =>
              t.id === id
                ? { ...t, status: 'completed' as const, completedAt: now, updatedAt: now }
                : t
            ),
          }));
          get().logActivity({ type: 'completed', taskTitle: task.title });

          // Regenerate recurring task
          if (task.recurrence !== 'none' && task.dueDate) {
            const nextDate = getNextRecurrenceDate(task.dueDate, task.recurrence);
            get().addTask({
              ...task,
              id: undefined,
              status: 'not_started',
              completedAt: null,
              dueDate: nextDate,
              subtasks: task.subtasks.map(st => ({ ...st, id: createId(), completed: false })),
              createdAt: now,
              updatedAt: now,
              orderIndex: Date.now(),
            });
          }
        }
      },

      duplicateTask: (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;
        get().addTask({
          ...task,
          id: undefined,
          title: `${task.title} (copy)`,
          status: 'not_started',
          completedAt: null,
          subtasks: task.subtasks.map(st => ({ ...st, id: createId(), completed: false })),
          orderIndex: Date.now(),
        });
      },

      archiveTask: (id) => {
        const task = get().tasks.find(t => t.id === id);
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === id ? { ...t, archived: true, updatedAt: new Date().toISOString() } : t
          ),
        }));
        if (task) get().logActivity({ type: 'archived', taskTitle: task.title });
      },

      archiveTasks: (ids) => {
        set(s => ({
          tasks: s.tasks.map(t =>
            ids.includes(t.id) ? { ...t, archived: true, updatedAt: new Date().toISOString() } : t
          ),
          selectedTaskIds: [],
        }));
      },

      reorderTask: (id, newIndex) => {
        set(s => {
          const tasks = [...s.tasks];
          const idx = tasks.findIndex(t => t.id === id);
          if (idx < 0) return s;
          const [task] = tasks.splice(idx, 1);
          tasks.splice(newIndex, 0, task);
          return { tasks: tasks.map((t, i) => ({ ...t, orderIndex: i })) };
        });
      },

      importTasks: (tasks) => {
        set(s => ({ tasks: [...s.tasks, ...tasks] }));
      },

      clearAllTasks: () => {
        set({ tasks: [], activityLog: [] });
      },

      // Subtasks
      addSubtask: (taskId, title) => {
        const subtask = { id: createId(), title, completed: false, createdAt: new Date().toISOString() };
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask], updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      updateSubtask: (taskId, subtaskId, title) => {
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, title } : st), updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      toggleSubtask: (taskId, subtaskId) => {
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st), updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      deleteSubtask: (taskId, subtaskId) => {
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === taskId
              ? { ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId), updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      // Filters/Sort
      setFilter: (filter) => set(s => ({ filter: { ...s.filter, ...filter } })),
      resetFilters: () => set({ filter: defaultFilter }),
      setSort: (sort) => set(s => ({ sort: { ...s.sort, ...sort } })),

      // Selection
      setSelectedTaskIds: (ids) => set({ selectedTaskIds: ids }),
      toggleTaskSelection: (id) =>
        set(s => ({
          selectedTaskIds: s.selectedTaskIds.includes(id)
            ? s.selectedTaskIds.filter(i => i !== id)
            : [...s.selectedTaskIds, id],
        })),
      clearSelection: () => set({ selectedTaskIds: [] }),

      // UI
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setOnboardingDone: () => set({ onboardingDone: true }),
      setFocusModeTaskId: (id) => set({ focusModeTaskId: id }),

      // Pomodoro
      startPomodoro: (taskId) =>
        set(s => ({
          pomodoro: { ...s.pomodoro, isRunning: true, taskId, timeRemaining: s.pomodoro.workDuration * 60, sessionType: 'work' },
        })),
      stopPomodoro: () => set(s => ({ pomodoro: { ...s.pomodoro, isRunning: false } })),
      tickPomodoro: () =>
        set(s => {
          const p = s.pomodoro;
          if (!p.isRunning) return s;
          if (p.timeRemaining <= 1) {
            if (p.sessionType === 'work') {
              // Switch to break
              const task = s.tasks.find(t => t.id === p.taskId);
              const newActual = task ? (task.actualTime || 0) + p.workDuration : 0;
              return {
                pomodoro: { ...p, timeRemaining: p.breakDuration * 60, sessionType: 'break' as const, sessionsCompleted: p.sessionsCompleted + 1 },
                tasks: s.tasks.map(t => t.id === p.taskId ? { ...t, actualTime: newActual } : t),
              };
            } else {
              // Break done, stop
              return { pomodoro: { ...p, isRunning: false, timeRemaining: p.workDuration * 60, sessionType: 'work' as const } };
            }
          }
          return { pomodoro: { ...p, timeRemaining: p.timeRemaining - 1 } };
        }),
      resetPomodoro: () => set({ pomodoro: defaultPomodoro }),

      // Activity
      logActivity: (entry) =>
        set(s => ({
          activityLog: [
            { ...entry, id: createId(), timestamp: new Date().toISOString() },
            ...s.activityLog,
          ].slice(0, 50),
        })),
    }),
    {
      name: 'smart-todo-planner',
      partialize: (state) => ({
        tasks: state.tasks,
        theme: state.theme,
        onboardingDone: state.onboardingDone,
        activityLog: state.activityLog,
        sort: state.sort,
      }),
    }
  )
);
