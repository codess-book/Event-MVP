import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }) : "";

export default function MoreOffers({ offers, limit = 8 }) {
  if (!offers.length) return null;
  return (
    <section className="mo">
      <div className="mo__head">
        <h2 className="pf__section" style={{ margin: 0 }}>More offers from sponsors</h2>
        <Link to="/offers" className="mo__all">View all <ChevronRight size={14} /></Link>
      </div>
      <div className="mo__row">
        {offers.slice(0, limit).map((o) => (
          <Link key={o.id} to={`/offers?sponsor=${o.sponsor.id}`} className="mo__card">
            <div className="mo__top">
              {o.sponsor.photoUrl ? (
                <img src={o.sponsor.photoUrl} alt="" loading="lazy" className="mo__logo" />
              ) : (
                <span className="mo__logo mo__logo--ph">{o.sponsor.name?.[0]}</span>
              )}
              <span className="mo__sp">{o.sponsor.name}</span>
            </div>
            <div className="mo__title">{o.title}</div>
            {o.tag && <span className="mo__tag">{o.tag}</span>}
            {o.validTill && <small className="mo__valid">Valid till {fmt(o.validTill)}</small>}
          </Link>
        ))}
      </div>
    </section>
  );
}