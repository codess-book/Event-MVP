import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Tag,
  ChevronRight,
  Search,
  Sparkles,
  Store,
  MapPin,
  X,
  ShieldCheck,
  Star,
  Inbox,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import { useSponsors } from "../hooks/sponsors/useSponsors";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";

/* ------------------------------ skeleton ------------------------------ */
function Skeleton() {
  return (
    <div className="spx__list">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="spx__card spx__card--sk">
          <div className="sk sk--logo" />
          <div className="spx__info">
            <div className="sk sk--line" style={{ width: "60%", height: 14 }} />
            <div
              className="sk sk--line"
              style={{ width: "40%", height: 11, marginTop: 8 }}
            />
            <div
              className="sk sk--line"
              style={{ width: "75%", height: 11, marginTop: 10 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ empty state ------------------------------ */
function EmptyState({ filtered, onReset }) {
  return (
    <div className="spx__empty">
      <div className="spx__emptyIcon">
        <Inbox size={28} />
      </div>
      <h3 className="spx__emptyTitle">
        {filtered ? "No sponsors in this category" : "No sponsors yet"}
      </h3>
      <p className="spx__emptyText">
        {filtered
          ? "Try a different category or search term."
          : "New partners are joining every week. Check back soon."}
      </p>
      {filtered && (
        <button type="button" className="spx__emptyBtn" onClick={onReset}>
          Show all sponsors
        </button>
      )}
    </div>
  );
}

/* ------------------------------ main ------------------------------ */
export default function Sponsors() {
  const { sponsors = [], isLoading, error } = useSponsors();
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");

  /* categories */
  const cats = useMemo(
    () => ["All", ...new Set(sponsors.map((s) => s.category).filter(Boolean))],
    [sponsors],
  );

  /* filtered + searched list */
  const shown = useMemo(() => {
    let list =
      cat === "All" ? sponsors : sponsors.filter((s) => s.category === cat);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.businessName?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          s.address?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [sponsors, cat, query]);

  /* count of live offers per sponsor */
  const liveCount = (s) => (s.offers || []).filter((o) => !o.expired).length;

  const isFiltered = cat !== "All" || query.trim() !== "";

  const resetFilters = () => {
    setCat("All");
    setQuery("");
  };

  return (
    <div className="pf">
      <div className="pf__wrap">
        <div className="spx">
          {/* ---------- HEADER ---------- */}
          <header className="spx__head">
            <div className="spx__headTop">
              <div>
                <h1 className="spx__title">
                  Our Sponsors
                  <Sparkles size={16} className="spx__titleSpark" />
                </h1>
                <p className="spx__subtitle">
                  Show your pass · unlock exclusive offers
                </p>
              </div>
              {sponsors.length > 0 && (
                <span
                  className="spx__count"
                  aria-label={`${sponsors.length} sponsors`}
                >
                  {sponsors.length}
                </span>
              )}
            </div>

            {/* search */}
            <div className="spx__search">
              <Search size={16} className="spx__searchIcon" />
              <input
                type="search"
                className="spx__searchInput"
                placeholder="Search sponsors, category or area"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search sponsors"
              />
              {query && (
                <button
                  type="button"
                  className="spx__searchClear"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* categories */}
            {cats.length > 2 && (
              <div
                className="spx__cats"
                role="group"
                aria-label="Filter by category"
              >
                {cats.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`spx__cat ${cat === c ? "is-active" : ""}`}
                    aria-pressed={cat === c}
                    onClick={() => setCat(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </header>

          {/* ---------- LIST ---------- */}
          <div className="spx__body">
            {isLoading && <Skeleton />}

            {error && !isLoading && (
              <div className="spx__err" role="alert">
                <strong>Couldn't load sponsors</strong>
                <span>{error.message || "Please try again."}</span>
              </div>
            )}

            {!isLoading && !error && shown.length === 0 && (
              <EmptyState filtered={isFiltered} onReset={resetFilters} />
            )}

            {!isLoading && !error && shown.length > 0 && (
              <div className="spx__list">
                {shown.map((s) => {
                  const live = (s.offers || []).filter((o) => !o.expired);
                  const hasOffers = live.length > 0;

                  return (
                    <Link
                      key={s.id}
                      to={`/sponsors/${s.id}`}
                      className="spx__card"
                      aria-label={`${s.businessName}${s.category ? `, ${s.category}` : ""}`}
                    >
                      {/* logo with live dot */}
                      <div className="spx__logoWrap">
                        <Avatar
                          user={{ name: s.businessName, photoUrl: s.photoUrl }}
                          className="spx__logo"
                        />
                        {hasOffers && (
                          <span className="spx__liveDot" aria-hidden="true" />
                        )}
                      </div>

                      {/* info */}
                      <div className="spx__info">
                        <div className="spx__nameRow">
                          <span className="spx__name">{s.businessName}</span>
                          {s.verified && (
                            <ShieldCheck size={14} className="spx__verified" />
                          )}
                        </div>

                        <div className="spx__metaRow">
                          {s.category && (
                            <span className="spx__catChip">
                              <Store size={11} /> {s.category}
                            </span>
                          )}
                          {s.rating != null && (
                            <span className="spx__ratingChip">
                              <Star size={10} fill="currentColor" />{" "}
                              {s.rating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        {s.address && (
                          <div className="spx__addr">
                            <MapPin size={11} />
                            <span>{s.address}</span>
                          </div>
                        )}

                        {hasOffers && (
                          <div className="spx__offer">
                            <Tag size={12} />
                            <span className="spx__offerText">
                              {live[0].title}
                            </span>
                            {live.length > 1 && (
                              <span className="spx__offerMore">
                                +{live.length - 1}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <ChevronRight size={18} className="spx__chev" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="pf__spacer" />
        <BottomNav />
      </div>
    </div>
  );
}
