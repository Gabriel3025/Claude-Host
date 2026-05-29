"use client";

import { Exercise } from "@/lib/exercises";
import { useState } from "react";

interface ExerciseCardProps {
  exercise: Exercise;
  isActive: boolean;
  onComplete: () => void;
}

export function ExerciseCard({ exercise, isActive, onComplete }: ExerciseCardProps) {
  const [completedSets, setCompletedSets] = useState(0);

  const allSetsCompleted = completedSets >= exercise.sets;

  const handleCompleteSet = () => {
    const newCompleted = completedSets + 1;
    if (newCompleted < exercise.sets) {
      setCompletedSets(newCompleted);
    } else {
      setCompletedSets(newCompleted);
    }
  };

  const handleNext = () => {
    setCompletedSets(0);
    onComplete();
  };

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
          <p className="text-sm font-semibold text-orange-600 mt-1">
            {exercise.sets}x{exercise.reps}
          </p>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{exercise.description}</p>
        </div>
      </div>

      {/* Progress and Controls */}
      <div className="px-4 pb-4">
        {/* Series Progress */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-3 mb-3 text-center border border-orange-200">
          {!allSetsCompleted ? (
            <>
              <div className="text-2xl font-bold text-orange-600">
                Série {completedSets + 1}/{exercise.sets}
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                {exercise.reps} repetições • Descanso: {exercise.restTime}s
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-green-600">✓ Completo!</div>
              <p className="text-xs text-gray-600 mt-0.5">
                Todas as {exercise.sets} séries realizadas
              </p>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!allSetsCompleted && (
            <button
              onClick={handleCompleteSet}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
            >
              ✓ Série {completedSets + 1} Completa
            </button>
          )}
          {allSetsCompleted && (
            <button
              onClick={handleNext}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
            >
              ▶ Próximo Exercício
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
