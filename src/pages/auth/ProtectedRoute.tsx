import { useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../Layout";

const ProtectedRoute = ({ user }) => {
  const [loading, setLoading] = useState(true);

  setTimeout(() => {
    setLoading(false);
  }, 1000);

  return loading ? (
    <p>Loading...</p>
  ) : user ? (
    <Layout userData={user} />
  ) : (
    <Navigate to="/sign-in" />
  );
};

export default ProtectedRoute;
