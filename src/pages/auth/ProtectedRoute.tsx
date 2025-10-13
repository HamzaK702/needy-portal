import Loading from "@/components/ui/loading";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase/client";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Welcome } from ".";
import Layout from "../Layout";

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const { user, isLoading, isProfileCompleted, setProfileCompleted } =
    useAuthStore();

  useEffect(() => {
    const checkProfile = async () => {
      // 1. Check localStorage first
      const cached = localStorage.getItem(`${user.id}_isProfileCompleted`);
      if (cached !== null) {
        setProfileCompleted(cached === "true");
        setLoading(false); // ✅ stop loading as soon as we have data
        return;
      }

      // 2. Fetch from DB
      const { data, error } = await supabase
        .from("profiles")
        .select("isprofilecompleted")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        setProfileCompleted(false); // fallback
      } else if (data) {
        localStorage.setItem(
          `${user.id}_isProfileCompleted`,
          data.isprofilecompleted
        );
        setProfileCompleted(data.isprofilecompleted);
      }

      setLoading(false); // ✅ only set loading false after data is ready
    };

    user && checkProfile();
  }, [user]);

  // Wait for auth loading to complete first
  if (isLoading) return <Loading text="Authenticating..." />;
  if (!user) return <Navigate to="/sign-in" />;
  if (loading) return <Loading text="Loading profile..." />;
  return isProfileCompleted ? <Layout /> : <Welcome />;
};

export default ProtectedRoute;
