"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { loginWithEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const result = await loginWithEmail(email);

    if (result.success) {
      // Wait for session to be saved
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Force refresh session
      const { data } = await supabase.auth.refreshSession();

      console.log("📋 Session after refresh:", data?.session?.user?.email);

      if (data?.session?.user) {
        console.log("✅ Usuário autenticado, verificando perfil...");

        // Small delay to ensure database is ready
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.session.user.id)
          .single();

        console.log("📝 Perfil encontrado:", profile ? "sim" : "não");

        if (profile) {
          console.log("➡️ Redirecionando para dashboard...");
          router.push("/");
        } else {
          console.log("➡️ Redirecionando para preencher dados...");
          router.push("/auth/profile");
        }
      } else {
        console.log("⚠️ Sem sessão após login");
        setError("Sessão não foi criada");
      }
    } else {
      setError(result.error || "Erro ao criar conta");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🥋</div>
            <h1 className="text-3xl font-bold text-gray-800">Desafio 21 Dias</h1>
            <p className="text-gray-600 mt-2">Calistenia Asiática</p>
          </div>

          {/* Form */}
          {!message ? (
            <>
              <p className="text-center text-gray-600 mb-6">
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
                >
                  {loading ? "Enviando..." : "Continuar com Email"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <p className="text-gray-700 mb-4">{message}</p>
              <p className="text-sm text-gray-600 mb-6">
                Clique no link do email para verificar sua conta e continuar o cadastro.
              </p>
              <button
                onClick={() => setMessage("")}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                ← Usar outro email
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>💪 Força, Determinação e Consistência</p>
          </div>
        </div>
      </div>
    </div>
  );
}
