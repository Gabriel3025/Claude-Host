"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ProgressBar } from "@/components/ProgressBar";
import { DayCard } from "@/components/DayCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EXERCISES_DATA } from "@/lib/exercises";
import { useProgressSync } from "@/lib/useProgressSync";

export default function Home() {
  const { completedDays, undoDay, resetProgress, isLoaded } = useProgressSync();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, weight, height")
          .eq("id", data.session.user.id)
          .single();

        setUser({
          email: data.session.user.email,
          id: data.session.user.id,
          name: profile?.name || data.session.user.email,
          weight: profile?.weight,
          height: profile?.height,
        });
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-gray-600">Carregando seu desafio...</p>
        </div>
      </div>
    );
  }

  const currentDay = Math.max(1, Math.min(21, completedDays.size + 1));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-[#1A1A1A] dark:to-[#0F0F0F] text-white py-12 px-4 shadow-lg dark:shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="Calistenia Asiática Logo"
                width={100}
                height={100}
                className="drop-shadow-lg"
                priority
              />
              <div>
                <h1 className="text-4xl font-bold mb-2">Desafio 21 Dias</h1>
                <p className="text-orange-100 dark:text-[var(--text-secondary)]">Calistenia Asiática - Sua Jornada Começou!</p>
                {user && <p className="text-orange-200 dark:text-[var(--text-secondary)] text-sm mt-2">Bem-vindo, {user.name}!</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="bg-white text-orange-600 hover:bg-orange-50 dark:bg-[var(--bg-card)] dark:text-[var(--accent)] dark:hover:bg-[var(--bg-elevated)] font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Section */}
        <div className="bg-[var(--bg-card)] dark:bg-[var(--bg-card)] rounded-lg shadow-md dark:shadow-lg p-6 mb-8 border border-[var(--border)]">
          <ProgressBar completed={completedDays.size} total={21} />
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border)]">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completedDays.size}</div>
              <p className="text-sm text-[var(--text-secondary)]">Dias Completos</p>
            </div>
            <div className="bg-orange-50 dark:bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border)]">
              <div className="text-2xl font-bold text-orange-600 dark:text-[var(--accent)]">{currentDay}</div>
              <p className="text-sm text-[var(--text-secondary)]">Dia Atual</p>
            </div>
            <div className="bg-red-50 dark:bg-[var(--bg-elevated)] rounded-lg p-4 border border-[var(--border)]">
              <div className="text-2xl font-bold text-red-600 dark:text-[var(--error)]">{21 - currentDay}</div>
              <p className="text-sm text-[var(--text-secondary)]">Faltam</p>
            </div>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {EXERCISES_DATA.map((day) => (
            <DayCard
              key={day.dayNumber}
              dayNumber={day.dayNumber}
              isCompleted={completedDays.has(day.dayNumber)}
              isCurrent={currentDay === day.dayNumber}
              onUndo={undoDay}
            />
          ))}
        </div>

        {/* Reset Button */}
        {completedDays.size > 0 && (
          <div className="text-center">
            <button
              onClick={() => {
                if (confirm("Tem certeza que deseja reiniciar o desafio?")) {
                  resetProgress();
                }
              }}
              className="bg-gray-500 hover:bg-gray-600 dark:bg-[var(--bg-elevated)] dark:hover:bg-[var(--border)] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              🔄 Reiniciar Desafio
            </button>
          </div>
        )}

        {/* Completion Message */}
        {completedDays.size === 21 && (
          <div className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-[var(--gold)] dark:to-[var(--accent)] text-white rounded-lg p-8 text-center shadow-lg dark:shadow-xl">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-2">PARABÉNS!</h2>
            <p className="text-lg mb-4">Você completou os 21 dias de Calistenia Asiática!</p>
            <p className="text-sm opacity-90">
              Você é um campeão! Continue praticando e superando seus limites!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 dark:bg-[var(--bg-elevated)] text-center py-6 mt-12 text-[var(--text-secondary)] text-sm border-t border-[var(--border)]">
        <p>💪 Força, Determinação e Consistência</p>
      </div>
    </div>
  );
}
