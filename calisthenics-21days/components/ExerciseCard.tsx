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
      {/* GIF */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        <img
          src={exercise.gif}
          alt={exercise.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{exercise.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{exercise.description}</p>

        {/* Timer */}
        <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
          </div>
          <p className="text-xs text-gray-600 mt-1">Tempo restante</p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {isRunning ? "⏸ Pausar" : "▶ Iniciar"}
          </button>
          {timeLeft === 0 && (
            <button
              onClick={onComplete}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              ✓ Próximo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
