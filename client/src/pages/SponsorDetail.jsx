import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Globe,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  ShieldCheck,
  Star,
  Store,
  Tag,
  UserRound,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import BottomNav from "../components/BottomNav";
import { useSponsor } from "../hooks/sponsors/useSponsors";
import "../sponser-detail.css";

/* ------------------------------ helpers ------------------------------ */
const TZ = "Asia/Kolkata";
const istDay = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: TZ,
  });

const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");
const onlyDigits = (v) => String(v || "").replace(/\D/g, "");
const waLink = (num) => {
  const d = onlyDigits(num);
  if (!d) return "";
  return `https://wa.me/${d.length === 10 ? `91${d}` : d}`;
};

// An offer without a date never expires
const isLive = (o) => !o.validTill || istDay(o.validTill) >= istDay(Date.now());

const SOCIALS = [
  ["website", "Website", Globe],
  ["instagram", "Instagram", FaInstagram],
  ["facebook", "Facebook", FaFacebook],
  ["youtube", "YouTube", FaYoutube],
];

const SAVED_KEY = "savedSponsors";
const readSaved = () => {
  try {
    const v = JSON.parse(localStorage.getItem(SAVED_KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const writeSaved = (list) => {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
};

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------ small parts ------------------------------ */
function Logo({ src, name, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <span className={`${className} sdp-ph`}>{name?.[0] || "?"}</span>;
  }
  return (
    <img
      src={src}
      alt=""
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

function OfferItem({ offer }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = offer.imageUrl && !imgFailed;
  const tag = offer.tag || offer.discount;

  return (
    <article className="sdp-offer">
      {showImg && (
        <div className="sdp-offer__media">
          <img
            src={offer.imageUrl}
            alt=""
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        </div>
      )}
      <div className="sdp-offer__body">
        {tag && (
          <span className="sdp-offer__tag">
            <Tag size={11} aria-hidden="true" /> {tag}
          </span>
        )}
        <h3 className="sdp-offer__title">{offer.title}</h3>
        {offer.description && (
          <p className="sdp-offer__desc">{offer.description}</p>
        )}
        {offer.validTill && (
          <span className="sdp-offer__valid">
            <CalendarDays size={12} aria-hidden="true" /> Valid till{" "}
            {fmtDate(offer.validTill)}
          </span>
        )}
      </div>
    </article>
  );
}

function Skeleton() {
  return (
    <div className="sdp-skel" aria-hidden="true">
      <div className="sdp-skel__hero" />
      <div className="sdp-skel__row">
        <div className="sdp-skel__btn" />
        <div className="sdp-skel__btn" />
        <div className="sdp-skel__btn" />
      </div>
      <div className="sdp-skel__card" />
    </div>
  );
}

function ErrorState({ error, onBack }) {
  const notFound = error?.status === 404;
  return (
    <div className="sdp-state" role="alert">
      <span className="sdp-state__ic">
        <Store size={30} />
      </span>
      <h2>{notFound ? "Sponsor not found" : "Something went wrong"}</h2>
      <p>
        {notFound
          ? "This sponsor may have been removed or is no longer available."
          : error?.message || "Please try again in a moment."}
      </p>
      <button type="button" className="sdp-btn" onClick={onBack}>
        Browse sponsors
      </button>
    </div>
  );
}

/* ------------------------------ main ------------------------------ */
export default function SponsorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sponsor: s, isLoading, error } = useSponsor(id);

  const [saved, setSaved] = useState(() => readSaved().includes(id));
  const [toast, setToast] = useState("");

  // Re-sync when navigating between two sponsors with the same mounted page
  useEffect(() => {
    setSaved(readSaved().includes(id));
  }, [id]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const goBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/sponsors");

  const toggleSaved = () => {
    const list = readSaved();
    const next = list.includes(id)
      ? list.filter((x) => x !== id)
      : [...list, id];
    writeSaved(next);
    setSaved(next.includes(id));
    setToast(next.includes(id) ? "Saved" : "Removed from saved");
  };

  const handleShare = async () => {
    if (!s) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: s.businessName,
          text: `Check out ${s.businessName}`,
          url,
        });
      } catch {
        /* user cancelled */
      }
      return;
    }
    setToast((await copyText(url)) ? "Link copied" : "Could not copy link");
  };

  const handleCopyAddress = async () => {
    setToast((await copyText(s.address)) ? "Address copied" : "Could not copy");
  };

  const mapHref = useMemo(() => {
    if (s?.mapLink) return s.mapLink;
    if (s?.address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${s.businessName} ${s.address}`,
      )}`;
    }
    return "";
  }, [s]);

  const liveOffers = useMemo(() => (s?.offers || []).filter(isLive), [s]);

  const phone = onlyDigits(s?.ownerPhone);
  const whatsapp = waLink(s?.links?.whatsapp || s?.ownerPhone);
  const socials = s ? SOCIALS.filter(([key]) => safeUrl(s.links?.[key])) : [];
  const rating = s?.rating != null ? Number(s.rating) : NaN;
  const hasActions = Boolean(phone || whatsapp || mapHref);

  return (
    <div className="sdp">
      <div className="sdp-wrap">
        {/* Top bar */}
        <header className="sdp-bar">
          <button
            type="button"
            className="sdp-ibtn"
            onClick={goBack}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="sdp-bar__title">{s?.businessName || "Sponsor"}</h1>
          <div className="sdp-bar__actions">
            <button
              type="button"
              className="sdp-ibtn"
              onClick={handleShare}
              aria-label="Share"
              disabled={!s}
            >
              <Share2 size={18} />
            </button>
            <button
              type="button"
              className={`sdp-ibtn ${saved ? "is-on" : ""}`}
              onClick={toggleSaved}
              aria-label={saved ? "Remove from saved" : "Save sponsor"}
              aria-pressed={saved}
              disabled={!s}
            >
              {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          </div>
        </header>

        {isLoading && <Skeleton />}
        {error && !isLoading && (
          <ErrorState error={error} onBack={() => navigate("/sponsors")} />
        )}

        {s && !isLoading && !error && (
          <main className="sdp-main">
            {/* Hero */}
            <section className="sdp-hero">
              <div className="sdp-hero__cover" aria-hidden="true" />
              <Logo
                src={s.photoUrl}
                name={s.businessName}
                className="sdp-hero__logo"
              />
              <div className="sdp-hero__body">
                <div className="sdp-hero__titleRow">
                  <h2 className="sdp-hero__name">{s.businessName}</h2>
                  {s.verified && (
                    <span className="sdp-hero__verified" title="Verified">
                      <ShieldCheck size={16} />
                    </span>
                  )}
                </div>

                {(s.category || !Number.isNaN(rating) || s.responseTime) && (
                  <div className="sdp-hero__meta">
                    {s.category && (
                      <span className="sdp-pill sdp-pill--gold">
                        <Tag size={11} aria-hidden="true" /> {s.category}
                      </span>
                    )}
                    {!Number.isNaN(rating) && (
                      <span className="sdp-pill sdp-pill--gold">
                        <Star
                          size={11}
                          fill="currentColor"
                          aria-hidden="true"
                        />{" "}
                        {rating.toFixed(1)}
                      </span>
                    )}
                    {s.responseTime && (
                      <span className="sdp-pill">
                        <Clock size={11} aria-hidden="true" /> {s.responseTime}
                      </span>
                    )}
                  </div>
                )}

                {s.address && (
                  <p className="sdp-hero__addr">
                    <MapPin size={13} aria-hidden="true" />
                    <span>{s.address}</span>
                  </p>
                )}
              </div>
            </section>

            {/* Quick actions */}
            {hasActions && (
              <nav className="sdp-actions" aria-label="Contact options">
                {phone && (
                  <a className="sdp-act" href={`tel:${phone}`}>
                    <span className="sdp-act__ic sdp-act__ic--call">
                      <Phone size={18} />
                    </span>
                    Call
                  </a>
                )}
                {whatsapp && (
                  <a
                    className="sdp-act"
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sdp-act__ic sdp-act__ic--wa">
                      <MessageCircle size={18} />
                    </span>
                    WhatsApp
                  </a>
                )}
                {mapHref && (
                  <a
                    className="sdp-act"
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sdp-act__ic sdp-act__ic--map">
                      <Navigation size={18} />
                    </span>
                    Directions
                  </a>
                )}
              </nav>
            )}

            {/* Offers */}
            <section className="sdp-sec" aria-labelledby="sdp-h-offers">
              <h3 className="sdp-sec__h" id="sdp-h-offers">
                Offers
                {liveOffers.length > 0 && (
                  <span className="sdp-sec__n">{liveOffers.length}</span>
                )}
              </h3>
              {liveOffers.length > 0 ? (
                <div className="sdp-offers">
                  {liveOffers.map((o, i) => (
                    <OfferItem key={o.id || o._id || i} offer={o} />
                  ))}
                </div>
              ) : (
                <div className="sdp-empty">
                  <span className="sdp-empty__ic">
                    <Tag size={18} />
                  </span>
                  <div>
                    <strong>No active offers</strong>
                    <p>This sponsor has not posted an offer yet.</p>
                  </div>
                </div>
              )}
            </section>

            {/* Owner */}
            {(s.ownerName || phone) && (
              <section className="sdp-sec" aria-labelledby="sdp-h-owner">
                <h3 className="sdp-sec__h" id="sdp-h-owner">
                  Owner
                </h3>
                <div className="sdp-row">
                  <span className="sdp-row__ic">
                    <UserRound size={18} />
                  </span>
                  <div className="sdp-row__txt">
                    <strong>{s.ownerName || "Business owner"}</strong>
                    {phone && <span>{s.ownerPhone}</span>}
                  </div>
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="sdp-row__btn"
                      aria-label="Call owner"
                    >
                      <Phone size={16} />
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Socials */}
            {socials.length > 0 && (
              <section className="sdp-sec" aria-labelledby="sdp-h-social">
                <h3 className="sdp-sec__h" id="sdp-h-social">
                  Follow &amp; visit
                </h3>
                <div className="sdp-links">
                  {socials.map(([key, label, Icon]) => (
                    <a
                      key={key}
                      className="sdp-link"
                      href={safeUrl(s.links[key])}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="sdp-link__ic">
                        <Icon size={16} />
                      </span>
                      <span className="sdp-link__t">{label}</span>
                      <ChevronRight size={16} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Location */}
            {(s.address || mapHref) && (
              <section className="sdp-sec" aria-labelledby="sdp-h-loc">
                <h3 className="sdp-sec__h" id="sdp-h-loc">
                  Location
                </h3>
                {s.address && (
                  <div className="sdp-row">
                    <span className="sdp-row__ic">
                      <MapPin size={18} />
                    </span>
                    <div className="sdp-row__txt">
                      <span className="sdp-row__addr">{s.address}</span>
                    </div>
                    <button
                      type="button"
                      className="sdp-row__btn"
                      onClick={handleCopyAddress}
                      aria-label="Copy address"
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                )}
                {mapHref && (
                  <a
                    className="sdp-btn sdp-btn--block"
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation size={16} aria-hidden="true" /> Open in Google
                    Maps
                  </a>
                )}
              </section>
            )}
          </main>
        )}

        <div className="sdp-spacer" />
      </div>

      <BottomNav />

      {toast && (
        <div className="sdp-toast" role="status" aria-live="polite">
          <CheckCircle2 size={15} aria-hidden="true" /> {toast}
        </div>
      )}
    </div>
  );
}
