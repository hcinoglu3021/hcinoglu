import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import TaskList from '../components/TaskList';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday,
} from 'date-fns';

export default function CalendarPage() {
  const tasks = useStore(s => s.tasks);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
    });
  }, [currentMonth]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    tasks.filter(t => !t.archived && t.dueDate).forEach(t => {
      const key = t.dueDate!;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  }, [tasks]);

  const selectedTasks = useMemo(() => {
    const key = format(selectedDate, 'yyyy-MM-dd');
    return tasksByDate.get(key) || [];
  }, [selectedDate, tasksByDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Calendar</h1>
      </div>

      <div className="bg-white dark:bg-gray-800/80 rounded-xl border border-gray-200/80 dark:border-gray-700/60 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Previous month">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }} className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline font-medium">Today</button>
          </div>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Next month">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 text-center py-2 uppercase tracking-wider">{day}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-700/40 rounded-lg overflow-hidden">
          {calendarDays.map(day => {
            const key = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate.get(key) || [];
            const inMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const today = isToday(day);
            const hasComplete = dayTasks.some(t => t.status === 'completed');
            const hasIncomplete = dayTasks.some(t => t.status !== 'completed');

            return (
              <button
                key={key}
                onClick={() => setSelectedDate(day)}
                aria-label={`${format(day, 'MMMM d, yyyy')}, ${dayTasks.length} tasks`}
                className={`relative py-2 px-1 text-sm transition-colors bg-white dark:bg-gray-800/80 min-h-[44px] flex flex-col items-center ${
                  isSelected
                    ? 'bg-primary-50 dark:bg-primary-900/20 z-10 ring-1 ring-primary-400'
                    : today
                    ? 'bg-primary-50/50 dark:bg-primary-900/10'
                    : !inMonth
                    ? 'opacity-30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                }`}
              >
                <span className={`text-xs tabular-nums leading-none ${
                  isSelected ? 'font-bold text-primary-700 dark:text-primary-300' :
                  today ? 'font-bold text-primary-600 dark:text-primary-400' :
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  {format(day, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {hasIncomplete && <span className="w-1 h-1 rounded-full bg-primary-500" />}
                    {hasComplete && <span className="w-1 h-1 rounded-full bg-emerald-500" />}
                    {dayTasks.length > 2 && <span className="text-[8px] text-gray-400 leading-none">+{dayTasks.length - 1}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date tasks */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2.5">
          {format(selectedDate, 'EEEE, MMMM d')}
          <span className="text-gray-400 font-medium ml-1">({selectedTasks.length})</span>
        </h2>
        <TaskList tasks={selectedTasks} emptyTitle="No tasks on this day" emptyDescription="Click a date to see its tasks." />
      </section>
    </div>
  );
}
