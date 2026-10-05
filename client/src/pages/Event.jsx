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
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useEvent } from "../hooks/events/useEvents";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import "../event.css";

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
  other: MapPin,
};

const UPDATE_ICONS = {
  dresscode: Shirt,
  challenge: Swords,
  other: Info,
};

/* ------------------------------ chip ------------------------------ */
const Chip = ({ active, onClick, children, icon: Icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`evx__chip ${active ? "is-active" : ""}`}
  >
    {Icon && <Icon size={14} strokeWidth={2.2} />}
    <span>{children}</span>
  </button>
);

/* ------------------------------ section title ------------------------------ */
const SectionTitle = ({ children, count }) => (
  <div className="evx__sectionTitle">
    <span className="evx__sectionTitleText">{children}</span>
    {count !== undefined && <span className="evx__sectionCount">{count}</span>}
    <span className="evx__sectionLine" aria-hidden="true" />
  </div>
);

/* ------------------------------ empty state ------------------------------ */
const EmptyState = ({ icon: Icon, title, hint }) => (
  <div className="evx__empty">
    <div className="evx__emptyIcon">
      <Icon size={26} strokeWidth={1.6} />
    </div>
    <p className="evx__emptyTitle">{title}</p>
    {hint && <p className="evx__emptyHint">{hint}</p>}
  </div>
);

/* ------------------------------ TODAY TAB ------------------------------ */
function Today({ items }) {
  const today = todayIST();
  const order = { dresscode: 0, other: 1 };

  const upd = items
    .filter(
      (i) =>
        i.kind === "update" && i.category !== "challenge" && i.day === today
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
    <div className="evx__stack">
      {upd.map((i) => {
        const Icon = UPDATE_ICONS[i.category] || Info;
        return (
          <div className="evx__hero" key={i._id}>
            <div className="evx__heroGlow" aria-hidden="true" />
            <div className="evx__heroRow">
              <div className="evx__heroIcon">
                <Icon size={18} strokeWidth={2} />
              </div>
              <div className="evx__heroContent">
                <span className="evx__badge evx__badge--gold">
                  <Sparkles size={10} />
                  {UPDATE_LABEL[i.category]}
                </span>
                <h3 className="evx__heroTitle">{i.title}</h3>
                {i.body && <p className="evx__heroBody">{i.body}</p>}
              </div>
            </div>
          </div>
        );
      })}

      {sched.length > 0 && (
        <>
          <SectionTitle count={sched.length}>Today's Schedule</SectionTitle>
          <div className="evx__timeline">
            {sched.map((i, idx) => (
              <div className="evx__timelineItem" key={i._id}>
                <div className="evx__timelineDot" aria-hidden="true" />
                {idx !== sched.length - 1 && (
                  <div className="evx__timelineLine" aria-hidden="true" />
                )}
                <div className="evx__timelineCard">
                  <div className="evx__timelineHead">
                    <h3 className="evx__cardTitle">{i.title}</h3>
                    <span className="evx__timePill">
                      <Clock size={12} strokeWidth={2.4} />
                      {fmtTime(i.time)}
                    </span>
                  </div>
                  {i.body && <p className="evx__cardBody">{i.body}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------ SCHEDULE TAB ------------------------------ */
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
    <div className="evx__stack">
      <div className="evx__chipsScroll">
        {days.map((d) => (
          <Chip key={d} active={d === day} onClick={() => setPick(d)}>
            {d === today ? "Today" : fmtDay(d)}
          </Chip>
        ))}
      </div>

      {dayItems.length === 0 ? (
        <EmptyState icon={Clock} title="No events this day" />
      ) : (
        <div className="evx__timeline">
          {dayItems.map((i, idx) => (
            <div className="evx__timelineItem" key={i._id}>
              <div className="evx__timelineDot" aria-hidden="true" />
              {idx !== dayItems.length - 1 && (
                <div className="evx__timelineLine" aria-hidden="true" />
              )}
              <div className="evx__timelineCard">
                <div className="evx__timelineHead">
                  <h3 className="evx__cardTitle">{i.title}</h3>
                  <span className="evx__timePill">
                    <Clock size={12} strokeWidth={2.4} />
                    {fmtTime(i.time)}
                  </span>
                </div>
                {i.body && <p className="evx__cardBody">{i.body}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ DEBUG ------------------------------ */
function Debug({ items }) {
  return (
    <pre className="evx__debug">
      {`today (IST): ${todayIST()}\nitems loaded: ${items.length}\n\n` +
        items
          .map(
            (i) =>
              `${i.kind} | ${i.category || "-"} | ${i.day || "-"} | ${i.time || "-"} | ${i.title}`
          )
          .join("\n")}
    </pre>
  );
}

/* ------------------------------ MAIN ------------------------------ */
export default function Event() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { items, isLoading, error } = useEvent();
  const [tab, setTab] = useState("today");

  const TABS = { today: Today, schedule: Schedule };
  const View = TABS[tab];

  return (
    <div className="pf evx">
      <div className="pf__wrap">
        {/* ---------- HEADER ---------- */}
        <header className="evx__header">
          <Link to="/profile" className="evx__backBtn" aria-label="Back">
            <ArrowLeft size={20} strokeWidth={2.4} />
          </Link>

          <div className="evx__headerCenter">
            <span className="evx__headerEyebrow">
              <Sparkles size={11} />
              Live Updates
            </span>
            <h1 className="evx__headerTitle">Event</h1>
          </div>

          <span style={{ width: 42 }} />
        </header>

        {/* ---------- TABS ---------- */}
        <nav className="evx__tabs" aria-label="Event sections">
          <Chip active={tab === "today"} onClick={() => setTab("today")}>
            Today
          </Chip>
          <Chip active={false} onClick={() => navigate("/challenges")}>
            Challenge
            <ChevronRight size={12} />
          </Chip>
          <Chip active={tab === "schedule"} onClick={() => setTab("schedule")}>
            Schedule
          </Chip>
        </nav>

        {/* ---------- CONTENT ---------- */}
        <div className="evx__content">
          {isLoading && (
            <div className="evx__loader">
              <div className="evx__loaderSpinner" />
              <p>Loading event details…</p>
            </div>
          )}

          {error && (
            <div className="evx__error" role="alert">
              <Info size={16} />
              <span>{error.message}</span>
            </div>
          )}

          {!isLoading && !error && <View items={items} />}

          {params.get("debug") === "1" && <Debug items={items} />}
        </div>
      </div>
    </div>
  );
}