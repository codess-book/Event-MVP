import { Link } from "react-router-dom";
import { Pencil, Phone, Ticket, User as UserIcon } from "lucide-react";
import Avatar from "../components/Avatar";
import "../Profilecard.css";

/* ---------- SVG art (koi image file nahi chahiye) ---------- */

const Dandiya = ({ flip }) => (
  <svg
    className={`pc__stick ${flip ? "is-flip" : ""}`}
    viewBox="0 0 120 120"
    aria-hidden="true"
  >
    {[
      [8, 12, 112, 108],
      [8, 40, 100, 112],
    ].map(([x1, y1, x2, y2], i) => (
      <g key={i} strokeLinecap="round">
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#c8923a"
          strokeWidth="7"
        />
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#8a1626"
          strokeWidth="7"
          strokeDasharray="4 5"
        />
      </g>
    ))}
  </svg>
);

const Mandala = () => (
  <svg className="pc__mandala" viewBox="0 0 200 200" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="1.2">
      {[0, 30, 60, 90, 120, 150].map((r) => (
        <ellipse
          key={r}
          cx="100"
          cy="100"
          rx="22"
          ry="80"
          transform={`rotate(${r} 100 100)`}
        />
      ))}
      <circle cx="100" cy="100" r="86" />
      <circle cx="100" cy="100" r="34" />
      <circle cx="100" cy="100" r="8" />
    </g>
  </svg>
);

const Peacock = ({ flip }) => (
  <svg
    className={`pc__peacock ${flip ? "is-flip" : ""}`}
    viewBox="0 0 64 48"
    aria-hidden="true"
  >
    {[-50, -25, 0, 25, 50].map((a) => (
      <g key={a} transform={`rotate(${a} 40 34)`}>
        <ellipse cx="40" cy="14" rx="5" ry="11" fill="#1f8a70" />
        <ellipse cx="40" cy="12" rx="2.6" ry="4.6" fill="#e0a93b" />
        <ellipse cx="40" cy="12" rx="1.2" ry="2.4" fill="#16407a" />
      </g>
    ))}
    <path
      d="M38 46c-12 0-18-8-14-17 2-5 8-6 10-2 2 5 6 8 12 8z"
      fill="#1b4f9c"
    />
    <circle cx="25" cy="23" r="5" fill="#1b4f9c" />
    <path
      d="M23 18l1-6M26 17l2-6"
      stroke="#1b4f9c"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path d="M20 24l-5 2 5 1z" fill="#e0a93b" />
  </svg>
);

const Bell = ({ style }) => (
  <svg
    className="pc__bell"
    style={style}
    viewBox="0 0 24 28"
    aria-hidden="true"
  >
    <path
      d="M12 2a2 2 0 012 2c4 1 6 4 6 9v4l3 3H1l3-3v-4c0-5 2-8 6-9a2 2 0 012-2z"
      fill="#d9a441"
      stroke="#9a6b1c"
      strokeWidth="1"
    />
    <circle cx="12" cy="24" r="2.6" fill="#9a6b1c" />
  </svg>
);

const Kalash = () => (
  <svg viewBox="0 0 40 44" className="pc__ico" aria-hidden="true">
    <path
      d="M12 6c-4-3-9 0-8 5 4 0 7-1 8-5zM28 6c4-3 9 0 8 5-4 0-7-1-8-5zM20 3c-3 2-3 6 0 8 3-2 3-6 0-8z"
      fill="#2f8a4a"
    />
    <circle cx="20" cy="15" r="6" fill="#a8672a" />
    <path
      d="M10 20h20l-2 4c5 3 6 10 2 15-3 3-17 3-20 0-4-5-3-12 2-15z"
      fill="#c4662a"
    />
    <path d="M9 28h22M10 34h20" stroke="#f2c46d" strokeWidth="1.6" />
  </svg>
);

const Diya = () => (
  <svg viewBox="0 0 40 40" className="pc__ico" aria-hidden="true">
    <path d="M20 4c5 5 6 9 3 13-2 2-6 2-6 0 0-3 3-5 3-13z" fill="#f08a1c" />
    <path d="M20 10c2 3 2 5 0 7-2-2-2-4 0-7z" fill="#ffd45e" />
    <path d="M4 22h32c0 8-7 13-16 13S4 30 4 22z" fill="#8a1626" />
    <path d="M6 24h28" stroke="#f2c46d" strokeWidth="2" />
  </svg>
);

