import { Link } from "react-router-dom";
import { useAdminStats } from "../hooks/admin/useAdminUsers";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";

export default function AdminDashboard() {
  const { stats, isLoading } = useAdminStats();
  const t = stats?.byType;
  const items = [
    { to: "/admin/users", label: "All users", n: stats?.total },
    {
      to: "/admin/players",
      label: "Players.",
      n: t?.player.total,
      pending: t?.player.pending,
    },
    {
      to: "/admin/members",
      label: "Members",
      n: t?.member.total,
      pending: t?.member.pending,
    },
    {
      to: "/admin/sponsors",
      label: "Sponsors (category + approve)",
      n: t?.sponsor.total,
      pending: t?.sponsor.pending,
    },
    { to: "/admin/resets", label: "Password reset requests" },
    { to: "/admin/notify", label: "Send notification" },
  ];
  return (
    <div className="pf">
      <div className="pf__wrap">
        <header className="sp__bar">
          <span className="sp__barTitle">Admin panel</span>
        </header>
        <div className="sp__list">
          {isLoading && <p className="sheet__empty">Loading…</p>}
          {items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              className="card"
              style={{ textDecoration: "none" }}
            >
              <div className="card__top">
                <div className="card__name">
                  {i.label}
                  {i.n != null && ` (${i.n})`}
                </div>
                {i.pending > 0 && (
                  <span className="badge">{i.pending} pending</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
