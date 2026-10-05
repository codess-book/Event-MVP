import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Plus,
  Pencil,
  Trash2,
  Heart,
  Sparkles,
  Gift,
  Search,
  X,
  Inbox,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import PrizeSheet from "../components/PrizeSheet";
import { useToast } from "../components/Toast";
import { useMe } from "../hooks/auth/useMe";
import { usePrizes, useDeletePrize } from "../hooks/prizes/usePrizes";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import "../prizes.css";

/* ------------------------------ confirm dialog ------------------------------ */
function ConfirmDialog({ open, prize, busy, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="prx__dialogBackdrop" onClick={busy ? undefined : onCancel}>
      <div className="prx__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="prx__dialogIcon">
          <Trash2 size={22} />
        </div>
        <h3 className="prx__dialogTitle">Remove this prize?</h3>
        <p className="prx__dialogText">
          <strong>{prize?.title}</strong> will be permanently removed. This
          can't be undone.
        </p>
        <div className="prx__dialogActions">
          <button
            type="button"
            className="prx__btn prx__btn--ghost"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="prx__btn prx__btn--danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 size={14} className="spin" /> Removing…
              </>
            ) : (
              <>
                <Trash2 size={14} /> Remove
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ skeleton ------------------------------ */
function Skeleton() {
  return (
    <div className="prx__list">
      {[1, 2, 3].map((i) => (
        <div key={i} className="prx__card prx__card--sk">
          <div className="sk sk--line" style={{ width: 60, height: 60, borderRadius: 18 }} />
          <div style={{ flex: 1 }}>
            <div className="sk sk--line" style={{ width: "60%", height: 16 }} />
            <div className="sk sk--line" style={{ width: "35%", height: 12, marginTop: 8 }} />
            <div className="sk sk--line" style={{ width: "80%", height: 12, marginTop: 10 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ empty state ------------------------------ */
function EmptyState({ filtered, onReset }) {
  return (
    <div className="prx__empty">
      <div className="prx__emptyIcon">
        {filtered ? <Inbox size={28} /> : <Trophy size={28} />}
      </div>
      <h3 className="prx__emptyTitle">
        {filtered ? "No prizes match" : "No prizes yet"}
      </h3>
      <p className="prx__emptyText">
        {filtered
          ? "Try a different search or category."
          : "Prizes will appear here as soon as they're announced."}
      </p>
      {filtered && (
        <button type="button" className="prx__emptyBtn" onClick={onReset}>
          Show all prizes
        </button>
      )}
    </div>
  );
}

/* ------------------------------ main ------------------------------ */
export default function Prizes() {
  const { user } = useMe();
  const toast = useToast();
  const { prizes = [], isLoading, error } = usePrizes();
  const del = useDeletePrize();

  const [sheet, setSheet] = useState(null); // null | { prize }
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState(null);

  const isAdmin = user?.role === "admin";
  const canAdd = isAdmin || (user?.userType === "sponsor" && user?.isApproved);

  /* filtered list */
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return prizes;
    return prizes.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.forWhat?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.donor?.name?.toLowerCase().includes(q)
    );
  }, [prizes, query]);

  const isFiltered = query.trim() !== "";

  /* ------------------------------ delete ------------------------------ */
  const handleDeleteConfirmed = async () => {
    if (!confirming) return;
    try {
      await del.trigger(confirming.id);
      toast("Prize removed", "success");
      setConfirming(null);
    } catch (e) {
      toast(e?.message || "Couldn't remove prize", "error");
    }
  };

  return (
    <div className="pf">
      <div className="pf__wrap">
        <div className="prx">
          {/* ---------- HEADER ---------- */}
          <header className="prx__head">
            <div className="prx__headTop">
              <div>
                <h1 className="prx__title">
                  Prizes
                  <Sparkles size={16} className="prx__titleSpark" />
                </h1>
                <p className="prx__subtitle">
                  Play your best · win something special
                </p>
              </div>
              {prizes.length > 0 && (
                <span className="prx__count">{prizes.length}</span>
              )}
            </div>

            {/* admin / sponsor CTA */}
            {canAdd && (
              <button
                type="button"
                className="prx__addBtn"
                onClick={() => setSheet({ prize: null })}
              >
                <span className="prx__addBtnIcon">
                  <Plus size={18} />
                </span>
                <span className="prx__addBtnText">
                  <strong>Add a prize</strong>
                  <small>Announce something new</small>
                </span>
              </button>
            )}

            {/* search — only if there are prizes */}
            {prizes.length > 0 && (
              <div className="prx__search">
                <Search size={16} className="prx__searchIcon" />
                <input
                  type="search"
                  className="prx__searchInput"
                  placeholder="Search prizes, donors or category"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search prizes"
                />
                {query && (
                  <button
                    type="button"
                    className="prx__searchClear"
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
          <div className="prx__body">
            {isLoading && <Skeleton />}

            {error && !isLoading && (
              <div className="prx__err" role="alert">
                <AlertCircle size={16} />
                <div>
                  <strong>Couldn't load prizes</strong>
                  <span>{error.message || "Please try again."}</span>
                </div>
              </div>
            )}

            {!isLoading && !error && shown.length === 0 && (
              <EmptyState
                filtered={isFiltered}
                onReset={() => setQuery("")}
              />
            )}

            {!isLoading && !error && shown.length > 0 && (
              <div className="prx__list">
                {shown.map((p) => {
                  const isSponsorDonor = p.donor?.type === "sponsor";

                  return (
                    <article key={p.id} className="prx__card">
                      {/* trophy tile */}
                      <div className="prx__tile">
                        <Trophy size={22} />
                      </div>

                      {/* content */}
                      <div className="prx__content">
                        <div className="prx__titleRow">
                          <h3 className="prx__prizeTitle">{p.title}</h3>
                        </div>

                        {p.forWhat && (
                          <span className="prx__badge">
                            <Gift size={11} />
                            {p.forWhat}
                          </span>
                        )}

                        {p.description && (
                          <p className="prx__desc">{p.description}</p>
                        )}

                        {/* donor */}
                        {isSponsorDonor ? (
                          <Link
                            to={`/sponsors/${p.donor.id}`}
                            className="prx__donor prx__donor--link"
                          >
                            <Avatar
                              user={{
                                name: p.donor.name,
                                photoUrl: p.donor.photoUrl,
                              }}
                              className="prx__donorAv"
                            />
                            <span className="prx__donorText">
                              Sponsored by{" "}
                              <strong>{p.donor.name}</strong>
                            </span>
                            <ShieldCheck size={13} className="prx__donorVerify" />
                          </Link>
                        ) : (
                          <div className="prx__donor">
                            <span className="prx__donorHeart">
                              <Heart size={14} fill="currentColor" />
                            </span>
                            <span className="prx__donorText">
                              Gifted by{" "}
                              <strong>{p.donor?.name || "Anonymous"}</strong>
                            </span>
                          </div>
                        )}

                        {/* actions */}
                        {p.canEdit && (
                          <div className="prx__actions">
                            <button
                              type="button"
                              className="prx__btn prx__btn--edit"
                              onClick={() => setSheet({ prize: p })}
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="prx__btn prx__btn--danger"
                              disabled={del.isMutating}
                              onClick={() => setConfirming(p)}
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="pf__spacer" />
        <BottomNav />
      </div>

      {/* ---------- prize editor sheet ---------- */}
      {sheet && (
        <PrizeSheet
          prize={sheet.prize}
          isAdmin={isAdmin}
          onClose={() => setSheet(null)}
        />
      )}

      {/* ---------- confirm delete ---------- */}
      <ConfirmDialog
        open={!!confirming}
        prize={confirming}
        busy={del.isMutating}
        onCancel={() => setConfirming(null)}
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
}