const Dancers = () => (
  <svg viewBox="0 0 56 40" className="pc__ico pc__ico--wide" aria-hidden="true">
    {[10, 28, 46].map((x, i) => (
      <g key={x}>
        <circle cx={x} cy="8" r="4" fill="#5a2a1a" />
        <path
          d={`M${x - 4} 13h8l${i === 1 ? 7 : 6} 22h-${i === 1 ? 22 : 20}z`}
          fill={["#d8433f", "#e0a93b", "#c4662a"][i]}
        />
        <path
          d={`M${x - 4} 14l-7 -6M${x + 4} 14l7 -6`}
          stroke="#5a2a1a"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    ))}
  </svg>
);

const Sticks = () => (
  <svg viewBox="0 0 40 40" className="pc__ico" aria-hidden="true">
    <g strokeLinecap="round" strokeWidth="5">
      <line x1="6" y1="34" x2="32" y2="6" stroke="#c8923a" />
      <line
        x1="6"
        y1="34"
        x2="32"
        y2="6"
        stroke="#8a1626"
        strokeDasharray="3 4"
      />
      <line x1="14" y1="36" x2="36" y2="14" stroke="#c8923a" />
      <line
        x1="14"
        y1="36"
        x2="36"
        y2="14"
        stroke="#8a1626"
        strokeDasharray="3 4"
      />
    </g>
  </svg>
);

const BELLS = [
  { left: "13%", top: "80%", transform: "translate(-50%,-50%) rotate(28deg)" },
  { left: "35%", top: "97%", transform: "translate(-50%,-50%) rotate(8deg)" },
  { left: "65%", top: "97%", transform: "translate(-50%,-50%) rotate(-8deg)" },
  { left: "87%", top: "80%", transform: "translate(-50%,-50%) rotate(-28deg)" },
];

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");

function Stat({ to, icon, label, count, note }) {
  const body = (
    <>
      {icon}
      <span className="pc__statLabel">{label}</span>
      <b className="pc__statNum">{count}</b>
      {note ? <small className="pc__statNote">{note}</small> : null}
    </>
  );
  return to ? (
    <Link to={to} className="pc__stat">
      {body}
    </Link>
  ) : (
    <div className="pc__stat">{body}</div>
  );
}

/**
 * Props:
 *  user, onEdit  -> setPanel("edit")
 *  stats         -> admin stats (sirf admin ke liye pass karo, warna undefined)
 */
export default function ProfileCard({ user, onEdit, stats }) {
  const isBiz =
    (user.userType === "sponsor" || user.userType === "foodPartner") &&
    user.businessName;

  return (
    <section className="pc">
      <div className="pc__art" aria-hidden="true">
        <Dandiya />
        <Dandiya flip />
        <Mandala />
      </div>

      <div className="pc__ring">
        <div className="pc__avatar">
          <Avatar user={user} />
        </div>
        {BELLS.map((s, i) => (
          <Bell key={i} style={s} />
        ))}
        <button className="pc__edit" aria-label="Edit profile" onClick={onEdit}>
          <Pencil size={15} />
        </button>
      </div>

      <h1 className="pc__name">{isBiz ? user.businessName : user.name}</h1>
      {isBiz && <p className="pc__owner">{user.name}</p>}

      <span className="pc__badge">
        {cap(user.userType)}
        {user.sponsorCategory ? ` · ${user.sponsorCategory}` : ""}
      </span>

      <div className="pc__phoneRow">
        <Peacock />
        <span className="pc__phone">
          <Phone size={15} /> +91 {user.phone}
        </span>
        <Peacock flip />
      </div>

      {(user.passNumber || user.gender) && (
        <div className="pc__chips">
          {user.passNumber && (
            <span>
              <Ticket size={13} /> Pass {user.passNumber}
            </span>
          )}
          {user.gender && (
            <span>
              <UserIcon size={13} /> {cap(user.gender)}
            </span>
          )}
        </div>
      )}

      {stats && (
        <div className="pc__stats">
          <Stat
            to="/admin/users"
            icon={<Dancers />}
            label="Users"
            count={stats.total}
          />
          <Stat
            to="/admin/players"
            icon={<Sticks />}
            label="Players"
            count={stats.byType.player.total}
          />
          <Stat
            to="/admin/members"
            icon={<Kalash />}
            label="Members"
            count={stats.byType.member.total}
          />
          <Stat
            to="/admin/sponsors"
            icon={<Diya />}
            label="Sponsors"
            count={stats.byType.sponsor.total}
            note={
              stats.byType.sponsor.pending > 0
                ? `${stats.byType.sponsor.pending} pending`
                : null
            }
          />
        </div>
      )}
    </section>
  );
}
