import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Search,
  X,
  Users,
  UserRound,
  Inbox,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import { useMembers } from "../hooks/members/useMembers";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import "./members.css";

/* ------------------------------ photo viewer (Instagram-style) ------------------------------ */
function PhotoViewer({ src, name, onClose }) {
  // Close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // Lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="memx__viewer" onClick={onClose} role="dialog" aria-label="Photo viewer">
      {/* top bar */}
      <div className="memx__viewerBar" onClick={(e) => e.stopPropagation()}>
        <span className="memx__viewerName">{name}</span>
        <button
          type="button"
          className="memx__viewerClose"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} />
        </button>
      </div>

      {/* image */}
      <div className="memx__viewerStage" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={name} className="memx__viewerImg" draggable={false} />
      </div>

      {/* tap hint */}
      <span className="memx__viewerHint">Tap anywhere to close</span>
    </div>
  );
}

/* ------------------------------ skeleton ------------------------------ */
function Skeleton() {
  return (
    <div className="memx__list">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="memx__card memx__card--sk">
          <div className="sk sk--logo" />
          <div className="memx__info">
            <div className="sk sk--line" style={{ width: "55%", height: 14 }} />
            <div className="sk sk--line" style={{ width: "35%", height: 11, marginTop: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ empty ------------------------------ */
function EmptyState({ filtered, onReset }) {
  return (
    <div className="memx__empty">
      <div className="memx__emptyIcon">
        {filtered ? <Inbox size={26} /> : <Users size={26} />}
      </div>
      <h3 className="memx__emptyTitle">
        {filtered ? "No matching members" : "No members yet"}
      </h3>
      <p className="memx__emptyText">
        {filtered
          ? "Try a different name or clear the search."
          : "The team list will show up here."}
      </p>
      {filtered && (
        <button type="button" className="memx__emptyBtn" onClick={onReset}>
          Clear search
        </button>
      )}
    </div>
  );
}

/* ------------------------------ main ------------------------------ */
export default function Members() {
  const { members = [], isLoading, error } = useMembers();
  const [query, setQuery] = useState("");
  const [viewer, setViewer] = useState(null); // { src, name } | null

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.name?.toLowerCase().includes(q));
  }, [members, query]);

  const isFiltered = query.trim() !== "";

  const openViewer = (member) => {
    if (!member.photoUrl) return; // no photo, no viewer
    setViewer({ src: member.photoUrl, name: member.name });
  };

  return (
    <div className="pf">
      <div className="pf__wrap">
        <div className="memx">
          {/* ---------- HEADER ---------- */}
          <header className="memx__header">
            <div className="memx__headerTop">
              <Link to="/profile" className="memx__backBtn" aria-label="Back">
                <ArrowLeft size={20} strokeWidth={2.4} />
              </Link>

              <div className="memx__headerCenter">
                <span className="memx__headerEyebrow">
                  <UserRound size={11} />
                  Meet the team
                </span>
                <h1 className="memx__headerTitle">Our Team</h1>
              </div>

              {members.length > 0 ? (
                <span className="memx__count">{members.length}</span>
              ) : (
                <span style={{ width: 40 }} />
              )}
            </div>

            {/* search */}
            {members.length > 0 && (
              <div className="memx__search">
                <Search size={16} className="memx__searchIcon" />
                <input
                  type="search"
                  className="memx__searchInput"
                  placeholder="Search by name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search members"
                />
                {query && (
                  <button
                    type="button"
                    className="memx__searchClear"
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
          <div className="memx__body">
            {isLoading && <Skeleton />}

            {error && !isLoading && (
              <div className="memx__err" role="alert">
                <strong>Couldn't load members</strong>
                <span>{error.message || "Please try again."}</span>
              </div>
            )}

            {!isLoading && !error && shown.length === 0 && (
              <EmptyState filtered={isFiltered} onReset={() => setQuery("")} />
            )}

            {!isLoading && !error && shown.length > 0 && (
              <div className="memx__list">
                {shown.map((x) => {
                  const hasPhoto = !!x.photoUrl;
                  return (
                    <div key={x.id} className="memx__card">
                      {/* avatar — clickable if photo exists */}
                      <button
                        type="button"
                        className={`memx__avatarWrap ${hasPhoto ? "is-clickable" : ""}`}
                        onClick={() => openViewer(x)}
                        disabled={!hasPhoto}
                        aria-label={hasPhoto ? `View ${x.name}'s photo` : undefined}
                      >
                        <Avatar
                          user={{ name: x.name, photoUrl: x.photoUrl }}
                          className="memx__avatar"
                        />
                      </button>

                      {/* info */}
                      <div className="memx__info">
                        <span className="memx__name">{x.name}</span>
                        <span className="memx__phone">
                          <Phone size={11} /> {x.phone}
                        </span>
                      </div>

                      {/* actions */}
                      <div className="memx__actions">
                        <a
                          className="memx__actionBtn memx__actionBtn--call"
                          href={`tel:+91${x.phone}`}
                          aria-label={`Call ${x.name}`}
                        >
                          <Phone size={16} />
                        </a>
                        <a
                          className="memx__actionBtn memx__actionBtn--wa"
                          href={`https://wa.me/91${x.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp ${x.name}`}
                        >
                          <MessageCircle size={16} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="pf__spacer" />
        <BottomNav />
      </div>

      {/* ---------- FULL-SCREEN VIEWER ---------- */}
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