import { supabase } from "@/supabase/client";
import { create } from "zustand";

type Profile = {
  profile_id: string;
  area_of_operations: string | null;
  cnic_file_url?: string | null;
  profile_pic_url?: string | null;
};

type AuthState = {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  roleCheckingLoading: boolean;
  isProfileCompleted: boolean | null;
  setProfileCompleted: (value?: boolean) => Promise<void>;
  setUser: (user: any | null) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setRoleCheckingLoading: (loading: boolean) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  roleCheckingLoading: false,
  isProfileCompleted: null,

  // 👇 setUser also auto-fetches needy profile
  setUser: async (user) => {
    set({ user });

    if (user?.id) {
      const { data, error } = await supabase
        .from("needy_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        set({ profile: null });
      } else {
        set({ profile: data });
      }

      // also sync completion status
      const cached = localStorage.getItem(`${user.id}_isProfileCompleted`);
      if (cached !== null) {
        set({ isProfileCompleted: cached === "true" });
      } else {
        const { data: profileData, error: fetchErr } = await supabase
          .from("profiles")
          .select("isprofilecompleted")
          .eq("id", user.id)
          .single();

        if (fetchErr)
          console.error("Error fetching profile completion:", fetchErr);
        else if (profileData) {
          localStorage.setItem(
            `${user.id}_isProfileCompleted`,
            String(profileData.isprofilecompleted)
          );
          set({ isProfileCompleted: !!profileData.isprofilecompleted });
        }
      }
    } else {
      set({ profile: null, isProfileCompleted: null });
    }
  },

  setProfileCompleted: async (value?: boolean) => {
    const { user } = get();
    if (!user) return;

    let newValue = value;
    if (value === undefined) {
      const { data, error } = await supabase
        .from("profiles")
        .select("isprofilecompleted")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile completion:", error);
        newValue = false;
      } else {
        newValue = !!data?.isprofilecompleted;
      }
    }

    localStorage.setItem(`${user.id}_isProfileCompleted`, String(newValue));
    set({ isProfileCompleted: newValue });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setRoleCheckingLoading: (loading) => set({ roleCheckingLoading: loading }),

  reset: () =>
    set({
      user: null,
      profile: null,
      isLoading: false,
      isProfileCompleted: null,
    }),
}));
