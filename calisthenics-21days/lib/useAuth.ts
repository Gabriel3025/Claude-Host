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
        if (data?.session?.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.session.user.id)
            .single();
          setUser(profile || { id: data.session.user.id, email: data.session.user.email });
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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
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
