import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import Onboarding from './components/Onboarding';
import DashboardPage from './pages/DashboardPage';
import AllTasksPage from './pages/AllTasksPage';
import TodayPage from './pages/TodayPage';
import UpcomingPage from './pages/UpcomingPage';
import CompletedPage from './pages/CompletedPage';
import ProjectsPage from './pages/ProjectsPage';
import PriorityPage from './pages/PriorityPage';
import CalendarPage from './pages/CalendarPage';
import KanbanPage from './pages/KanbanPage';
import FocusPage from './pages/FocusPage';
import AnalyticsPage from './pages/AnalyticsPage';

function AppLayout() {
  const theme = useStore(s => s.theme);
  const onboardingDone = useStore(s => s.onboardingDone);
  const setSidebarOpen = useStore(s => s.setSidebarOpen);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {!onboardingDone && <Onboarding />}
      <Sidebar />

      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/80 dark:border-gray-800/80 px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Smart Todo</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tasks" element={<AllTasksPage />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/upcoming" element={<UpcomingPage />} />
            <Route path="/completed" element={<CompletedPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/priority" element={<PriorityPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
