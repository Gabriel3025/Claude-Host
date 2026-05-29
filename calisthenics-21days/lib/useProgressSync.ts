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
        // Get current user
        const { data } = await supabase.auth.getSession();
        const currentUserId = data?.session?.user?.id;

        if (currentUserId) {
          setUserId(currentUserId);

          // Try to load from Supabase first
          const { data: progressData, error } = await supabase
            .from("user_progress")
            .select("completed_days")
            .eq("user_id", currentUserId)
            .single();

          if (progressData && !error) {
            setCompletedDays(new Set(progressData.completed_days || []));
          } else {
            // Fallback to localStorage
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
          // No user, just use localStorage
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
        // Fallback to localStorage
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

    // Save to localStorage
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(updated)));

    // Save to Supabase if user is logged in
    if (userId) {
      try {
        await supabase
          .from("user_progress")
          .upsert(
            {
              user_id: userId,
              completed_days: Array.from(updated),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
      } catch (error) {
        console.error("Error saving progress to Supabase:", error);
      }
    }
  };

  const resetProgress = async () => {
    setCompletedDays(new Set());
    localStorage.removeItem(PROGRESS_KEY);

    if (userId) {
      try {
        await supabase
          .from("user_progress")
          .update({
            completed_days: [],
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      } catch (error) {
        console.error("Error resetting progress in Supabase:", error);
      }
    }
  };

  return {
    completedDays,
    completeDay,
    resetProgress,
    isLoaded,
  };
}
