"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  weight?: number;
  height?: number;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user?.id) {
          setUser({ id: data.session.user.id, email: data.session.user.email || "" });
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, []);

  const loginWithEmail = async (email: string) => {
    try {
      console.log("🔐 Tentando login para:", email);

      // Generate deterministic password from email
      const encoder = new TextEncoder();
      const emailData = encoder.encode(email + "calisthenics-21-days");
      const hashBuffer = await crypto.subtle.digest("SHA-256", emailData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      const password = "Calisthenics1" + hashHex.substring(0, 19);

      // Try signin first
      console.log("🔑 Tentando signin...");
      let { error: signinError, data: signinData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If user doesn't exist, create it
      if (signinError?.message?.includes("Invalid login credentials")) {
        console.log("👤 Usuário não encontrado. Criando...");

        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signupError) {
          console.error("❌ Erro ao criar:", signupError.message);
          throw signupError;
        }

        console.log("✅ Usuário criado. Aguardando confirmação...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try signin again
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (result.error) {
          console.error("❌ Erro ao fazer signin após criar:", result.error.message);
          throw result.error;
        }

        signinData = result.data;
      } else if (signinError) {
        console.error("❌ Erro no signin:", signinError.message);
        throw signinError;
      }

      if (signinData?.session?.user) {
        console.log("✅ Login bem-sucedido!");
        return { success: true };
      }

      console.log("⚠️ Sem erro, mas sem sessão. Aguardando...");
      return { success: true };

    } catch (error: any) {
      console.error("❌ Erro final:", error.message);
      return { success: false, error: error.message || "Erro ao fazer login" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    user,
    loading,
    loginWithEmail,
    logout,
  };
}
