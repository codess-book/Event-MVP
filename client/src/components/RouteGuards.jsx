import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "../hooks/auth/useMe";

// Full-screen logo while /auth/me is loading
function Splash() {
  return (
    <div className="route-splash">
      <img
        src="/aradhana-logo.png"
        alt="Aaradhna"
        className="route-splash__logo"
      />
    </div>
  );
}

export function ProtectedRoute({ adminOnly = false }) {
  const { user, isLoading } = useMe();
  if (isLoading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useMe();
  if (isLoading) return <Splash />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}