import Loading from "@/components/ui/loading";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase/client";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Welcome } from ".";
import Layout from "../Layout";

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const { user, isLoading, isProfileCompleted, setProfileCompleted } =
    useAuthStore();

  useEffect(() => {
    const checkProfileAndPassword = async () => {
      
      const { data: pwdData, error: pwdError } = await supabase
        .from("needy_profiles")
        .select("must_change_password")
        .eq("profile_id", user.id)
        .single();


      if (!pwdError && pwdData?.must_change_password) {
        setMustChangePassword(true);
        setLoading(false);
        return; 
      }


      const cached = localStorage.getItem(
        `${user.id}_isProfileCompleted`
      );

      if (cached !== null) {
        setProfileCompleted(cached === "true");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("isprofilecompleted")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        setProfileCompleted(false);
      } else if (data) {
        localStorage.setItem(
          `${user.id}_isProfileCompleted`,
          String(data.isprofilecompleted)
        );
        setProfileCompleted(data.isprofilecompleted);
      }

      setLoading(false);
    };

    if (user) checkProfileAndPassword();
  }, [user]);


  if (isLoading) return <Loading text="Authenticating..." />;
  if (!user) return <Navigate to="/sign-in" />;
  if (loading) return <Loading text="Loading user..." />;

  if (mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  // EXISTING FLOW
  return isProfileCompleted ? <Layout /> : <Welcome />;
};

export default ProtectedRoute;
