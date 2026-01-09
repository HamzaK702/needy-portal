// src/supabase/auth/forgot-password.ts
import { supabase } from "../client";


function getRedirectUrl(): string {
  // Check for environment variable first (for production)
  const envRedirectUrl = import.meta.env.VITE_PASSWORD_RESET_REDIRECT_URL;
  
  if (envRedirectUrl) {
    // Ensure it doesn't have trailing slash
    const baseUrl = envRedirectUrl.endsWith('/') ? envRedirectUrl.slice(0, -1) : envRedirectUrl;
    return `${baseUrl}/reset-password`;
  }
  
  // Fallback to current origin (works for local development)
  // Ensure we have the full URL with protocol
  const origin = window.location.origin;
  return `${origin}/reset-password`;
}

/**
 * Send password reset email to user
 * @param email - User's email address
 * @returns Success status
 */
export async function forgotPassword(email: string) {
  const redirectUrl = getRedirectUrl();
  
  // Log for debugging (remove in production if needed)
  console.log("Password reset redirect URL:", redirectUrl);
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    console.error("Password reset error:", error);
    throw error;
  }

  return { success: true };
}


