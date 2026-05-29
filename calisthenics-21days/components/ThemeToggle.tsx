"use client";

import { useTheme } from "@/lib/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg bg-white dark:bg-[var(--bg-elevated)] text-gray-700 dark:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-[var(--bg-card)] transition-colors flex items-center justify-center"
      title={`Mudar para modo ${theme === "dark" ? "claro" : "escuro"}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
