import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function usePomodoro() {
  const pomodoro = useStore(s => s.pomodoro);
  const tick = useStore(s => s.tickPomodoro);

  useEffect(() => {
    if (!pomodoro.isRunning) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [pomodoro.isRunning, tick]);

  return pomodoro;
}
