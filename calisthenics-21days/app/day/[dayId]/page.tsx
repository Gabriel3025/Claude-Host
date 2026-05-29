"use client";

import { useParams, useRouter } from "next/navigation";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EXERCISES_DATA } from "@/lib/exercises";
import { useProgressSync } from "@/lib/useProgressSync";
import { useState } from "react";

export default function DayPage() {
  const params = useParams();
  const router = useRouter();
  const dayId = parseInt(params.dayId as string);
  const { completeDay, completedDays } = useProgressSync();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const day = EXERCISES_DATA.find((d) => d.dayNumber === dayId);

  if (!day) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-[var(--bg-base)] dark:to-[var(--bg-base)] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">Dia não encontrado</h1>
          <button
            onClick={() => router.push("/")}
            className="bg-orange-600 hover:bg-orange-700 dark:bg-[var(--accent)] dark:hover:bg-[#C49B2A] text-white dark:text-black font-semibold py-2 px-6 rounded-lg"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = completedDays.has(dayId);
  const currentExercise = day.exercises[currentExerciseIndex];

  const handleNextExercise = () => {
    if (currentExerciseIndex < day.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      completeDay(dayId);
      if (dayId < 21) {
        router.push(`/day/${dayId + 1}`);
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-[#1A1A1A] dark:to-[#0F0F0F] text-white py-8 px-4 shadow-lg dark:shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            ← Voltar
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Dia {dayId}</h1>
            <p className="text-orange-100 dark:text-[var(--text-secondary)]">~15 minutos de treino</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="text-2xl">{isCompleted ? "✅" : "🔄"}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-6 bg-[var(--bg-card)] rounded-lg shadow-md dark:shadow-lg p-4 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Exercício {currentExerciseIndex + 1} de {day.exercises.length}
            </span>
            <span className="text-sm font-semibold text-[var(--accent)]">
              {Math.round(((currentExerciseIndex + 1) / day.exercises.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-[var(--bg-elevated)] rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-600 dark:from-[var(--gold)] dark:to-[var(--accent)] h-full rounded-full transition-all"
              style={{ width: `${((currentExerciseIndex + 1) / day.exercises.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Exercise Card */}
        <ExerciseCard
          exercise={currentExercise}
          isActive={true}
          onComplete={handleNextExercise}
        />

        {/* Exercise List */}
        <div className="mt-8 bg-[var(--bg-card)] rounded-lg shadow-md dark:shadow-lg p-4 border border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Exercícios do Dia</h3>
          <div className="space-y-2">
            {day.exercises.map((exercise, index) => (
              <button
                key={exercise.id}
                onClick={() => setCurrentExerciseIndex(index)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  index === currentExerciseIndex
                    ? "bg-orange-100 dark:bg-[var(--bg-elevated)] border-2 border-orange-500 dark:border-[var(--accent)]"
                    : index < currentExerciseIndex
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700"
                      : "bg-[var(--bg-base)] dark:bg-[var(--bg-base)] border border-[var(--border)] hover:bg-gray-100 dark:hover:bg-[var(--bg-elevated)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {index < currentExerciseIndex ? "✅" : index === currentExerciseIndex ? "▶" : "○"}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--text-primary)]">{exercise.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{exercise.sets}x{exercise.reps} • {exercise.restTime}s descanso</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Day Completion */}
        {isCompleted && (
          <div className="mt-8 bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-600 dark:to-green-700 text-white rounded-lg p-6 text-center shadow-lg dark:shadow-xl">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-2xl font-bold mb-2">Dia {dayId} Completo!</h2>
            <p className="text-sm opacity-90 mb-4">Você é incrível! Continue assim!</p>
            <button
              onClick={() => {
                if (dayId < 21) {
                  router.push(`/day/${dayId + 1}`);
                } else {
                  router.push("/");
                }
              }}
              className="bg-white dark:bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-500 font-semibold py-2 px-6 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--bg-elevated)] transition-colors"
            >
              {dayId < 21 ? "→ Ir para Dia " + (dayId + 1) : "← Voltar ao Início"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
