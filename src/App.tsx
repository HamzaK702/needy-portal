import { useAuthStore } from "@/store/useAuthStore";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Loading from "./components/ui/loading";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";
import AddCase from "./pages/AddCase";
import { ProtectedRoute, SignIn, SignUp } from "./pages/auth";
import CaseManagement from "./pages/CaseManagement";
import EditCase from "./pages/EditCase";
import Index from "./pages/Index";
// Removed unused routes: NeedyManagement, DonorRelations, Reports, Financial
import EditProfile from "./pages/auth/editProfile";
import NotFound from "./pages/NotFound";

const App = () => {
  const { user, isLoading } = useAuthStore();

  useSupabaseAuth();

  // Show loading while auth is being checked
  if (isLoading) {
    return <Loading text="Initializing..." />;
  }

  return (
    <Routes>
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Index />} />
        <Route path="case-management" element={<CaseManagement />} />
        <Route path="edit-profile" element={<EditProfile />} />
        <Route path="add-case" element={<AddCase />} />
        <Route path="edit-case/:id" element={<EditCase />} />
      </Route>

      {/* UnProtected Routes */}
      <Route element={!user ? <Outlet /> : <Navigate to={"/"} />}>
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
