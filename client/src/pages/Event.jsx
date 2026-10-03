// pages/Event.jsx
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Utensils,
  Droplets,
  Car,
  DoorOpen,
  Shirt,
  Swords,
  Info,
  MapPinned,
} from "lucide-react";
import { useEvent } from "../hooks/events/useEvents";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import "../lightcards.css";

export const todayIST = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
const fmtTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const fmtDay = (d) =>
  new Date(`${d}T12:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    weekday: "short",
  });

export const UPDATE_LABEL = {
  dresscode: "Dress code",
  challenge: "Challenge",
  other: "Update",
};
export const PLACE_LABEL = {
  washroom: "Washroom",
  food: "Food",
  water: "Water",
  parking: "Parking",
  entry: "Entry",
  other: "Other",
};

const PLACE_ICONS = {
  washroom: DoorOpen,
  food: Utensils,
  water: Droplets,
  parking: Car,
  entry: DoorOpen,
  other: MapPinned,
};

const UPDATE_ICONS = {
  dresscode: Shirt,
  challenge: Swords,
  other: Info,
};

/* ─────────────────────────────────────────────
   PREMIUM CHIP COMPONENT
───────────────────────────────────────────── */
const Chip = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`ev-chip ${active ? "ev-chip--active" : ""}`}
  >
    {Icon && <Icon size={15} strokeWidth={2.2} />}
    <span>{children}</span>
  </button>
);

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */
const SectionTitle = ({ children, count }) => (
  <div className="ev-section-title">
    <span>{children}</span>
    {count !== undefined && <span className="ev-section-count">{count}</span>}
  </div>
);

/* ─────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────── */
const EmptyState = ({ icon: Icon, title, hint }) => (
  <div className="ev-empty">
    <div className="ev-empty__icon">
      <Icon size={26} strokeWidth={1.6} />
    </div>
    <p className="ev-empty__title">{title}</p>
    {hint && <p className="ev-empty__hint">{hint}</p>}
  </div>
);

/* ─────────────────────────────────────────────
   TODAY TAB
───────────────────────────────────────────── */
function Today({ items }) {
  const today = todayIST();
  const order = { dresscode: 0, other: 1 };
  const upd = items
    .filter(
      (i) =>
        i.kind === "update" && i.category !== "challenge" && i.day === today,
    )
    .sort((a, b) => order[a.category] - order[b.category]);
  const sched = items
    .filter((i) => i.kind === "schedule" && i.day === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  if (!upd.length && !sched.length) {
    return (
      <EmptyState
        icon={Calendar}
        title="Nothing scheduled for today"
        hint="Check back soon — the schedule will appear here."
      />
    );
  }

  return (
    <div className="ev-stack">
      {upd.map((i) => {
        const Icon = UPDATE_ICONS[i.category] || Info;
        return (
          <div className="ev-card ev-card--highlight" key={i._id}>
            <div className="ev-card__row">
              <div className="ev-card__icon ev-card__icon--gold">
                <Icon size={18} strokeWidth={2} />
              </div>
              <div className="ev-card__content">
                <span className="ev-badge ev-badge--gold">
                  {UPDATE_LABEL[i.category]}
                </span>
                <h3 className="ev-card__title">{i.title}</h3>
                {i.body && <p className="ev-card__body">{i.body}</p>}
              </div>
            </div>
          </div>
        );
      })}

      {sched.length > 0 && (
        <>
          <SectionTitle count={sched.length}>Today's Schedule</SectionTitle>
          <div className="ev-timeline">
            {sched.map((i, idx) => (
              <div className="ev-timeline__item" key={i._id}>
                <div className="ev-timeline__dot" />
                {idx !== sched.length - 1 && (
                  <div className="ev-timeline__line" />
                )}
                <div className="ev-timeline__card">
                  <div className="ev-timeline__head">
                    <h3 className="ev-card__title">{i.title}</h3>
                    <span className="ev-timepill">
                      <Clock size={13} strokeWidth={2.4} />
                      {fmtTime(i.time)}
                    </span>
                  </div>
                  {i.body && <p className="ev-card__body">{i.body}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCHEDULE TAB
───────────────────────────────────────────── */
function Schedule({ items }) {
  const today = todayIST();
  const all = items.filter((i) => i.kind === "schedule");
  const days = [...new Set(all.map((i) => i.day))].sort();
  const [pick, setPick] = useState(null);
  const day =
    pick ||
    (days.includes(today) ? today : days.find((d) => d > today) || days.at(-1));

  if (!days.length) {
    return (
      <EmptyState
        icon={Calendar}
        title="Schedule coming soon"
        hint="The full event schedule will be posted shortly."
      />
    );
  }

  const dayItems = all
    .filter((i) => i.day === day)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="ev-stack">
      <div className="ev-chips-scroll">
        {days.map((d) => (
          <Chip key={d} active={d === day} onClick={() => setPick(d)}>
            {d === today ? "Today" : fmtDay(d)}
          </Chip>
        ))}
      </div>

      {dayItems.length === 0 ? (
        <EmptyState icon={Clock} title="No events this day" />
      ) : (
        <div className="ev-timeline">
          {dayItems.map((i, idx) => (
            <div className="ev-timeline__item" key={i._id}>
              <div className="ev-timeline__dot" />
              {idx !== dayItems.length - 1 && (
                <div className="ev-timeline__line" />
              )}
              <div className="ev-timeline__card">
                <div className="ev-timeline__head">
                  <h3 className="ev-card__title">{i.title}</h3>
                  <span className="ev-timepill">
                    <Clock size={13} strokeWidth={2.4} />
                    {fmtTime(i.time)}
                  </span>
                </div>
                {i.body && <p className="ev-card__body">{i.body}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   VENUE TAB
───────────────────────────────────────────── */
function Venue({ items }) {
  const [cat, setCat] = useState("");
  const places = items.filter(
    (i) => i.kind === "place" && (!cat || i.category === cat),
  );

  return (
    <div className="ev-stack">
      <div className="ev-chips-scroll">
        <Chip active={!cat} onClick={() => setCat("")}>
          All
        </Chip>
        {Object.entries(PLACE_LABEL).map(([k, v]) => {
          const Icon = PLACE_ICONS[k];
          return (
            <Chip
              key={k}
              active={cat === k}
              onClick={() => setCat(k)}
              icon={Icon}
            >
              {v}
            </Chip>
          );
        })}
      </div>

      {places.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No places added yet"
          hint="Venue details will show up here."
        />
      ) : (
        <div className="ev-grid">
          {places.map((i) => {
            const Icon = PLACE_ICONS[i.category] || MapPin;
            return (
              <div className="ev-venue-card" key={i._id}>
                <div className="ev-venue-card__top">
                  <div className="ev-venue-card__icon">
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <span className="ev-badge">{PLACE_LABEL[i.category]}</span>
                </div>
                <h3 className="ev-card__title">{i.title}</h3>
                {i.body && <p className="ev-card__body">{i.body}</p>}
                {i.mapLink && (
                  <a
                    className="ev-mapbtn"
                    href={i.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin size={15} strokeWidth={2.4} />
                    Open in Maps
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DEBUG
───────────────────────────────────────────── */
function Debug({ items }) {
  return (
    <pre className="ev-debug">
      {`today (IST): ${todayIST()}\nitems loaded: ${items.length}\n\n` +
        items
          .map(
            (i) =>
              `${i.kind} | ${i.category || "-"} | ${i.day || "-"} | ${i.time || "-"} | ${i.title}`,
          )
          .join("\n")}
    </pre>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function Event() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { items, isLoading, error } = useEvent();
  const [tab, setTab] = useState("today");
  const TABS = { today: Today, schedule: Schedule, venue: Venue };
  const View = TABS[tab];

  return (
    <div className="pf lc ev-page">
      <div className="pf__wrap">
        {/* Header */}
        <header className="ev-header">
          <Link to="/profile" className="ev-backbtn" aria-label="Back">
            <ArrowLeft size={20} strokeWidth={2.4} />
          </Link>
          <div className="ev-header__center">
            <span className="ev-header__eyebrow">Live Updates</span>
            <h1 className="ev-header__title">Event</h1>
          </div>
          <span style={{ width: 42 }} />
        </header>

        {/* Tabs */}
        <nav className="ev-tabs">
          <Chip active={tab === "today"} onClick={() => setTab("today")}>
            Today
          </Chip>
          <Chip active={false} onClick={() => navigate("/challenges")}>
            Challenge
          </Chip>
          <Chip active={tab === "schedule"} onClick={() => setTab("schedule")}>
            Schedule
          </Chip>
          <Chip active={tab === "venue"} onClick={() => setTab("venue")}>
            Venue
          </Chip>
        </nav>

        {/* Content */}
        <div className="ev-content">
          {isLoading && (
            <div className="ev-loader">
              <div className="ev-loader__spinner" />
              <p>Loading event details…</p>
            </div>
          )}

          {error && (
            <div className="ev-error">
              <Info size={18} />
              <span>{error.message}</span>
            </div>
          )}

          {!isLoading && !error && <View items={items} />}

          {params.get("debug") === "1" && <Debug items={items} />}
        </div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════
           EVENT PAGE — PROFESSIONAL UI
        ═══════════════════════════════════════════ */
        .ev-page {
          --ev-primary: #6b0f1a;
          --ev-primary-soft: #8a1a28;
          --ev-gold: #c9a227;
          --ev-gold-soft: #e5c76b;
          --ev-ink: #1a1416;
          --ev-muted: #6b6467;
          --ev-line: #ece7e3;
          --ev-surface: #ffffff;
          --ev-bg: #faf8f6;
          --ev-radius: 16px;
          --ev-radius-sm: 12px;
          --ev-shadow: 0 1px 2px rgba(26,20,22,0.04), 0 4px 16px rgba(26,20,22,0.05);
          --ev-shadow-hover: 0 2px 4px rgba(26,20,22,0.06), 0 8px 24px rgba(26,20,22,0.08);
          background: var(--ev-bg);
          min-height: 100vh;
        }

        /* ── Header ── */
        .ev-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px 14px;
          background: linear-gradient(180deg, #ffffff 0%, #faf8f6 100%);
          border-bottom: 1px solid var(--ev-line);
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(8px);
        }
        .ev-backbtn {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: var(--ev-surface);
          border: 1px solid var(--ev-line);
          color: var(--ev-ink);
          transition: all 0.2s ease;
        }
        .ev-backbtn:hover {
          background: var(--ev-primary);
          border-color: var(--ev-primary);
          color: #fff;
          transform: translateX(-2px);
        }
        .ev-header__center {
          text-align: center;
          line-height: 1.15;
        }
        .ev-header__eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          color: var(--ev-gold);
        }
        .ev-header__title {
          font-size: 21px;
          font-weight: 800;
          color: var(--ev-ink);
          margin: 2px 0 0;
          letter-spacing: -0.3px;
        }

        /* ── Tabs ── */
        .ev-tabs {
          display: flex;
          gap: 8px;
          padding: 16px 20px 4px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .ev-tabs::-webkit-scrollbar { display: none; }

        .ev-chips-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 4px 0 12px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .ev-chips-scroll::-webkit-scrollbar { display: none; }

        /* ── Chip ── */
        .ev-chip {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          font-size: 13px;
          font-weight: 600;
          color: var(--ev-muted);
          background: var(--ev-surface);
          border: 1.5px solid var(--ev-line);
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          font-family: inherit;
        }
        .ev-chip:hover {
          border-color: var(--ev-primary);
          color: var(--ev-primary);
          transform: translateY(-1px);
        }
        .ev-chip--active {
          background: linear-gradient(135deg, var(--ev-primary) 0%, var(--ev-primary-soft) 100%);
          color: #fff;
          border-color: var(--ev-primary);
          box-shadow: 0 4px 12px rgba(107, 15, 26, 0.25);
        }
        .ev-chip--active:hover {
          color: #fff;
          transform: translateY(-1px);
        }

        /* ── Content wrapper ── */
        .ev-content {
          padding: 8px 20px 40px;
        }
        .ev-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ── Section title ── */
        .ev-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 20px 0 4px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: var(--ev-muted);
        }
        .ev-section-title::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, var(--ev-line), transparent);
        }
        .ev-section-count {
          display: inline-grid;
          place-items: center;
          min-width: 22px;
          height: 22px;
          padding: 0 7px;
          font-size: 11px;
          font-weight: 800;
          color: var(--ev-primary);
          background: rgba(107, 15, 26, 0.08);
          border-radius: 999px;
        }

        /* ── Card base ── */
        .ev-card {
          background: var(--ev-surface);
          border: 1px solid var(--ev-line);
          border-radius: var(--ev-radius);
          padding: 18px;
          box-shadow: var(--ev-shadow);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ev-card:hover {
          box-shadow: var(--ev-shadow-hover);
          transform: translateY(-2px);
        }
        .ev-card--highlight {
          background: linear-gradient(135deg, #fffdf7 0%, #fff9ec 100%);
          border-color: rgba(201, 162, 39, 0.3);
        }
        .ev-card__row {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .ev-card__icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: rgba(107, 15, 26, 0.07);
          color: var(--ev-primary);
        }
        .ev-card__icon--gold {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.18), rgba(201, 162, 39, 0.08));
          color: var(--ev-gold);
        }
        .ev-card__content { flex: 1; min-width: 0; }
        .ev-card__title {
          font-size: 15.5px;
          font-weight: 700;
          color: var(--ev-ink);
          margin: 6px 0 4px;
          line-height: 1.35;
          letter-spacing: -0.2px;
        }
        .ev-card__body {
          font-size: 13.5px;
          line-height: 1.55;
          color: var(--ev-muted);
          margin: 4px 0 0;
        }

        /* ── Badge ── */
        .ev-badge {
          display: inline-block;
          padding: 3px 10px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--ev-primary);
          background: rgba(107, 15, 26, 0.08);
          border-radius: 999px;
        }
        .ev-badge--gold {
          color: #8a6d0e;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.22), rgba(201, 162, 39, 0.12));
        }

        /* ── Timeline ── */
        .ev-timeline {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-left: 4px;
        }
        .ev-timeline__item {
          position: relative;
          padding-left: 28px;
          padding-bottom: 12px;
        }
        .ev-timeline__dot {
          position: absolute;
          left: 0;
          top: 18px;
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: var(--ev-gold);
          border: 2.5px solid #fff;
          box-shadow: 0 0 0 2px rgba(201, 162, 39, 0.28);
          z-index: 2;
        }
        .ev-timeline__line {
          position: absolute;
          left: 5px;
          top: 24px;
          bottom: -4px;
          width: 2px;
          background: linear-gradient(180deg, rgba(201, 162, 39, 0.4), rgba(201, 162, 39, 0.1));
          z-index: 1;
        }
        .ev-timeline__card {
          background: var(--ev-surface);
          border: 1px solid var(--ev-line);
          border-radius: var(--ev-radius-sm);
          padding: 14px 16px;
          box-shadow: var(--ev-shadow);
          transition: all 0.25s ease;
        }
        .ev-timeline__card:hover {
          box-shadow: var(--ev-shadow-hover);
          transform: translateX(3px);
          border-color: rgba(107, 15, 26, 0.2);
        }
        .ev-timeline__head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        .ev-timeline__head .ev-card__title { margin-top: 0; }

        /* ── Time pill ── */
        .ev-timepill {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          font-size: 11.5px;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, var(--ev-primary) 0%, var(--ev-primary-soft) 100%);
          border-radius: 999px;
          letter-spacing: 0.2px;
          box-shadow: 0 2px 8px rgba(107, 15, 26, 0.22);
          white-space: nowrap;
        }

        /* ── Venue grid ── */
        .ev-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .ev-venue-card {
          background: var(--ev-surface);
          border: 1px solid var(--ev-line);
          border-radius: var(--ev-radius);
          padding: 18px;
          box-shadow: var(--ev-shadow);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ev-venue-card:hover {
          box-shadow: var(--ev-shadow-hover);
          transform: translateY(-3px);
          border-color: rgba(107, 15, 26, 0.18);
        }
        .ev-venue-card__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .ev-venue-card__icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(107, 15, 26, 0.09), rgba(107, 15, 26, 0.04));
          color: var(--ev-primary);
        }
        .ev-venue-card .ev-card__title { margin-top: 0; }
        .ev-mapbtn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding: 8px 14px;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--ev-primary);
          background: rgba(107, 15, 26, 0.06);
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .ev-mapbtn:hover {
          background: var(--ev-primary);
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(107, 15, 26, 0.22);
        }

        /* ── Empty state ── */
        .ev-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 48px 24px;
          background: var(--ev-surface);
          border: 1px dashed var(--ev-line);
          border-radius: var(--ev-radius);
        }
        .ev-empty__icon {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.14), rgba(201, 162, 39, 0.05));
          color: var(--ev-gold);
          margin-bottom: 14px;
        }
        .ev-empty__title {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--ev-ink);
          margin: 0 0 4px;
        }
        .ev-empty__hint {
          font-size: 13px;
          color: var(--ev-muted);
          margin: 0;
          max-width: 240px;
          line-height: 1.5;
        }

        /* ── Loader ── */
        .ev-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          padding: 60px 20px;
          color: var(--ev-muted);
          font-size: 13.5px;
        }
        .ev-loader__spinner {
          width: 34px;
          height: 34px;
          border: 3px solid var(--ev-line);
          border-top-color: var(--ev-primary);
          border-radius: 50%;
          animation: ev-spin 0.8s linear infinite;
        }
        @keyframes ev-spin { to { transform: rotate(360deg); } }

        /* ── Error ── */
        .ev-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          font-size: 13.5px;
          font-weight: 500;
          color: #8a1a28;
          background: #fdf2f3;
          border: 1px solid #f5d0d4;
          border-radius: var(--ev-radius-sm);
        }

        /* ── Debug ── */
        .ev-debug {
          font-size: 11px;
          white-space: pre-wrap;
          background: #fff;
          padding: 12px;
          border-radius: var(--ev-radius-sm);
          border: 1px solid var(--ev-line);
          overflow-x: auto;
          color: var(--ev-muted);
          margin-top: 16px;
        }

        /* ── Responsive ── */
        @media (min-width: 640px) {
          .ev-grid { grid-template-columns: 1fr 1fr; }
          .ev-header { padding: 22px 28px 18px; }
          .ev-tabs { padding: 18px 28px 4px; }
          .ev-content { padding: 8px 28px 48px; }
        }
        @media (min-width: 900px) {
          .ev-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
}
