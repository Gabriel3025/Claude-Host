"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data?.session?.user) {
          router.push("/auth");
        } else {
          setUser(data.session.user);
        }
      } catch (err) {
        console.error("Error getting user:", err);
        router.push("/auth");
      }
    };
    getUser();
  }, [router]);

  // Force dark mode on auth pages
  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    html.classList.add("dark");

    return () => {
      if (!wasDark) {
        html.classList.remove("dark");
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!user) throw new Error("User not found");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name,
          weight: parseFloat(weight),
          height: parseFloat(height),
          updated_at: new Date().toISOString(),
        } as any);

      if (error) throw error;

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Erro ao salvar dados");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F0F] to-[#0F0F0F] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[var(--bg-card)] rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📊</div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Seus Dados</h1>
            <p className="text-[var(--text-secondary)] mt-2">Próximo passo do desafio</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
                className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  required
                  className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="180"
                  required
                  className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name || !weight || !height}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 dark:from-[var(--accent)] dark:to-[var(--accent)] dark:hover:from-[#C49B2A] dark:hover:to-[#C49B2A] disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-black font-bold py-3 rounded-lg transition-all"
            >
              {loading ? "Salvando..." : "Começar o Desafio"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--text-secondary)]">
            <p>💪 Força, Determinação e Consistência</p>
          </div>
        </div>
      </div>
    </div>
  );
}
