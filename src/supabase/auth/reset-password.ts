// src/supabase/auth/reset-password.ts
import { supabase } from "../client";

type ResetPasswordData = {
  newPassword: string;
};

/**
 * Reset user's password using the reset token from email
 * @param formData - Contains new password
 * @returns Success status
 */
export async function resetPassword(formData: ResetPasswordData) {
  const { error } = await supabase.auth.updateUser({
    password: formData.newPassword,
  });

  if (error) {
    throw error;
  }

  return { success: true };
}


