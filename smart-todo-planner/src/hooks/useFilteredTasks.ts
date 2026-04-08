import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { sortTasks, searchTasks } from '../utils/helpers';
import { isOverdue, isDueToday, isDueThisWeek, isDueThisMonth } from '../utils/dates';
import type { Task } from '../types';

export function useFilteredTasks(overrideTasks?: Task[]) {
  const tasks = useStore(s => s.tasks);
  const filter = useStore(s => s.filter);
  const sort = useStore(s => s.sort);

  return useMemo(() => {
    let result = overrideTasks ?? tasks.filter(t => !t.archived);

    // Search
    if (filter.search) {
      result = searchTasks(result, filter.search);
    }

    // Status
    if (filter.status !== 'all') {
      result = result.filter(t => t.status === filter.status);
    }

    // Priority
    if (filter.priority !== 'all') {
      result = result.filter(t => t.priority === filter.priority);
    }

    // Category
    if (filter.category !== 'all') {
      result = result.filter(t => t.category === filter.category);
    }

    // Tags
    if (filter.tags.length > 0) {
      result = result.filter(t => filter.tags.some(tag => t.tags.includes(tag)));
    }

    // Date range
    if (filter.dateRange === 'today') {
      result = result.filter(t => isDueToday(t.dueDate));
    } else if (filter.dateRange === 'this_week') {
      result = result.filter(t => isDueThisWeek(t.dueDate));
    } else if (filter.dateRange === 'this_month') {
      result = result.filter(t => isDueThisMonth(t.dueDate));
    } else if (filter.dateRange === 'overdue') {
      result = result.filter(t => isOverdue(t.dueDate, t.status));
    }

    // Completion
    if (filter.completion === 'completed') {
      result = result.filter(t => t.status === 'completed');
    } else if (filter.completion === 'incomplete') {
      result = result.filter(t => t.status !== 'completed');
    }

    // Recurrence
    if (filter.recurrence === 'recurring') {
      result = result.filter(t => t.recurrence !== 'none');
    } else if (filter.recurrence === 'non_recurring') {
      result = result.filter(t => t.recurrence === 'none');
    }

    // Sort
    result = sortTasks(result, sort.field, sort.direction);

    return result;
  }, [tasks, overrideTasks, filter, sort]);
}
