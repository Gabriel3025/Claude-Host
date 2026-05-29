"use client";

import { Exercise } from "@/lib/exercises";
import { useEffect, useState } from "react";

interface ExerciseCardProps {
  exercise: Exercise;
  isActive: boolean;
  onComplete: () => void;
}

export function ExerciseCard({ exercise, isActive, onComplete }: ExerciseCardProps) {
  const [timeLeft, setTimeLeft] = useState(exercise.duration * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div
      className={`rounded-lg border-2 overflow-hidden transition-all ${
        isActive ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white"
      }`}
    >
      {/* Header with GIF and Info */}
      <div className="flex gap-4 p-4 items-start">
        {/* GIF - Smaller */}
        <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={exercise.gif}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Exercise Info */}
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-800">{exercise.name}</h3>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{exercise.description}</p>
        </div>
      </div>

      {/* Timer and Controls */}
      <div className="px-4 pb-4">
        {/* Timer */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-3 mb-3 text-center border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">
            {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
          </div>
          <p className="text-xs text-gray-600 mt-0.5">Tempo restante</p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
          >
            {isRunning ? "⏸ Pausar" : "▶ Iniciar"}
          </button>
          {timeLeft === 0 && (
            <button
              onClick={onComplete}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
            >
              ✓ Próximo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
