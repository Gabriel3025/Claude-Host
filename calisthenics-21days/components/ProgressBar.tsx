"use client";

interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = (completed / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          Progresso: {completed}/{total} dias
        </span>
        <span className="text-sm font-bold text-[var(--accent)]">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full rounded-full h-4 overflow-hidden" style={{ backgroundColor: "var(--bg-elevated)" }}>
        <div
          className="bg-gradient-to-r from-orange-500 to-red-600 dark:from-[var(--gold)] dark:to-[var(--accent)] h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
