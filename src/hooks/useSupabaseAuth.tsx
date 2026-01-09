import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase/client";
import { useEffect } from "react";

export function useSupabaseAuth() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      
      // Check if we're on reset-password route with recovery session
      const isResetPasswordRoute = window.location.pathname === "/reset-password";
      const recoverySessionFlag = sessionStorage.getItem("recovery_session_validated");
      const hash = window.location.hash;
      const hasRecoveryToken = hash.includes("type=recovery") || hash.includes("access_token");
      
      // If on reset-password route and has recovery token, don't set user yet
      // Let the ResetPassword component handle it
      if (isResetPasswordRoute && (hasRecoveryToken || recoverySessionFlag)) {
        console.log("useSupabaseAuth - Recovery session detected, skipping user set");
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        setUser(null);
      } else {
        setUser(data.session?.user || null);
      }
      setLoading(false);
    };

    fetchUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Check if this is a recovery session
        const isResetPasswordRoute = window.location.pathname === "/reset-password";
        const recoverySessionFlag = sessionStorage.getItem("recovery_session_validated");
        const hash = window.location.hash;
        const hasRecoveryToken = hash.includes("type=recovery") || hash.includes("access_token");
        
        // Don't set user if we're on reset-password route with recovery session
        if (isResetPasswordRoute && (hasRecoveryToken || recoverySessionFlag || event === "PASSWORD_RECOVERY")) {
          console.log("useSupabaseAuth - Ignoring recovery session in onAuthStateChange");
          return;
        }
        
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser, setLoading]);
}
