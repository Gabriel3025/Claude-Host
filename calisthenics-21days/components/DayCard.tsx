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

  return (
    <>
      <Link href={`/day/${dayNumber}`}>
        <div
          className={`rounded-lg border-2 p-4 cursor-pointer transition-all transform hover:scale-105 ${
            isCompleted
              ? "border-green-500 bg-green-50"
              : isCurrent
                ? "border-orange-500 bg-orange-50 shadow-lg"
                : "border-gray-200 bg-white hover:border-orange-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Dia {dayNumber}</h3>
              <p className="text-sm text-gray-600">
                {dayNumber === 14 ? "Descanso relativo" : "~15 minutos"}
              </p>
            </div>
            <div className="text-3xl">
              {isCompleted ? "✅" : isCurrent ? "🎯" : "🔒"}
            </div>
          </div>

          {isCurrent && (
            <div className="mt-3 bg-orange-200 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full inline-block">
              Começar agora
            </div>
          )}
        </div>
      </Link>

      {isCompleted && onUndo && (
        <button
          onClick={handleUndo}
          disabled={isUndoing}
          className="w-full mt-2 bg-gray-400 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
        >
          {isUndoing ? "⟳ Desfazendo..." : "🔙 Desfazer"}
        </button>
      )}
    </>
  );
}
