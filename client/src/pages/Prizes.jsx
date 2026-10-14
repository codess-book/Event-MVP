import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Trophy, Plus, Pencil, Trash2, Heart, Sparkles, Gift,
  Search, X, Inbox, AlertCircle, Loader2, ShieldCheck,
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
    <div className="pz__dialogBackdrop" onClick={busy ? undefined : onCancel}>
      <div className="pz__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pz__dialogIcon">
          <Trash2 size={22} />
        </div>
        <h3 className="pz__dialogTitle">Remove this prize?</h3>
        <p className="pz__dialogText">
          <strong>{prize?.title}</strong> will be permanently removed. This
          can't be undone.
        </p>
        <div className="pz__dialogActions">
          <button type="button" className="pz__btn pz__btn--ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="pz__btn pz__btn--danger" onClick={onConfirm} disabled={busy}>
            {busy ? (<><Loader2 size={14} className="pz__spin" /> Removing…</>) : (<><Trash2 size={14} /> Remove</>)}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ skeleton ------------------------------ */
function Skeleton() {
  return (
    <div className="pz__list">
      {[1, 2, 3].map((i) => (
        <div key={i} className="pz__card pz__card--sk">
          <div className="pz__sk" style={{ width: 60, height: 60, borderRadius: 18 }} />
          <div style={{ flex: 1 }}>
            <div className="pz__sk" style={{ width: "60%", height: 16 }} />
            <div className="pz__sk" style={{ width: "35%", height: 12, marginTop: 8 }} />
            <div className="pz__sk" style={{ width: "80%", height: 12, marginTop: 10 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ empty state ------------------------------ */
function EmptyState({ filtered, onReset }) {
  return (
    <div className="pz__empty">
      <div className="pz__emptyIcon">
        {filtered ? <Inbox size={28} /> : <Trophy size={28} />}
      </div>
      <h3 className="pz__emptyTitle">
        {filtered ? "No prizes match" : "No prizes yet"}
      </h3>
      <p className="pz__emptyText">
        {filtered
          ? "Try a different search or category."
          : "Prizes will appear here as soon as they're announced."}
      </p>
      {filtered && (
        <button type="button" className="pz__emptyBtn" onClick={onReset}>
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

  const [sheet, setSheet] = useState(null);
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState(null);

  const isAdmin = user?.role === "admin";
  const canAdd = isAdmin || (user?.userType === "sponsor" && user?.isApproved);

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
        <div className="pz">
          <header className="pz__head">
            <div className="pz__headTop">
              <div>
                <h1 className="pz__title">
                  Prizes
                  <Sparkles size={16} className="pz__spark" />
                </h1>
                <p className="pz__sub">Play your best · win something special</p>
              </div>
              {prizes.length > 0 && (
                <span className="pz__count">{prizes.length}</span>
              )}
            </div>

            {canAdd && (
              <button type="button" className="pz__add" onClick={() => setSheet({ prize: null })}>
                <span className="pz__addIcon"><Plus size={18} /></span>
                <span className="pz__addText">
                  <strong>Add a prize</strong>
                  <small>Announce something new</small>
                </span>
              </button>
            )}

            {prizes.length > 0 && (
              <div className="pz__search">
                <Search size={16} className="pz__searchIcon" />
                <input
                  type="search"
                  className="pz__searchInput"
                  placeholder="Search prizes, donors or category"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search prizes"
                />
                {query && (
                  <button
                    type="button"
                    className="pz__searchClear"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </header>

          <div className="pz__body">
            {isLoading && <Skeleton />}

            {error && !isLoading && (
              <div className="pz__err" role="alert">
                <AlertCircle size={16} />
                <div>
                  <strong>Couldn't load prizes</strong>
                  <span>{error.message || "Please try again."}</span>
                </div>
              </div>
            )}

            {!isLoading && !error && shown.length === 0 && (
              <EmptyState filtered={isFiltered} onReset={() => setQuery("")} />
            )}

            {!isLoading && !error && shown.length > 0 && (
              <div className="pz__list">
                {shown.map((p) => {
                  const isSponsorDonor = p.donor?.type === "sponsor";
                  return (
                    <article key={p.id} className="pz__card">
                      <div className="pz__tile"><Trophy size={22} /></div>

                      <div className="pz__content">
                        <div className="pz__titleRow">
                          <h3 className="pz__prizeTitle">{p.title}</h3>
                        </div>

                        {p.forWhat && (
                          <span className="pz__badge">
                            <Gift size={11} />
                            {p.forWhat}
                          </span>
                        )}

                        {p.description && (
                          <p className="pz__desc">{p.description}</p>
                        )}

                        {isSponsorDonor ? (
                          <Link to={`/sponsors/${p.donor.id}`} className="pz__donor pz__donor--link">
                            <Avatar
                              user={{ name: p.donor.name, photoUrl: p.donor.photoUrl }}
                              className="pz__donorAv"
                            />
                            <span className="pz__donorText">
                              Sponsored by <strong>{p.donor.name}</strong>
                            </span>
                            <ShieldCheck size={13} className="pz__donorVerify" />
                          </Link>
                        ) : (
                          <div className="pz__donor">
                            <span className="pz__donorHeart">
                              <Heart size={14} fill="currentColor" />
                            </span>
                            <span className="pz__donorText">
                              Gifted by <strong>{p.donor?.name || "Anonymous"}</strong>
                            </span>
                          </div>
                        )}

                        {p.canEdit && (
                          <div className="pz__actions">
                            <button
                              type="button"
                              className="pz__btn pz__btn--edit"
                              onClick={() => setSheet({ prize: p })}
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              className="pz__btn pz__btn--danger"
                              disabled={del.isMutating}
                              onClick={() => setConfirming(p)}
                            >
                              <Trash2 size={14} /> Remove
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

      {sheet && (
        <PrizeSheet
          prize={sheet.prize}
          isAdmin={isAdmin}
          onClose={() => setSheet(null)}
        />
      )}

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