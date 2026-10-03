import { useState } from "react";
import { Link } from "react-router-dom";
import { Tag, ChevronRight } from "lucide-react";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import { useSponsors } from "../hooks/sponsors/useSponsors";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";

export default function Sponsors() {
  const { sponsors, isLoading, error } = useSponsors();
  const [cat, setCat] = useState("All");

  const cats = ["All", ...new Set(sponsors.map((s) => s.category).filter(Boolean))];
  const shown = cat === "All" ? sponsors : sponsors.filter((s) => s.category === cat);

  return (
    <div className="pf">
      <div className="pf__wrap">
        <header className="sp__head">
          <h1 className="sp__h1">Our Sponsors</h1>
          <p className="sp__sub">Show your pass and enjoy exclusive offers</p>
        </header>

        {cats.length > 2 && (
          <div className="sp__cats" role="group" aria-label="Category">
            {cats.map((c) => (
              <button key={c} className="sp__cat" aria-pressed={cat === c} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="sp__list">
          {isLoading && <p className="sheet__empty">Loading…</p>}
          {error && <div className="a2__err">{error.message}</div>}
          {!isLoading && !error && shown.length === 0 && (
            <p className="sheet__empty">No sponsors to show yet.</p>
          )}
          {shown.map((s) => {
            const live = (s.offers || []).filter((o) => !o.expired);
            return (
              <Link key={s.id} to={`/sponsors/${s.id}`} className="sp__card">
                <Avatar user={{ name: s.businessName, photoUrl: s.photoUrl }} className="sp__logo" />
                <div className="sp__info">
                  <div className="sp__name">{s.businessName}</div>
                  {s.category && <div className="sp__catTxt">{s.category}</div>}
                  {live.length > 0 && (
                    <div className="sp__offer">
                      <Tag size={13} /> {live[0].title}
                      {live.length > 1 && ` +${live.length - 1} more`}
                    </div>
                  )}
                </div>
                <ChevronRight size={20} className="sp__chev" />
              </Link>
            );
          })}
        </div>

        <div className="pf__spacer" />
        <BottomNav />
      </div>
    </div>
  );
}