import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Store,
  Search,
  X,
  Check,
  EyeOff,
  Loader2,
  Clock,
  Inbox,
  Sparkles,
  Tag,
  Phone,
  Gift,
} from "lucide-react";
import Avatar from "../components/Avatar";
import { useToast } from "../components/Toast";
import {
  useAdminSponsors,
  useUpdateSponsor,
} from "../hooks/admin/useAdminSponsers";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import "../admin-sponsors.css";

/* ------------------------------ sponsor row ------------------------------ */
function Row({ s, categories }) {
  const toast = useToast();
  const { trigger, isMutating } = useUpdateSponsor();
  const [cat, setCat] = useState(s.category);

  // Keep old free-text categories visible until the admin picks a new one
  const options =
    cat && !categories.includes(cat) ? [cat, ...categories] : categories;

  const save = async (changes, okMsg) => {
    try {
      await trigger({ id: s.id, changes });
      toast(okMsg);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const isLive = s.isApproved;
  const canSaveCat = cat && cat !== s.category && !isMutating;
  const canApprove = cat && !isMutating;

  return (
    <article className="asx__card">
      {/* ---------- header ---------- */}
      <header className="asx__cardHead">
        <div className="asx__identity">
          <div className="asx__avatarWrap">
            <Avatar
              user={{ name: s.businessName, photoUrl: s.photoUrl }}
              className="asx__avatar"
            />
          </div>
          <div className="asx__identityText">
            <h3 className="asx__name">{s.businessName}</h3>
            <p className="asx__meta">
              <span>{s.name}</span>
              <span className="asx__dot">·</span>
              <span>{s.phone}</span>
            </p>
            <div className="asx__chipRow">
              <span className="asx__chip">
                <Gift size={11} /> {s.offerCount} offers
              </span>
              {s.category && (
                <span className="asx__chip">
                  <Tag size={11} /> {s.category}
                </span>
              )}
            </div>
          </div>
        </div>

        <span className={`asx__status ${isLive ? "is-live" : "is-pending"}`}>
          {isLive ? (
            <>
              <ShieldCheck size={12} /> Live
            </>
          ) : (
            <>
              <Clock size={12} /> Pending
            </>
          )}
        </span>
      </header>

      {/* ---------- category select ---------- */}
      <div className="asx__field">
        <label className="asx__label" htmlFor={`cat-${s.id}`}>
          Category
        </label>
        <div className="asx__selectWrap">
          <Tag size={15} className="asx__selectIcon" />
          <select
            id={`cat-${s.id}`}
            className="asx__select"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            disabled={isMutating}
          >
            <option value="">Choose category…</option>
            {options.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ---------- actions ---------- */}
      <div className="asx__actions">
        {isLive ? (
          <>
            <button
              type="button"
              className="asx__btn asx__btn--primary"
              disabled={!canSaveCat}
              onClick={() =>
                save({ sponsorCategory: cat }, "Category updated")
              }
            >
              {isMutating ? (
                <>
                  <Loader2 size={14} className="spin" /> Saving…
                </>
              ) : (
                <>
                  <Check size={14} /> Save category
                </>
              )}
            </button>
            <button
              type="button"
              className="asx__btn asx__btn--danger"
              disabled={isMutating}
              onClick={() =>
                save({ isApproved: false }, "Sponsor hidden")
              }
            >
              <EyeOff size={14} /> Hide
            </button>
          </>
        ) : (
          <button
            type="button"
            className="asx__btn asx__btn--approve"
            disabled={!canApprove}
            onClick={() =>
              save(
                { isApproved: true, sponsorCategory: cat },
                "Approved, welcome sent"
              )
            }
          >
            {isMutating ? (
              <>
                <Loader2 size={14} className="spin" /> Approving…
              </>
            ) : (
              <>
                <Sparkles size={14} /> Approve sponsor
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}

/* ------------------------------ skeleton ------------------------------ */
function Skeleton() {
  return (
    <div className="asx__list">
      {[1, 2, 3].map((i) => (
        <div key={i} className="asx__card asx__card--sk">
          <div className="asx__cardHead">
            <div className="asx__identity">
              <div className="asx__avatarWrap">
                <div className="sk sk--logo" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="sk sk--line" style={{ width: "55%", height: 14 }} />
                <div
                  className="sk sk--line"
                  style={{ width: "40%", height: 11, marginTop: 8 }}
                />
                <div
                  className="sk sk--line"
                  style={{ width: "70%", height: 11, marginTop: 8 }}
                />
              </div>
            </div>
          </div>
          <div className="sk sk--line" style={{ height: 46, marginTop: 12 }} />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ empty ------------------------------ */
function EmptyState() {
  return (
    <div className="asx__empty">
      <div className="asx__emptyIcon">
        <Store size={26} />
      </div>
      <h3 className="asx__emptyTitle">No sponsors yet</h3>
      <p className="asx__emptyText">
        Sponsors will appear here as they register.
      </p>
    </div>
  );
}

/* ------------------------------ main ------------------------------ */
export default function AdminSponsors() {
  const { sponsors = [], categories = [], isLoading, error } =
    useAdminSponsors();

  const [filter, setFilter] = useState("all"); // all | live | pending
  const [query, setQuery] = useState("");

  const liveCount = sponsors.filter((s) => s.isApproved).length;
  const pendingCount = sponsors.length - liveCount;

  const shown = sponsors.filter((s) => {
    if (filter === "live" && !s.isApproved) return false;
    if (filter === "pending" && s.isApproved) return false;
    const q = query.trim().toLowerCase();
    if (q) {
      const hay =
        `${s.businessName || ""} ${s.name || ""} ${s.phone || ""} ${s.category || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="pf">
      <div className="pf__wrap">
        <div className="asx">
          {/* ---------- HEADER ---------- */}
          <header className="asx__header">
            <div className="asx__headerTop">
              <Link to="/profile" className="asx__backBtn" aria-label="Back">
                <ArrowLeft size={20} strokeWidth={2.4} />
              </Link>

              <div className="asx__headerCenter">
                <span className="asx__headerEyebrow">
                  <ShieldCheck size={11} /> Admin only
                </span>
                <h1 className="asx__headerTitle">Manage sponsors</h1>
              </div>

              <span style={{ width: 42 }} />
            </div>

            {/* stats */}
            {sponsors.length > 0 && (
              <div className="asx__stats">
                <button
                  type="button"
                  className={`asx__stat ${filter === "all" ? "is-active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  <span className="asx__statNum">{sponsors.length}</span>
                  <span className="asx__statLabel">All</span>
                </button>
                <button
                  type="button"
                  className={`asx__stat asx__stat--live ${
                    filter === "live" ? "is-active" : ""
                  }`}
                  onClick={() => setFilter("live")}
                >
                  <span className="asx__statNum">{liveCount}</span>
                  <span className="asx__statLabel">Live</span>
                </button>
                <button
                  type="button"
                  className={`asx__stat asx__stat--pending ${
                    filter === "pending" ? "is-active" : ""
                  }`}
                  onClick={() => setFilter("pending")}
                >
                  <span className="asx__statNum">{pendingCount}</span>
                  <span className="asx__statLabel">Pending</span>
                </button>
              </div>
            )}

            {/* search */}
            {sponsors.length > 0 && (
              <div className="asx__search">
                <Search size={16} className="asx__searchIcon" />
                <input
                  type="search"
                  className="asx__searchInput"
                  placeholder="Search by name, phone or category"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search sponsors"
                />
                {query && (
                  <button
                    type="button"
                    className="asx__searchClear"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </header>

          {/* ---------- BODY ---------- */}
          <div className="asx__body">
            {isLoading && <Skeleton />}

            {error && !isLoading && (
              <div className="asx__err" role="alert">
                <strong>Couldn't load sponsors</strong>
                <span>{error.message || "Please try again."}</span>
              </div>
            )}

            {!isLoading && !error && shown.length === 0 && (
              <EmptyState />
            )}

            {!isLoading && !error && shown.length > 0 && (
              <div className="asx__list">
                {shown.map((s) => (
                  <Row key={s.id} s={s} categories={categories} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}