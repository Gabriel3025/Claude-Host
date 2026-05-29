"use client";

import { Exercise } from "@/lib/exercises";
import { useState } from "react";

interface ExerciseCardProps {
  exercise: Exercise;
  isActive: boolean;
  onComplete: () => void;
}

export function ExerciseCard({ exercise, isActive, onComplete }: ExerciseCardProps) {
  const [completedSets, setCompletedSets] = useState<Set<number>>(new Set());

  const allSetsCompleted = completedSets.size === exercise.sets;

  const toggleSet = (index: number) => {
    const updated = new Set(completedSets);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    setCompletedSets(updated);
  };

  const handleNext = () => {
    setCompletedSets(new Set());
    onComplete();
  };

  const handleSkip = () => {
    setCompletedSets(new Set());
    onComplete();
  };

  return (
    <div
      className={`rounded-lg border-2 overflow-hidden transition-all ${
        isActive
          ? "border-orange-500 bg-orange-50 dark:bg-[var(--bg-elevated)] dark:border-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--bg-card)]"
      }`}
    >
      {/* Header with GIF and Info */}
      <div className="flex gap-4 p-4 items-start">
        {/* GIF */}
        <div className="relative w-24 h-24 bg-[var(--bg-elevated)] rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={exercise.gif}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Exercise Info */}
        <div className="flex-1">
          <h3 className="text-base font-bold text-[var(--text-primary)]">{exercise.name}</h3>
          <p className="text-sm font-semibold text-[var(--accent)] mt-1">
            {exercise.sets}x{exercise.reps}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{exercise.description}</p>
        </div>
      </div>

      {/* Progress and Controls */}
      <div className="px-4 pb-4">
        {/* Series Counter */}
        <div className="mb-4 text-center">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {completedSets.size}/{exercise.sets} séries concluídas
          </p>
        </div>

        {/* Series Pills */}
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {Array.from({ length: exercise.sets }, (_, i) => (
            <button
              key={i}
              onClick={() => toggleSet(i)}
              className={`
                w-10 h-10 rounded-full font-semibold text-sm transition-all transform hover:scale-110
                ${
                  completedSets.has(i)
                    ? "bg-green-500 text-white border-2 border-green-600 shadow-md dark:bg-green-600 dark:border-green-500"
                    : "bg-gray-200 text-gray-700 border-2 border-gray-300 hover:bg-gray-300 dark:bg-[var(--bg-elevated)] dark:text-[var(--text-secondary)] dark:border-[var(--border)] dark:hover:bg-[var(--border)]"
                }
              `}
            >
              {completedSets.has(i) ? "✓" : i + 1}
            </button>
          ))}
        </div>

        {/* Series Details */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-[var(--bg-elevated)] dark:to-[var(--bg-elevated)] rounded-lg p-3 mb-4 text-center border border-orange-200 dark:border-[var(--border)]">
          <p className="text-xs text-gray-700 dark:text-[var(--text-secondary)] font-medium">
            {exercise.reps} repetições • {exercise.restTime}s descanso
          </p>
          {allSetsCompleted && (
            <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">✓ Exercício Completo!</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {allSetsCompleted ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
            >
              ▶ Próximo Exercício
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="flex-1 bg-gray-500 hover:bg-gray-600 dark:bg-[var(--bg-elevated)] dark:hover:bg-[var(--border)] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
            >
              ⊘ Pular Exercício
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
