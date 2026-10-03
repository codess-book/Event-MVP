import { NavLink } from "react-router-dom";
import { Home, CalendarDays,Gift , User, Menu ,Store} from "lucide-react";

// `to` means the page exists; items without it show as "coming soon"
const ITEMS = [
  { label: "Home", icon: Home  , to: "/profile"},
  { label: "Sponsors", icon: Store, to: "/sponsors" },
//   
  { label: "Prizes", icon: Gift, to: "/prizes" },
  { label: "Profile", icon: User, to: "/profile" },
];

export default function BottomNav() {
  return (
    <nav className="bnav" aria-label="Main">
      {ITEMS.map(({ label, icon: Icon, to }) =>
        to ? (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `bnav__item${isActive ? " active" : ""}`
            }
          >
            <span className="bnav__ic">
              <Icon size={22} />
            </span>
            {label}
          </NavLink>
        ) : (
          <button
            key={label}
            className="bnav__item"
            disabled
            aria-label={`${label} (coming soon)`}
          >
            <span className="bnav__ic">
              <Icon size={22} />
            </span>
            {label}
          </button>
        ),
      )}
    </nav>
  );
}
