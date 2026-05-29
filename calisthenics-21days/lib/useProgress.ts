import { useEffect, useState } from "react";

const PROGRESS_KEY = "calisthenics-21days-progress";

export function useProgress() {
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      try {
        const days = JSON.parse(stored);
        setCompletedDays(new Set(days));
      } catch {
        setCompletedDays(new Set());
      }
    }
    setIsLoaded(true);
  }, []);

  const completeDay = (dayNumber: number) => {
    const updated = new Set(completedDays);
    updated.add(dayNumber);
    setCompletedDays(updated);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(updated)));
  };

  const resetProgress = () => {
    setCompletedDays(new Set());
    localStorage.removeItem(PROGRESS_KEY);
  };

  return {
    completedDays,
    completeDay,
    resetProgress,
    isLoaded,
  };
}
