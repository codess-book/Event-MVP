import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Avatar from "../components/Avatar";
import { useToast } from "../components/Toast";
import { useAdminUsers, useSetApproval, useResetPassword } from "../hooks/admin/useAdminUsers";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import "../lightcards.css";

// type: "" (all) | "player" | "member" | "sponsor"
function UserCard({ u }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState(null);
  const approve = useSetApproval();
  const reset = useResetPassword();
  const busy = approve.isMutating || reset.isMutating;

  const setApproved = async (isApproved) => {
    try {
      await approve.trigger({ id: u._id, isApproved });
      toast(isApproved ? "Approved" : "Hidden");
    } catch (e) { toast(e.message, "error"); }
  };

  const doReset = async () => {
    if (!window.confirm(`Reset password for ${u.name}?`)) return;
    try {
      const r = await reset.trigger({ id: u._id });
      setTemp(r.tempPassword);
    } catch (e) { toast(e.message, "error"); }
  };

  return (
    <div className="card">
      <div className="card__top" onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
        <div className="adm__who">
          <Avatar user={{ name: u.businessName || u.name, photoUrl: u.photoUrl }} className="sp__logo adm__logo" />
          <div>
            <div className="card__name">{u.businessName || u.name}</div>
            <div className="card__meta">{u.name} · {u.phone} · {u.userType}{u.passNumber ? ` · #${u.passNumber}` : ""}</div>
          </div>
        </div>
        <span className={`badge ${u.isApproved ? "badge--gold" : ""}`}>
          {u.isApproved ? "approved" : "pending"}
        </span>
      </div>

      {open && (
        <div className="card__meta" style={{ margin: "10px 0", lineHeight: 1.8 }}>
          {Object.entries({
            Phone: u.phone,
            Type: u.userType,
            "Pass #": u.passNumber,
            Business: u.businessName,
            Gender: u.gender,
            Category: u.sponsorCategory,
            Address: u.address,
            Map: u.mapLink,
            Offers: u.userType === "sponsor" ? u.offers?.length : null,
            Joined: u.createdAt && new Date(u.createdAt).toLocaleString(),
            Locked: u.lockUntil && new Date(u.lockUntil) > new Date() ? "yes" : null,
          }).filter(([, v]) => v).map(([k, v]) => <div key={k}><b>{k}:</b> {String(v)}</div>)}
        </div>
      )}

      {temp && (
        <div className="a2__err" style={{ background: "#16351f" }}>
          New password: <b>{temp}</b> (shown only once. Share it with the user)
        </div>
      )}

      {u.role !== "admin" && (
        <div className="adm__btns">
          {u.isApproved ? (
            <button className="smallbtn smallbtn--danger" disabled={busy} onClick={() => setApproved(false)}>Hide</button>
          ) : (
            <button className="a2__btn btn--sm" disabled={busy} onClick={() => setApproved(true)}>Approve</button>
          )}
          <button className="smallbtn" disabled={busy} onClick={doReset}>Reset password</button>
        </div>
      )}
    </div>
  );
}

export default function AdminUsers({ type = "", title = "All users" }) {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { users, pages, total, isLoading, error } = useAdminUsers({ type, status, q, page });

  return (
    <div className="pf lc">
      <div className="pf__wrap">
        <header className="sp__bar">
          <Link to="/admin" className="iconbtn" aria-label="Back"><ArrowLeft size={22} /></Link>
          <span className="sp__barTitle">{title} ({total})</span>
          <span style={{ width: 42 }} />
        </header>

        <div className="sp__list">
          <input className="adm__select" placeholder="Search name / phone…" value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <select className="adm__select" value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>

          {isLoading && <p className="sheet__empty">Loading…</p>}
          {error && <div className="a2__err">{error.message}</div>}
          {!isLoading && !error && users.length === 0 && <p className="sheet__empty">No users found.</p>}
          {users.map((u) => <UserCard key={u._id} u={u} />)}

          {pages > 1 && (
            <div className="adm__btns">
              <button className="smallbtn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
              <span className="card__meta">{page} / {pages}</span>
              <button className="smallbtn" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}