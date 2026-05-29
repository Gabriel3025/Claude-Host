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
      // Create a deterministic password from email
      // This ensures the same password is used if user exists
      const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      const password = hashHex.substring(0, 32);

      // Try to sign up
      await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // No email confirmation
        },
      });

      // Try to sign in (works whether user was just created or already existed)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
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
