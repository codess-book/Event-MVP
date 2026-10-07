import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, ChevronRight, Tag } from "lucide-react";
import "./more-offers.css";

const TZ = "Asia/Kolkata";
const istDay = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: TZ,
  });

// Returns { text, urgent } or null if there is no date or it already ended
function validity(validTill) {
  if (!validTill) return null;
  const left = Math.round(
    (Date.parse(istDay(validTill)) - Date.parse(istDay(Date.now()))) / 864e5,
  );
  if (left < 0) return null;
  if (left === 0) return { text: "Ends today", urgent: true };
  if (left <= 3)
    return { text: `${left} day${left > 1 ? "s" : ""} left`, urgent: true };
  return { text: `Till ${fmtDate(validTill)}`, urgent: false };
}

function Logo({ src, name }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <span className="mof-logo mof-logo--ph">{name?.[0] || "?"}</span>;
  }
  return (
    <img
      src={src}
      alt=""
      className="mof-logo"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function MoreOffers({ offers, limit = 8 }) {
  if (!offers?.length) return null;

  const shown = offers.slice(0, limit);
  const single = offers.length === 1;
  const hasMore = offers.length > shown.length;

  return (
    <section className="mof" aria-labelledby="mof-title">
      <header className="mof-head">
        <div>
          <h2 className="mof-title" id="mof-title">
            Offers from our sponsors
          </h2>
          <p className="mof-sub">
            {offers.length} live deal{offers.length > 1 ? "s" : ""} for you
          </p>
        </div>
        <Link to="/offers" className="mof-all">
          View all <ChevronRight size={15} aria-hidden="true" />
        </Link>
      </header>

      <ul className={`mof-row ${single ? "is-single" : ""}`}>
        {shown.map((o) => {
          const tag = o.tag || o.discount;
          const v = validity(o.validTill);
          return (
            <li key={o.id} className="mof-item">
              <Link
                to={`/offers?sponsor=${o.sponsor.id}`}
                className="mof-card"
                aria-label={`${o.title} by ${o.sponsor.name}`}
              >
                <div className="mof-top">
                  <Logo src={o.sponsor.photoUrl} name={o.sponsor.name} />
                  <div className="mof-sp">
                    <span className="mof-spName">{o.sponsor.name}</span>
                    {o.sponsor.category && (
                      <span className="mof-spCat">{o.sponsor.category}</span>
                    )}
                  </div>
                </div>

                <h3 className="mof-offerTitle">{o.title}</h3>

                <div className="mof-foot">
                  <div className="mof-meta">
                    {tag && (
                      <span className="mof-tag">
                        <Tag size={11} aria-hidden="true" /> {tag}
                      </span>
                    )}
                    {v && (
                      <span
                        className={`mof-valid ${v.urgent ? "is-urgent" : ""}`}
                      >
                        <CalendarDays size={11} aria-hidden="true" /> {v.text}
                      </span>
                    )}
                  </div>
                  <span className="mof-go" aria-hidden="true">
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}

        {hasMore && (
          <li className="mof-item mof-item--end">
            <Link to="/offers" className="mof-more">
              <span className="mof-more__ic" aria-hidden="true">
                <ArrowRight size={18} />
              </span>
              See all {offers.length}
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}
