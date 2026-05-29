"use client";

import Link from "next/link";
import { useState } from "react";

interface DayCardProps {
  dayNumber: number;
  isCompleted: boolean;
  isCurrent: boolean;
  onUndo?: (dayNumber: number) => void;
}

export function DayCard({ dayNumber, isCompleted, isCurrent, onUndo }: DayCardProps) {
  const [isUndoing, setIsUndoing] = useState(false);

  const handleUndo = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!onUndo) return;

    setIsUndoing(true);
    await onUndo(dayNumber);
    setIsUndoing(false);
  };

  // Only allow clicking if completed or is current day
  const isClickable = isCompleted || isCurrent;

  const cardContent = (
    <div
      className={`rounded-lg border-2 p-4 transition-all transform ${
        isClickable ? "cursor-pointer hover:scale-105" : "cursor-not-allowed opacity-60"
      } ${
        isCompleted
          ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
          : isCurrent
            ? "border-orange-500 bg-orange-50 shadow-lg dark:bg-[var(--bg-elevated)] dark:border-[var(--accent)] dark:shadow-lg"
            : "border-[var(--border)] bg-[var(--bg-card)] dark:bg-[var(--bg-card)]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Dia {dayNumber}</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {dayNumber === 14 ? "Descanso relativo" : "~15 minutos"}
          </p>
        </div>
        <div className="text-3xl">
          {isCompleted ? "✅" : isCurrent ? "🎯" : "🔒"}
        </div>
      </div>

      {isCurrent && (
        <div className="mt-3 bg-orange-200 text-orange-800 dark:bg-[var(--accent)] dark:text-black text-xs font-semibold px-2 py-1 rounded-full inline-block">
          Começar agora
        </div>
      )}

      {!isClickable && !isCompleted && (
        <div className="mt-3 text-xs text-[var(--text-secondary)] italic">
          Complete os dias anteriores para desbloquear
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      {isClickable ? (
        <Link href={`/day/${dayNumber}`}>
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}

      {isCompleted && onUndo && (
        <button
          onClick={handleUndo}
          disabled={isUndoing}
          className="absolute -top-2 -right-2 bg-gray-400 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-md"
          title="Desfazer este dia"
        >
          {isUndoing ? "⟳" : "↶"}
        </button>
      )}
    </div>
  );
}
