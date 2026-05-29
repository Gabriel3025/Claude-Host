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
      // Create deterministic password from email
      const encoder = new TextEncoder();
      const data = encoder.encode(email + "calisthenics21");
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      // Create strong password: Uppercase + Lowercase + Numbers + Special chars
      const password = "Cal" + hashHex.substring(0, 25) + "!#$";

      console.log("Attempting signup with:", { email, password: password.substring(0, 10) + "..." });

      // Try signup first
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
        },
      });

      if (signupError && signupError.message !== "User already registered") {
        console.error("Signup error:", signupError);
      }

      // Now try signin (works for both new and existing users)
      const { error: signinError, data: signinData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Signin result:", { signinError, hasSession: !!signinData?.session });

      if (signinError) {
        throw signinError;
      }

      return { success: true };
    } catch (error: any) {
      console.error("Login error details:", error);
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
