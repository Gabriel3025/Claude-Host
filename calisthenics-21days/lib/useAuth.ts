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
      // Create deterministic password using a fixed salt
      // This ensures the same password is generated every time for the same email
      const encoder = new TextEncoder();

      // Use email + a fixed salt to ensure deterministic results
      const saltedEmail = email + "|calisthenics-21days-fixed-salt";
      const data = encoder.encode(saltedEmail);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      // Create password: uppercase + lowercase + numbers + first 20 hex chars
      // Pattern: Cap + lowercase + number + 20 hex = Aa1 + 20 chars = 23 chars total
      const password = "Pass1" + hashHex.substring(0, 18);

      console.log("Login attempt for:", email);

      // Try signup first
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: undefined },
      });

      if (signupError) {
        console.log("Signup result:", signupError.message);
      }

      // Always try signin
      const { error: signinError, data: signinData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signinError) {
        console.error("Signin error:", signinError);
        throw signinError;
      }

      console.log("Login successful");
      return { success: true };
    } catch (error: any) {
      console.error("Auth error:", error);
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
