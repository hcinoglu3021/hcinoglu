import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isThisWeek,
  isThisMonth,
  startOfDay,
  addDays,
  addWeeks,
  addMonths,
  parseISO,
  differenceInDays,
  isBefore,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns';
import type { Recurrence } from '../types';

export function formatDate(date: string | null): string {
  if (!date) return '';
  const d = parseISO(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';
  if (isThisWeek(d)) return format(d, 'EEEE');
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: string | null): string {
  if (!date) return '';
  return format(parseISO(date), 'MMM d, yyyy h:mm a');
}

export function formatTime(time: string | null): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'completed') return false;
  return isBefore(startOfDay(parseISO(dueDate)), startOfDay(new Date()));
}

export function isDueToday(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return isToday(parseISO(dueDate));
}

export function isDueThisWeek(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return isThisWeek(parseISO(dueDate), { weekStartsOn: 1 });
}

export function isDueThisMonth(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return isThisMonth(parseISO(dueDate));
}

export function getNextRecurrenceDate(dueDate: string, recurrence: Recurrence): string {
  const d = parseISO(dueDate);
  switch (recurrence) {
    case 'daily': return addDays(d, 1).toISOString().split('T')[0];
    case 'weekly': return addWeeks(d, 1).toISOString().split('T')[0];
    case 'monthly': return addMonths(d, 1).toISOString().split('T')[0];
    default: return dueDate;
  }
}

export function getDaysUntilDue(dueDate: string | null): number | null {
  if (!dueDate) return null;
  return differenceInDays(parseISO(dueDate), startOfDay(new Date()));
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export { isToday, isTomorrow, isPast, isThisWeek, parseISO, format, isSameDay, startOfDay, addDays, addWeeks, addMonths, isBefore };
