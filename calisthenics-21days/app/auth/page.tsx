"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginWithEmail } = useAuth();
  const router = useRouter();

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

    const result = await loginWithEmail(email);

    if (result.success) {
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId as string)
        .single();

      router.push(profile ? "/" : "/auth/profile");
    } else {
      setError(result.error || "Erro ao fazer login");
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
            <div className="mb-6 flex justify-center">
              <img
                src="/logo.png"
                alt="Calistenia Asiática Logo"
                width={160}
                height={160}
                className="drop-shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Desafio 21 Dias</h1>
            <p className="text-[var(--text-secondary)] mt-2">Calistenia Asiática</p>
          </div>

          {/* Form */}
          <p className="text-center text-[var(--text-secondary)] mb-6">
            Insira seu email para começar o desafio
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] bg-[var(--bg-base)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 dark:from-[var(--accent)] dark:to-[var(--accent)] dark:hover:from-[#C49B2A] dark:hover:to-[#C49B2A] disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-black font-bold py-3 rounded-lg transition-all"
            >
              {loading ? "Entrando..." : "Continuar com Email"}
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
