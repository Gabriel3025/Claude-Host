"use client";

import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check localStorage first
    const stored = localStorage.getItem("theme");

    // Fallback to system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Determine initial theme
    const initial = (stored || (prefersDark ? "dark" : "light")) as "light" | "dark";

    setTheme(initial);

    // Apply to document
    const html = document.documentElement;
    if (initial === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const next = theme === "dark" ? "light" : "dark";

    setTheme(next);
    localStorage.setItem("theme", next);

    if (next === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  };

  return { theme, toggleTheme, mounted };
}
