"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ProgressBar } from "@/components/ProgressBar";
import { DayCard } from "@/components/DayCard";
import { EXERCISES_DATA } from "@/lib/exercises";
import { useProgressSync } from "@/lib/useProgressSync";

export default function Home() {
  const { completedDays, resetProgress, isLoaded } = useProgressSync();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.session.user.id)
          .single();
        setUser(profile);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">🥋 Desafio 21 Dias</h1>
              <p className="text-orange-100">Calistenia Asiática - Sua Jornada Começou!</p>
              {user && <p className="text-orange-200 text-sm mt-2">Bem-vindo, {user.name}!</p>}
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-orange-600 hover:bg-orange-50 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <ProgressBar completed={completedDays.size} total={21} />
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{completedDays.size}</div>
              <p className="text-sm text-gray-600">Dias Completos</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">{currentDay}</div>
              <p className="text-sm text-gray-600">Dia Atual</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{21 - currentDay}</div>
              <p className="text-sm text-gray-600">Faltam</p>
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
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              🔄 Reiniciar Desafio
            </button>
          </div>
        )}

        {/* Completion Message */}
        {completedDays.size === 21 && (
          <div className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg p-8 text-center shadow-lg">
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
      <div className="bg-gray-100 text-center py-6 mt-12 text-gray-600 text-sm">
        <p>💪 Força, Determinação e Consistência</p>
      </div>
    </div>
  );
}
