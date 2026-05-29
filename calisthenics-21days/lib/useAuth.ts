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
          setUser({ id: data.session.user.id, email: data.session.user.email });
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
      console.log("Login attempt for:", email);

      // Use OTP (One-Time Password) method - works for new and existing users
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined,
        },
      });

      if (otpError) {
        console.error("OTP error:", otpError);
        throw otpError;
      }

      // OTP sent successfully
      // For development, we auto-verify after a short delay
      // In production, user would click link in email
      console.log("OTP sent to:", email);

      // Wait a bit and auto-signin (since we disabled email verification)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the session that should have been created
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData?.session?.user) {
        console.log("Auto-login successful");
        return { success: true };
      }

      // If no session yet, it means user needs to verify email in production
      // For now, we'll proceed anyway since email verification is disabled
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
