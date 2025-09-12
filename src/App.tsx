import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AddCase from "./pages/AddCase";
import CaseManagement from "./pages/CaseManagement";
import DonorRelations from "./pages/DonorRelations";
import Index from "./pages/Index";
import NeedyManagement from "./pages/NeedyManagement";
import NotFound from "./pages/NotFound";
import RequestManagement from "./pages/RequestManagement";
import { ProtectedRoute, SignIn, SignUp } from "./pages/auth";
import { supabase } from "./supabase/client";

// const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState(null);

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
    // Optional: subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  console.log("Current user:", user);

  return (
    // <QueryClientProvider client={queryClient}>
    // <TooltipProvider>
    //   <Toaster />
    //   <Sonner />
    <Routes>
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute user={user} />}>
        <Route index element={<Index />} />
        <Route
          path="cases"
          element={<div className="p-6">Browse Cases - Coming Soon</div>}
        />
        <Route path="needy" element={<NeedyManagement />} />
        <Route path="case-management" element={<CaseManagement />} />
        <Route path="donors" element={<DonorRelations />} />
        <Route
          path="reports"
          element={<div className="p-6">Reports - Coming Soon</div>}
        />
        <Route
          path="financial"
          element={<div className="p-6">Financial - Coming Soon</div>}
        />
        <Route path="requests" element={<RequestManagement />} />
        <Route path="add-case" element={<AddCase />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      </Route>

      {/* UnProtected Routes */}
      <Route element={!user ? <Outlet /> : <Navigate to={"/"} />}>
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    // </TooltipProvider>
    // </QueryClientProvider>
  );
};

export default App;
