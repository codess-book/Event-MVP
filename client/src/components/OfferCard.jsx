import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Gift, Sparkles } from "lucide-react";
import "./offer-card.css";

const TZ = "Asia/Kolkata";
const istDay = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: TZ,
  });

// Returns { text, urgent } or null when there is no date / already expired
function validity(validTill) {
  if (!validTill) return null;
  const left = Math.round(
    (Date.parse(istDay(validTill)) - Date.parse(istDay(Date.now()))) / 864e5,
  );
  if (left < 0) return null;
  if (left === 0) return { text: "Ends today", urgent: true };
  if (left <= 3)
    return { text: `${left} day${left > 1 ? "s" : ""} left`, urgent: true };
  return { text: `Valid till ${fmtDate(validTill)}`, urgent: false };
}

function MiniLogo({ src, name }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <span className="oc__logo oc__logo--ph">{name?.[0] || "?"}</span>;
  }
  return (
    <img
      src={src}
      alt=""
      className="oc__logo"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Premium offer card.
 * - offer:        { title, description, tag|discount, imageUrl, validTill, sponsor? }
 * - to:           optional link; renders a "Know more" button
 * - showSponsor:  show the sponsor name row (needs offer.sponsor)
 */
export default function OfferCard({ offer, to, showSponsor = false }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = offer.imageUrl && !imgFailed;
  const tag = offer.tag || offer.discount;
  const v = validity(offer.validTill);

  return (
    <article className="oc">
      {showImg ? (
        <div className="oc__media">
          <img
            src={offer.imageUrl}
            alt=""
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
          {tag && (
            <span className="oc__badge">
              <Sparkles size={12} aria-hidden="true" /> {tag}
            </span>
          )}
        </div>
      ) : (
        <div className="oc__hero">
          <span className="oc__heroIc" aria-hidden="true">
            <Gift size={20} />
          </span>
          <span className="oc__heroTag">{tag || "Special offer"}</span>
        </div>
      )}

      <div className="oc__body">
        {showSponsor && offer.sponsor && (
          <div className="oc__sp">
            <MiniLogo src={offer.sponsor.photoUrl} name={offer.sponsor.name} />
            <span className="oc__spName">{offer.sponsor.name}</span>
          </div>
        )}

        <h3 className="oc__title">{offer.title}</h3>
        {offer.description && <p className="oc__desc">{offer.description}</p>}

        <div className="oc__tear" aria-hidden="true" />

        <div className="oc__foot">
          <span className={`oc__valid ${v?.urgent ? "is-urgent" : ""}`}>
            <CalendarDays size={13} aria-hidden="true" />
            {v ? v.text : "Limited period offer"}
          </span>
          {to && (
            <Link to={to} className="oc__cta">
              Know more <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
