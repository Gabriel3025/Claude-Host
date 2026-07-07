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

  const derivePassword = async (email: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${email.toLowerCase().trim()}calisthenics-21-days`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const loginWithEmail = async (email: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const password = await derivePassword(normalizedEmail);

      const ensureRes = await fetch("/api/auth/ensure-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (!ensureRes.ok) {
        const body = await ensureRes.json().catch(() => ({}));
        throw new Error(body.error || "Erro ao preparar conta");
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) throw signInError;

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao fazer login:", error.message);
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
