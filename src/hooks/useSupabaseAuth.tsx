import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase/client";
import { useEffect } from "react";

export function useSupabaseAuth() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        return;
      }
      setUser(data.session?.user || null);
    };

    fetchUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser]);
}
