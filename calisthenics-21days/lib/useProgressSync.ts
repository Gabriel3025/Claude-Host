"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const PROGRESS_KEY = "calisthenics-21days-progress";

// Sanitize progress: only keep contiguous sequence from day 1
function sanitizeProgress(days: number[]): number[] {
  const sorted = [...days].sort((a, b) => a - b);
  const contiguous: number[] = [];

  for (let i = 1; i <= 21; i++) {
    if (sorted.includes(i)) {
      contiguous.push(i);
    } else {
      break; // Stop at first gap
    }
  }

  return contiguous;
}

export function useProgressSync() {
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initProgress = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const currentUserId = data?.session?.user?.id;

        if (currentUserId) {
          setUserId(currentUserId);

          const { data: progressData } = await (supabase as any)
            .from("progress")
            .select("day")
            .eq("user_id", currentUserId);

          if (progressData) {
            const days = (progressData as any[]).map((p) => p.day);
            const sanitized = sanitizeProgress(days);
            setCompletedDays(new Set(sanitized));
          } else {
            const stored = localStorage.getItem(PROGRESS_KEY);
            if (stored) {
              try {
                const days = JSON.parse(stored);
                const sanitized = sanitizeProgress(days);
                setCompletedDays(new Set(sanitized));
              } catch {
                setCompletedDays(new Set());
              }
            }
          }
        } else {
          const stored = localStorage.getItem(PROGRESS_KEY);
          if (stored) {
            try {
              const days = JSON.parse(stored);
              const sanitized = sanitizeProgress(days);
              setCompletedDays(new Set(sanitized));
            } catch {
              setCompletedDays(new Set());
            }
          }
        }
      } catch (error) {
        console.error("Error loading progress:", error);
        const stored = localStorage.getItem(PROGRESS_KEY);
        if (stored) {
          try {
            const days = JSON.parse(stored);
            const sanitized = sanitizeProgress(days);
            setCompletedDays(new Set(sanitized));
          } catch {
            setCompletedDays(new Set());
          }
        }
      } finally {
        setIsLoaded(true);
      }
    };

    initProgress();
  }, []);

  const completeDay = async (dayNumber: number) => {
    // Calculate what the current day should be
    let expectedCurrentDay = 1;
    for (let i = 1; i <= 21; i++) {
      if (completedDays.has(i)) {
        expectedCurrentDay = i + 1;
      } else {
        break;
      }
    }
    if (expectedCurrentDay > 21) expectedCurrentDay = 21;

    // Only allow completing the next day in sequence
    if (dayNumber !== expectedCurrentDay) {
      console.warn(`Cannot complete day ${dayNumber}. Next day to complete is ${expectedCurrentDay}`);
      return;
    }

    const updated = new Set(completedDays);
    updated.add(dayNumber);
    setCompletedDays(updated);

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(updated)));

    if (userId) {
      try {
        await (supabase as any).from("progress").insert({
          user_id: userId,
          day: dayNumber,
        });
      } catch (error) {
        console.error("Error saving progress to Supabase:", error);
      }
    }
  };

  const undoDay = async (dayNumber: number) => {
    const updated = new Set(completedDays);
    updated.delete(dayNumber);
    setCompletedDays(updated);

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(updated)));

    // Get current user session to ensure userId is available
    const { data } = await supabase.auth.getSession();
    const currentUserId = data?.session?.user?.id;

    if (currentUserId) {
      try {
        const { error } = await supabase
          .from("progress")
          .delete()
          .eq("user_id", currentUserId)
          .eq("day", dayNumber);

        if (error) {
          console.error("Error undoing day:", error);
          // Revert local state if delete failed
          const reverted = new Set(completedDays);
          reverted.add(dayNumber);
          setCompletedDays(reverted);
        } else {
          console.log(`Successfully undid day ${dayNumber}`);
        }
      } catch (error) {
        console.error("Error undoing day:", error);
        // Revert local state if delete failed
        const reverted = new Set(completedDays);
        reverted.add(dayNumber);
        setCompletedDays(reverted);
      }
    } else {
      console.warn("No user session found for undo operation");
    }
  };

  const resetProgress = async () => {
    setCompletedDays(new Set());
    localStorage.removeItem(PROGRESS_KEY);

    if (userId) {
      try {
        await supabase.from("progress").delete().eq("user_id", userId);
      } catch (error) {
        console.error("Error resetting progress in Supabase:", error);
      }
    }
  };

  return {
    completedDays,
    completeDay,
    undoDay,
    resetProgress,
    isLoaded,
  };
}
