# Smart Todo Planner

A modern, full-featured personal task management web application built with React, TypeScript, and Tailwind CSS.

## Features

- **Full Task Management** — Create, read, update, delete tasks with rich metadata (priority, status, due dates, categories, tags, estimated/actual time, notes, recurrence)
- **Subtasks** — Nested subtasks with progress tracking
- **Multiple Views** — Dashboard, All Tasks, Today, Upcoming, Completed, Projects, Priority, Calendar, Kanban Board, Focus Mode, Analytics
- **Kanban Board** — Drag-and-drop tasks between status columns
- **Pomodoro Timer** — Built-in focus timer linked to tasks
- **Focus Mode** — Select a high-priority task and work on it with the Pomodoro timer
- **Calendar View** — Monthly calendar with task indicators
- **Search & Filter** — Live search across all task fields, filter by status/priority/category/tags/dates/recurrence
- **Sorting** — Sort by due date, priority, created date, alphabetical, or manual order
- **Bulk Actions** — Select multiple tasks for bulk archive or delete
- **Recurring Tasks** — Daily, weekly, monthly recurrence with automatic regeneration
- **Dark/Light Mode** — Theme toggle with persistence
- **Analytics** — Charts showing completion trends, priority breakdown, category distribution, streak tracking
- **Import/Export** — JSON export and import for backups
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Onboarding** — First-run welcome with optional sample data

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS v4** (styling)
- **React Router v7** (routing)
- **Zustand** (state management with localStorage persistence)
- **date-fns** (date utilities)
- **Recharts** (analytics charts)
- **@dnd-kit** (drag and drop)

## Getting Started

```bash
cd smart-todo-planner

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── BulkActions.tsx
│   ├── CategoryBadge.tsx
│   ├── ConfirmDialog.tsx
│   ├── EmptyState.tsx
│   ├── FilterPanel.tsx
│   ├── Onboarding.tsx
│   ├── PomodoroTimer.tsx
│   ├── PriorityBadge.tsx
│   ├── QuickAddBar.tsx
│   ├── SearchBar.tsx
│   ├── Sidebar.tsx
│   ├── StatusBadge.tsx
│   ├── SubtaskList.tsx
│   ├── TaskCard.tsx
│   ├── TaskForm.tsx
│   ├── TaskList.tsx
│   ├── ThemeToggle.tsx
│   └── ToastContainer.tsx
├── data/             # Sample data
├── hooks/            # Custom React hooks
├── pages/            # Route pages/views
├── store/            # Zustand store
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Assumptions

- Data is persisted in localStorage (no backend required)
- Drag-and-drop in Kanban moves tasks between status columns
- Recurring tasks regenerate a new task when completed
- Pomodoro timer tracks actual time spent on tasks

## Future Improvements

- Backend API integration (REST or GraphQL)
- User authentication and multi-device sync
- Push notification reminders
- Drag-and-drop reordering in list views
- Keyboard shortcuts
- Task dependencies and Gantt chart view
- Collaboration features (shared projects, comments)
- Mobile native app (React Native)
