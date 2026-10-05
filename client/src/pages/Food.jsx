// pages/Food.jsx
import { useMemo, useState } from "react";
import {
  Search,
  X,
  Star,
  MapPin,
  ChevronDown,
  Inbox,
  UtensilsCrossed,
  Sparkles,
  Check,
  AlertCircle,
  Phone,
  UserRound,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import { useToast } from "../components/Toast";
import { useMe } from "../hooks/auth/useMe";
import { useFoodStalls, useRateStall } from "../hooks/food/useFood";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import "../Food.css";

/* ------------------------------ stars ------------------------------ */
function Stars({ value, onRate, disabled }) {
  return (
    <div className="fdx__stars" role="group" aria-label="Rate this stall">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`fdx__star ${n <= value ? "is-on" : ""}`}
          disabled={disabled}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onRate(n)}
        >
          <Star size={22} fill={n <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ helpers ------------------------------ */
function groupMenu(menu) {
  const map = new Map();
  menu.forEach((i) => {
    const k = i.category || "Menu";
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(i);
  });
  return [...map.entries()];
}

const onlyDigits = (v) => String(v || "").replace(/\D/g, "");

const telLink = (num) => {
  const d = onlyDigits(num);
  if (!d) return "";
  return `tel:+91${d}`;
};

const waLink = (num) => {
  const d = onlyDigits(num);
  if (!d) return "";
  return `https://wa.me/${d.length === 10 ? `91${d}` : d}`;
};

/* ------------------------------ stall card ------------------------------ */
function StallCard({ stall, open, onToggle, canRate }) {
  const toast = useToast();
  const rate = useRateStall();

  const onRate = async (stars) => {
    try {
      await rate.trigger({ id: stall.id, stars });
      toast("Thanks for rating!", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const ratingText = stall.ratingCount
    ? `${stall.ratingAvg.toFixed(1)} (${stall.ratingCount})`
    : "New";

  // Owner info — hook se aa raha hoga (check karo)
  const ownerName = stall.ownerName || stall.name || "";
  const ownerPhone = stall.ownerPhone || stall.phone || "";
  const wa = waLink(ownerPhone);

  return (
    <article className={`fdx__card ${open ? "is-open" : ""}`}>
      {/* ---------- HEADER ---------- */}
      <button
        type="button"
        className="fdx__head"
        onClick={onToggle}
        aria-expanded={open}
      >
        <div className="fdx__avatarWrap">
          <Avatar
            user={{ name: stall.businessName, photoUrl: stall.photoUrl }}
            className="fdx__avatar"
          />
        </div>

        <div className="fdx__info">
          <div className="fdx__nameRow">
            <span className="fdx__name">{stall.businessName}</span>
            <span
              className={`fdx__openDot ${
                stall.isOpen ? "is-open" : "is-closed"
              }`}
              title={stall.isOpen ? "Open" : "Closed"}
            />
          </div>

          {/* Owner name — naya */}
          {ownerName && (
            <span className="fdx__owner">
              <UserRound size={11} />
              {ownerName}
            </span>
          )}

          <div className="fdx__meta">
            {stall.stallNumber && (
              <span className="fdx__chip">
                <MapPin size={10} /> Stall {stall.stallNumber}
              </span>
            )}
            <span
              className={`fdx__chip ${
                stall.isOpen ? "fdx__chip--open" : "fdx__chip--closed"
              }`}
            >
              {stall.isOpen ? "Open" : "Closed"}
            </span>
            <span className="fdx__chip fdx__chip--rating">
              <Star size={10} fill="currentColor" />
              {ratingText}
            </span>
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`fdx__chev ${open ? "is-open" : ""}`}
        />
      </button>

      {/* ---------- BODY ---------- */}
      {open && (
        <div className="fdx__body">
          {/* ---------- OWNER CONTACT — naya ---------- */}
          {ownerName && (
            <div className="fdx__ownerCard">
              <div className="fdx__ownerLeft">
                <div className="fdx__ownerAvatar">
                  <UserRound size={16} />
                </div>
                <div className="fdx__ownerInfo">
                  <span className="fdx__ownerLabel">Stall owner</span>
                  <strong className="fdx__ownerName">{ownerName}</strong>
                  {ownerPhone && (
                    <span className="fdx__ownerPhone">{ownerPhone}</span>
                  )}
                </div>
              </div>

              {ownerPhone && (
                <div className="fdx__ownerActions">
                  <a
                    className="fdx__ownerBtn fdx__ownerBtn--call"
                    href={telLink(ownerPhone)}
                    aria-label={`Call ${ownerName}`}
                  >
                    <Phone size={15} />
                  </a>
                  {wa && (
                    <a
                      className="fdx__ownerBtn fdx__ownerBtn--wa"
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${ownerName}`}
                    >
                      <UtensilsCrossed size={15} />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ---------- MENU ---------- */}
          {stall.menu?.length === 0 ? (
            <div className="fdx__emptyMenu">
              <UtensilsCrossed size={20} />
              <p>Menu coming soon</p>
            </div>
          ) : (
            groupMenu(stall.menu || []).map(([cat, items]) => (
              <section className="fdx__menuSection" key={cat}>
                <h3 className="fdx__catTitle">
                  <span className="fdx__catBar" aria-hidden="true" />
                  {cat}
                  <span className="fdx__catCount">{items.length}</span>
                </h3>
                <ul className="fdx__items">
                  {items.map((i) => (
                    <li
                      key={i.id}
                      className={`fdx__item ${i.available ? "" : "is-off"}`}
                    >
                      <span className="fdx__itemDot" aria-hidden="true" />
                      <span className="fdx__iname">
                        {i.name}
                        {!i.available && <em> · Sold out</em>}
                      </span>
                      <span className="fdx__price">₹{i.price}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}

          {canRate && (
            <div className="fdx__rate">
              <div className="fdx__rateInfo">
                <span className="fdx__rateLabel">
                  {stall.myRating ? "Your rating" : "Rate this stall"}
                </span>
                {stall.myRating > 0 && (
                  <span className="fdx__rateValue">
                    <Check size={11} /> {stall.myRating}/5
                  </span>
                )}
              </div>
              <Stars
                value={stall.myRating}
                onRate={onRate}
                disabled={rate.isMutating}
              />
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ------------------------------ skeleton ------------------------------ */
function Skeleton() {
  return (
    <div className="fdx__list">
      {[1, 2, 3].map((i) => (
        <div key={i} className="fdx__card fdx__card--sk">
          <div className="fdx__head">
            <div className="fdx__avatarWrap">
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

/* ------------------------------ main ------------------------------ */
export default function Food() {
  const { user } = useMe();
  const { stalls = [], isLoading, error } = useFoodStalls();
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("all");

  const canRate = user && user.userType !== "foodPartner";

  const openCount = stalls.filter((s) => s.isOpen).length;

  /* 🔍 FIXED SEARCH — handles undefined fields + owner */
  const shown = useMemo(() => {
    let list = stalls;
    if (filter === "open") list = list.filter((s) => s.isOpen);

    const q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter((s) => {
      const name = (s.businessName || "").toLowerCase();
      const owner = (s.ownerName || s.name || "").toLowerCase();
      const phone = (s.ownerPhone || s.phone || "").toLowerCase();
      const stallNo = (s.stallNumber || "").toLowerCase();
      const inMenu = (s.menu || []).some((i) =>
        (i.name || "").toLowerCase().includes(q)
      );
      const inCategory = (s.menu || []).some((i) =>
        (i.category || "").toLowerCase().includes(q)
      );

      return (
        name.includes(q) ||
        owner.includes(q) ||
        phone.includes(q) ||
        stallNo.includes(q) ||
        inMenu ||
        inCategory
      );
    });
  }, [stalls, query, filter]);

  return (
    <div className="pf">
      <div className="pf__wrap">
        <div className="fdx">
          {/* ---------- HEADER ---------- */}
          <header className="fdx__header">
            <div className="fdx__headTop">
              <div>
                <h1 className="fdx__title">
                  Food Stalls
                  <Sparkles size={16} className="fdx__titleSpark" />
                </h1>
                <p className="fdx__subtitle">Menu, prices & ratings</p>
              </div>
              {stalls.length > 0 && (
                <span
                  className="fdx__count"
                  aria-label={`${stalls.length} stalls`}
                >
                  {stalls.length}
                </span>
              )}
            </div>

            {/* search */}
            <div className="fdx__search">
              <Search size={16} className="fdx__searchIcon" />
              <input
                type="search"
                className="fdx__searchInput"
                placeholder="Search stall, dish or owner"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search food stalls"
              />
              {query && (
                <button
                  type="button"
                  className="fdx__searchClear"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* filter chips */}
            {stalls.length > 0 && (
              <div className="fdx__filterTabs" role="group" aria-label="Filter">
                <button
                  type="button"
                  className={`fdx__filterTab ${
                    filter === "all" ? "is-active" : ""
                  }`}
                  onClick={() => setFilter("all")}
                  aria-pressed={filter === "all"}
                >
                  All <span className="fdx__filterCount">{stalls.length}</span>
                </button>
                <button
                  type="button"
                  className={`fdx__filterTab ${
                    filter === "open" ? "is-active" : ""
                  }`}
                  onClick={() => setFilter("open")}
                  aria-pressed={filter === "open"}
                >
                  <span className="fdx__filterDot" />
                  Open <span className="fdx__filterCount">{openCount}</span>
                </button>
              </div>
            )}
          </header>

          {/* ---------- BODY ---------- */}
          <div className="fdx__body">
            {isLoading && <Skeleton />}

            {error && !isLoading && (
              <div className="fdx__err" role="alert">
                <AlertCircle size={16} />
                <div>
                  <strong>Couldn't load food stalls</strong>
                  <span>{error.message || "Please try again."}</span>
                </div>
              </div>
            )}

            {!isLoading && !error && shown.length === 0 && (
              <div className="fdx__empty">
                <div className="fdx__emptyIcon">
                  <Inbox size={28} />
                </div>
                <h3 className="fdx__emptyTitle">
                  {query
                    ? "Nothing found"
                    : filter === "open"
                      ? "No stalls open right now"
                      : "No stalls yet"}
                </h3>
                <p className="fdx__emptyText">
                  {query
                    ? "Try a different dish, stall or owner name."
                    : filter === "open"
                      ? "Check back in a bit — they'll open soon."
                      : "Stalls will appear here soon."}
                </p>
              </div>
            )}

            {!isLoading && !error && shown.length > 0 && (
              <div className="fdx__list">
                {shown.map((s) => (
                  <StallCard
                    key={s.id}
                    stall={s}
                    open={openId === s.id}
                    onToggle={() => setOpenId(openId === s.id ? null : s.id)}
                    canRate={canRate}
                  />
                ))}
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