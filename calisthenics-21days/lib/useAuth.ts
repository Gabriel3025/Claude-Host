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
      console.log("🔐 Login attempt for:", email);

      // Use OTP (One Time Password) - simpler, no email confirmation needed
      const { error: otpError, data: otpData } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (otpError) {
        console.error("❌ OTP Error:", otpError.message);
        throw otpError;
      }

      console.log("📧 OTP sent, now attempting auto-signin...");

      // Wait a moment for the user to be created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to get session
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        console.log("✅ Auto login successful!");
        return { success: true };
      }

      // If OTP was sent successfully, return success
      // (user will be signed in on the next page load)
      console.log("✅ OTP requested successfully");
      return { success: true };

    } catch (error: any) {
      console.error("❌ Auth error:", error.message);
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
