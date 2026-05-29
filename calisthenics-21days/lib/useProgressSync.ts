"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const PROGRESS_KEY = "calisthenics-21days-progress";

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

          const { data: progressData } = await supabase
            .from("progress")
            .select("day")
            .eq("user_id", currentUserId);

          if (progressData) {
            const days = progressData.map((p) => p.day);
            setCompletedDays(new Set(days));
          } else {
            const stored = localStorage.getItem(PROGRESS_KEY);
            if (stored) {
              try {
                const days = JSON.parse(stored);
                setCompletedDays(new Set(days));
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
              setCompletedDays(new Set(days));
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
            setCompletedDays(new Set(days));
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
    const updated = new Set(completedDays);
    updated.add(dayNumber);
    setCompletedDays(updated);

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(updated)));

    if (userId) {
      try {
        await supabase.from("progress").insert({
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

    if (userId) {
      try {
        await supabase
          .from("progress")
          .delete()
          .eq("user_id", userId)
          .eq("day", dayNumber);
      } catch (error) {
        console.error("Error undoing day:", error);
      }
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
