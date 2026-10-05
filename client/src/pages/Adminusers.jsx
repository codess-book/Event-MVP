import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Clock,
  Check,
  EyeOff,
  Key,
  Copy,
  CheckCircle2,
  Loader2,
  Users,
  UserRound,
 
  Store,
  UserCheck,
  Inbox,
  Phone,
  MapPin,
  Gift,
  CalendarDays,
  Lock,
} from "lucide-react";
import Avatar from "../components/Avatar";
import { useToast } from "../components/Toast";
import {
  useAdminUsers,
  useSetApproval,
  useResetPassword,
} from "../hooks/admin/useAdminUsers";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import "../admin-users.css";
function PhotoViewer({ src, name, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="aux__viewer" onClick={onClose} role="dialog">
      <div className="aux__viewerBar" onClick={(e) => e.stopPropagation()}>
        <span className="aux__viewerName">{name}</span>
        <button type="button" className="aux__viewerClose" onClick={onClose}>
          <X size={22} />
        </button>
      </div>
      <div className="aux__viewerStage" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={name} className="aux__viewerImg" />
      </div>
      <span className="aux__viewerHint">Tap anywhere to close</span>
    </div>
  );
}
/* ------------------------------ user card ------------------------------ */
function UserCard({ u, onOpenPhoto }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState(null);
  const [copied, setCopied] = useState(false);

  const approve = useSetApproval();
  const reset = useResetPassword();
  const busy = approve.isMutating || reset.isMutating;

  const setApproved = async (isApproved) => {
    try {
      await approve.trigger({ id: u._id, isApproved });
      toast(isApproved ? "Approved" : "Hidden", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const doReset = async () => {
    if (!window.confirm(`Reset password for ${u.name}?`)) return;
    try {
      const r = await reset.trigger({ id: u._id });
      setTemp(r.tempPassword);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const copyTemp = async () => {
    try {
      await navigator.clipboard.writeText(temp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  /* details rows — same logic, same fields */
  const detailRows = Object.entries({
    Name: u.name,
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
  }).filter(([, v]) => v);

  const displayName = u.businessName || u.name;

  return (
    <article className="aux__card">
      {/* ---------- header ---------- */}
      <button
        type="button"
        className="aux__cardHead"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span
          className={`aux__avatarWrap ${u.photoUrl ? "is-clickable" : ""}`}
          onClick={(e) => {
            if (!u.photoUrl) return;
            e.stopPropagation();
            onOpenPhoto?.(u);
          }}
          role={u.photoUrl ? "button" : undefined}
          tabIndex={u.photoUrl ? 0 : -1}
        >
          <Avatar
            user={{ name: displayName, photoUrl: u.photoUrl }}
            className="aux__avatar"
          />
        </span>
        <div className="aux__identity">
          <div className="aux__nameRow">
            <span className="aux__name">{displayName}</span>
            {u.userType && (
              <span className={`aux__typeChip aux__typeChip--${u.userType}`}>
                {u.userType}
              </span>
            )}
          </div>
          <span className="aux__meta">
            {u.name !== displayName && `${u.name} · `}
            {u.phone}
            {u.passNumber ? ` · #${u.passNumber}` : ""}
          </span>
        </div>

        <div className="aux__right">
          <span
            className={`aux__status ${u.isApproved ? "is-approved" : "is-pending"}`}
          >
            {u.isApproved ? (
              <>
                <ShieldCheck size={11} /> Approved
              </>
            ) : (
              <>
                <Clock size={11} /> Pending
              </>
            )}
          </span>
          {open ? (
            <ChevronUp size={16} className="aux__chev" />
          ) : (
            <ChevronDown size={16} className="aux__chev" />
          )}
        </div>
      </button>

      {/* ---------- body (expanded) ---------- */}
      {open && (
        <>
          {detailRows.length > 0 && (
            <div className="aux__details">
              {detailRows.map(([k, v]) => (
                <div className="aux__detailRow" key={k}>
                  <span className="aux__detailKey">{k}</span>
                  <span className="aux__detailVal">{String(v)}</span>
                </div>
              ))}
            </div>
          )}

          {temp && (
            <div className="aux__tempPass">
              <div className="aux__tempPassHead">
                <Key size={14} />
                <strong>Temporary password</strong>
              </div>
              <div className="aux__tempPassBody">
                <code className="aux__tempCode">{temp}</code>
                <button
                  type="button"
                  className="aux__copyBtn"
                  onClick={copyTemp}
                  aria-label="Copy password"
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="aux__tempNote">
                Shown only once — share it with the user now.
              </p>
            </div>
          )}

          {u.role !== "admin" && (
            <div className="aux__actions">
              {u.isApproved ? (
                <button
                  type="button"
                  className="aux__btn aux__btn--danger"
                  disabled={busy}
                  onClick={() => setApproved(false)}
                >
                  {approve.isMutating ? (
                    <>
                      <Loader2 size={14} className="spin" /> Hiding…
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} /> Hide
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className="aux__btn aux__btn--approve"
                  disabled={busy}
                  onClick={() => setApproved(true)}
                >
                  {approve.isMutating ? (
                    <>
                      <Loader2 size={14} className="spin" /> Approving…
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Approve
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                className="aux__btn aux__btn--ghost"
                disabled={busy}
                onClick={doReset}
              >
                {reset.isMutating ? (
                  <>
                    <Loader2 size={14} className="spin" /> Resetting…
                  </>
                ) : (
                  <>
                    <Key size={14} /> Reset password
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </article>
  );
}

/* ------------------------------ skeleton ------------------------------ */
function Skeleton() {
  return (
    <div className="aux__list">
      {[1, 2, 3].map((i) => (
        <div key={i} className="aux__card aux__card--sk">
          <div className="aux__cardHead">
            <div className="aux__avatarWrap">
              <div className="sk sk--logo" />
            </div>
            <div style={{ flex: 1 }}>
              <div
                className="sk sk--line"
                style={{ width: "55%", height: 14 }}
              />
              <div
                className="sk sk--line"
                style={{ width: "40%", height: 11, marginTop: 8 }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ empty ------------------------------ */
function EmptyState() {
  return (
    <div className="aux__empty">
      <div className="aux__emptyIcon">
        <Inbox size={26} />
      </div>
      <h3 className="aux__emptyTitle">No users found</h3>
      <p className="aux__emptyText">
        Try a different filter or clear the search.
      </p>
    </div>
  );
}

/* ------------------------------ type tabs ------------------------------ */
const TYPE_TABS = [
  { key: "", label: "All", icon: Users },
  { key: "player", label: "Players", icon: UserRound },
  { key: "member", label: "Members", icon: UserCheck },
  { key: "sponsor", label: "Sponsors", icon: Store },
  { key: "visitor", label: "Visitors", icon: Users },
];

/* ------------------------------ main ------------------------------ */
export default function AdminUsers({
  type: initialType = "",
  title = "All users",
}) {
  const [activeType, setActiveType] = useState(initialType);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [viewer, setViewer] = useState(null);
  const {
    users = [],
    pages,
    total = 0,
    isLoading,
    error,
  } = useAdminUsers({
    type: activeType,
    status,
    q,
    page,
  });

  const changeType = (t) => {
    setActiveType(t);
    setPage(1);
  };
  const openPhoto = (u) => {
    if (!u.photoUrl) return;
    setViewer({ src: u.photoUrl, name: u.businessName || u.name });
  };

  return (
    <div className="pf">
      <div className="pf__wrap">
        <div className="aux">
          {/* ---------- HEADER ---------- */}
          <header className="aux__header">
            <div className="aux__headerTop">
              <Link to="/admin" className="aux__backBtn" aria-label="Back">
                <ArrowLeft size={20} strokeWidth={2.4} />
              </Link>

              <div className="aux__headerCenter">
                <span className="aux__headerEyebrow">
                  <ShieldCheck size={11} /> Admin
                </span>
                <h1 className="aux__headerTitle">
                  {title} <span className="aux__headerCount">({total})</span>
                </h1>
              </div>

              <span style={{ width: 42 }} />
            </div>

            {/* type filter chips */}
            <div
              className="aux__typeTabs"
              role="group"
              aria-label="Filter by type"
            >
              {TYPE_TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key || "all"}
                  type="button"
                  className={`aux__typeTab ${
                    activeType === key ? "is-active" : ""
                  }`}
                  onClick={() => changeType(key)}
                  aria-pressed={activeType === key}
                >
                  <Icon size={13} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* search */}
            <div className="aux__search">
              <Search size={16} className="aux__searchIcon" />
              <input
                type="search"
                className="aux__searchInput"
                placeholder="Search name or phone"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                aria-label="Search users"
              />
              {q && (
                <button
                  type="button"
                  className="aux__searchClear"
                  onClick={() => {
                    setQ("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* status pills */}
            <div
              className="aux__statusTabs"
              role="group"
              aria-label="Filter by status"
            >
              {[
                { key: "", label: "All" },
                { key: "pending", label: "Pending" },
                { key: "approved", label: "Approved" },
              ].map(({ key, label }) => (
                <button
                  key={key || "all"}
                  type="button"
                  className={`aux__statusTab ${
                    status === key ? "is-active" : ""
                  }`}
                  onClick={() => {
                    setStatus(key);
                    setPage(1);
                  }}
                  aria-pressed={status === key}
                >
                  {label}
                </button>
              ))}
            </div>
          </header>

          {/* ---------- BODY ---------- */}
          <div className="aux__body">
            {isLoading && <Skeleton />}

            {error && !isLoading && (
              <div className="aux__err" role="alert">
                <strong>Couldn't load users</strong>
                <span>{error.message || "Please try again."}</span>
              </div>
            )}

            {!isLoading && !error && users.length === 0 && <EmptyState />}

            {!isLoading && !error && users.length > 0 && (
              <div className="aux__list">
                {users.map((u) => (
                  <UserCard key={u._id} u={u} onOpenPhoto={openPhoto} />
                ))}
              </div>
            )}

            {pages > 1 && (
              <div className="aux__pagination">
                <button
                  type="button"
                  className="aux__pageBtn"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Prev
                </button>
                <span className="aux__pageInfo">
                  Page <strong>{page}</strong> of {pages}
                </span>
                <button
                  type="button"
                  className="aux__pageBtn"
                  disabled={page >= pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
            {viewer && (
        <PhotoViewer
          src={viewer.src}
          name={viewer.name}
          onClose={() => setViewer(null)}
        />
      )}

    </div>
  );
}
