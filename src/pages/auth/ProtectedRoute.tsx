import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/supabase/client";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Welcome } from ".";
import Layout from "../Layout";

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [isProfileCompleted, setIsProfileCompleted] = useState(null);

  useEffect(() => {
    const checkProfile = async () => {
      // 1. Check localStorage first
      const cached = localStorage.getItem(`${user.id}_isProfileCompleted`);
      if (cached !== null) {
        setIsProfileCompleted(cached === "true");
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
        setIsProfileCompleted(false); // fallback
      } else if (data) {
        localStorage.setItem(
          `${user.id}_isProfileCompleted`,
          data.isprofilecompleted
        );
        setIsProfileCompleted(data.isprofilecompleted);
      }

      setLoading(false); // ✅ only set loading false after data is ready
    };

    user && checkProfile();
  }, [user]);

  if (!user) return <Navigate to="/sign-in" />;
  if (loading) return <p>Loading...</p>;
  return isProfileCompleted ? <Layout userData={user} /> : <Welcome />;
};

export default ProtectedRoute;
