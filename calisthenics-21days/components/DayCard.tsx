"use client";

import Link from "next/link";

interface DayCardProps {
  dayNumber: number;
  totalDuration: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

export function DayCard({ dayNumber, totalDuration, isCompleted, isCurrent }: DayCardProps) {
  return (
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
            <p className="text-sm text-gray-600">{totalDuration} minutos</p>
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
  );
}
