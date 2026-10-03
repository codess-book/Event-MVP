import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "../hooks/auth/useMe";

// Simple full-screen placeholder while /auth/me is loading
function Splash() {
  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
      Aaradhna
    </div>
  );
}

export function ProtectedRoute({ adminOnly = false }) {
  const { user, isLoading } = useMe();
  if (isLoading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  // Assumes the user object has role: "admin"; adjust to your schema
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useMe();
  if (isLoading) return <Splash />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}