// src/supabase/auth/signupCaretaker.ts
import { supabase } from "../client";

type SignupFormData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export async function signupCaretaker(formData: SignupFormData) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
        phone: formData.phone,
        role: "needy",
      },
    },
  });

  // Case 1: Koi real error aya (network, invalid password, etc.)
  if (authError) throw authError;

  // Case 2: User already exists (Supabase ka "silent" behavior)
  if (authData?.user && authData.user.identities?.length === 0) {
    throw new Error(
      "User already registered. Please sign in or verify your email."
    );
  }

  // Case 3: Naya user create hua
  const userId = authData.user?.id;
  if (!userId) throw new Error("User signup failed");

  return { success: true, userId };
}
