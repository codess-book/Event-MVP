import { useState } from "react";
import { Link } from "react-router-dom";
import { useResetRequests, useApproveReset } from "../hooks/auth/admin/useResetRequests";
export default function AdminResets() {
  const { requests, isLoading, error } = useResetRequests();
  const { trigger } = useApproveReset();
  // The code is returned only once by the API, so keep it in memory here
  const [codes, setCodes] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const approve = async (id) => {
    setBusyId(id);
    setActionError("");
    try {
      const res = await trigger(id);
      setCodes((c) => ({ ...c, [id]: res.code }));
    } catch (e) {
      setActionError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const isExpired = (r) =>
    r.status === "approved" && r.expiresAt && new Date(r.expiresAt) < new Date();

  return (
    <main className="home">
      <h1 className="auth__title">Reset requests</h1>
      <p className="auth__tag" style={{ textAlign: "left", marginBottom: 20 }}>
        Generate a code, then give it to the person directly.
      </p>

      {isLoading && <p className="auth__alt">Loading…</p>}
      {error && <div className="form-error">{error.message}</div>}
      {actionError && <div className="form-error" style={{ marginBottom: 12 }}>{actionError}</div>}
      {!isLoading && !error && requests.length === 0 && (
        <p className="auth__alt">No open requests.</p>
      )}

      <div className="stack">
        {requests.map((r) => {
          const code = codes[r._id];
          const expired = isExpired(r);
          return (
            <div className="card" key={r._id}>
              <div className="card__top">
                <div>
                  <div className="card__name">{r.user?.name ?? "Unknown user"}</div>
                  <div className="card__meta">
                    {r.phone} · {r.user?.userType}
                    {r.user?.passNumber && ` · Pass ${r.user.passNumber}`}
                    {r.user?.businessName && ` · ${r.user.businessName}`}
                  </div>
                </div>
                <span className={`badge ${r.status === "approved" && !expired ? "badge--gold" : ""}`}>
                  {expired ? "expired" : r.status}
                </span>
              </div>

              {code && <div className="code-box">{code}</div>}

              <button
                className="btn btn--sm"
                disabled={busyId === r._id}
                onClick={() => approve(r._id)}
              >
                {busyId === r._id
                  ? "Generating…"
                  : r.status === "pending"
                  ? "Generate code"
                  : "Generate a new code"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="auth__alt"><Link to="/">Back to home</Link></p>
    </main>
  );
}