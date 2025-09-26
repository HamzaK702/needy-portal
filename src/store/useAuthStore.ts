import { supabase } from "@/supabase/client";
import { create } from "zustand";

type Profile = {
  profile_id: string;
  area_of_operations: string;
  cnic_file_url: string;
  profile_pic_url: string;
};

type AuthState = {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: any | null) => Promise<void>;
  setLoading: (loading: boolean) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,

  // 👇 user set karte hi uska profile bhi auto fetch hoga
  setUser: async (user) => {
    set({ user });

    if (user?.id) {
      const { data, error } = await supabase
        .from("caretaker_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        set({ profile: null });
      } else {
        set({ profile: data });
      }
    } else {
      set({ profile: null });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),

  reset: () => set({ user: null, profile: null, isLoading: true }),
}));
