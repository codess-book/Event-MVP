import { useNavigate } from "react-router-dom";
import { useMe } from "../hooks/auth/useMe";
import { logout } from "../hooks/auth/useAuthMutations";
import { Link } from "react-router-dom";
export default function Home() {
  const { user } = useMe();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="home">
      <img
        src="/aradhana-logo.png"
        alt="Aaradhna"
        style={{ display: "block", height: 48, width: "auto", marginBottom: 8 }}
      />
      <p className="auth__tag" style={{ textAlign: "left" }}>
        Welcome, {user?.name}
      </p>

      {!user?.isApproved && (
        <div className="notice" style={{ marginBottom: 20 }}>
          Your sponsor account is waiting for admin approval. You will appear in
          the app once it is approved.
        </div>
      )}
      {user?.role === "admin" && (
        <Link
          to="/admin/resets"
          className="btn btn--ghost"
          style={{
            display: "grid",
            placeItems: "center",
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          Password reset requests
        </Link>
      )}
      <button className="btn btn--ghost" onClick={onLogout}>
        Log out
      </button>
    </main>
  );
}
