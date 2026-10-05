import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Globe,
  Tag,
  UserRound,
  Share2,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  Clock,
  Star,
  Copy,
  CheckCircle2,
  Sparkles,
  Store,
  ChevronRight,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import OfferCarousel from "../components/OfferCarousel";
import { useSponsor } from "../hooks/sponsors/useSponsors";
import "../sponser-detail.css";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";

/* ------------------------------ helpers ------------------------------ */
const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");
const onlyDigits = (v) => String(v || "").replace(/\D/g, "");

const waLink = (num) => {
  const d = onlyDigits(num);
  if (!d) return "";
  return `https://wa.me/${d.length === 10 ? `91${d}` : d}`;
};

const SOCIALS = [
  ["website", "Website", Globe],
  ["instagram", "Instagram", FaInstagram],
  ["facebook", "Facebook", FaFacebook],
  ["youtube", "YouTube", FaYoutube],
];

/* ------------------------------ skeleton ------------------------------ */
function Skeleton() {
  return (
    <div className="sdx sdx--skeleton">
      <div className="sdx__cover sk" />
      <div className="sdx__body">
        <div className="sk sk--circle" style={{ width: 88, height: 88 }} />
        <div className="sk sk--line" style={{ width: 160, height: 20, marginTop: 14 }} />
        <div className="sk sk--line" style={{ width: 100, height: 14, marginTop: 8 }} />
        <div className="sdx__actions" style={{ marginTop: 20 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="sk sk--btn" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ error ------------------------------ */
function ErrorState({ error }) {
  const navigate = useNavigate();
  return (
    <div className="sdx__empty">
      <div className="sdx__emptyIcon">
        <Store size={30} />
      </div>
      <h2 className="sdx__emptyTitle">
        {error?.status === 404 ? "Sponsor not found" : "Something went wrong"}
      </h2>
      <p className="sdx__emptyText">
        {error?.status === 404
          ? "This sponsor may have been removed or is no longer available."
          : error?.message || "Please try again in a moment."}
      </p>
      <button
        type="button"
        className="sdx__emptyBtn"
        onClick={() => navigate("/sponsors")}
      >
        Browse sponsors
      </button>
    </div>
  );
}

/* ------------------------------ main ------------------------------ */
export default function SponsorDetail() {
  const { id } = useParams();
  const { sponsor: s, isLoading, error } = useSponsor(id);

  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const mapHref = useMemo(() => {
    if (s?.mapLink) return s.mapLink;
    if (s?.address)
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${s.businessName} ${s.address}`
      )}`;
    return "";
  }, [s]);

  const phone = onlyDigits(s?.ownerPhone);
  const whatsapp = waLink(s?.links?.whatsapp || s?.ownerPhone);
  const socials = s ? SOCIALS.filter(([key]) => safeUrl(s.links?.[key])) : [];
  const hasContact = phone || whatsapp || mapHref;
  const offersCount = s?.offers?.length ?? 0;

  const handleShare = async () => {
    if (!s) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: s.businessName,
          text: `Check out ${s.businessName}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {}
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(s.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="pf">
      <div className="pf__wrap">
        {/* ---------- top bar ---------- */}
        <header className="sdx__bar">
          <Link to="/sponsors" className="sdx__iconBtn" aria-label="Back">
            <ArrowLeft size={20} />
          </Link>

          <span className="sdx__barTitle">
            {s?.businessName || "Sponsor"}
          </span>

          <div className="sdx__barActions">
            <button
              type="button"
              className="sdx__iconBtn"
              onClick={handleShare}
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
            <button
              type="button"
              className={`sdx__iconBtn ${saved ? "is-active" : ""}`}
              onClick={() => setSaved((v) => !v)}
              aria-label={saved ? "Unsave" : "Save"}
            >
              {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          </div>
        </header>

        {isLoading && <Skeleton />}
        {error && !isLoading && <ErrorState error={error} />}

        {s && !isLoading && !error && (
          <div className="sdx">
            {/* ---------- HERO ---------- */}
            <section className="sdx__hero">
              <div className="sdx__cover">
                <div className="sdx__coverOverlay" />
                <Sparkles className="sdx__coverSparkle sdx__coverSparkle--1" size={20} />
                <Sparkles className="sdx__coverSparkle sdx__coverSparkle--2" size={14} />
                <Sparkles className="sdx__coverSparkle sdx__coverSparkle--3" size={16} />
              </div>

              <div className="sdx__avatarWrap">
                <div className="sdx__avatarRing">
                  <Avatar
                    user={{ name: s.businessName, photoUrl: s.photoUrl }}
                    className="sdx__avatar"
                  />
                </div>
              </div>

              <div className="sdx__heroBody">
                <div className="sdx__titleRow">
                  <h1 className="sdx__name">{s.businessName}</h1>
                  {s.verified && (
                    <span className="sdx__verified" title="Verified">
                      <ShieldCheck size={16} />
                    </span>
                  )}
                </div>

                <div className="sdx__metaRow">
                  {s.category && (
                    <span className="sdx__chip sdx__chip--gold">
                      <Tag size={11} /> {s.category}
                    </span>
                  )}
                  {s.rating != null && (
                    <span className="sdx__chip sdx__chip--gold">
                      <Star size={11} fill="currentColor" /> {s.rating.toFixed(1)}
                    </span>
                  )}
                  {s.responseTime && (
                    <span className="sdx__chip">
                      <Clock size={11} /> {s.responseTime}
                    </span>
                  )}
                </div>

                {s.address && (
                  <div className="sdx__addrLine">
                    <MapPin size={13} />
                    <span>{s.address}</span>
                  </div>
                )}
              </div>
            </section>

            {/* ---------- ACTIONS ---------- */}
            {hasContact && (
              <nav className="sdx__actions" aria-label="Contact options">
                {phone && (
                  <a className="sdx__act" href={`tel:${phone}`}>
                    <span className="sdx__actIcon sdx__actIcon--call">
                      <Phone size={18} />
                    </span>
                    <span className="sdx__actLabel">Call</span>
                  </a>
                )}
                {whatsapp && (
                  <a
                    className="sdx__act"
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sdx__actIcon sdx__actIcon--wa">
                      <MessageCircle size={18} />
                    </span>
                    <span className="sdx__actLabel">WhatsApp</span>
                  </a>
                )}
                {mapHref && (
                  <a
                    className="sdx__act"
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sdx__actIcon sdx__actIcon--map">
                      <Navigation size={18} />
                    </span>
                    <span className="sdx__actLabel">Directions</span>
                  </a>
                )}
              </nav>
            )}

            {/* ---------- OFFERS ---------- */}
            <section className="sdx__block">
              <header className="sdx__blockHead">
                <h2 className="sdx__h">
                  Offers
                  {offersCount > 0 && (
                    <span className="sdx__hBadge">{offersCount}</span>
                  )}
                </h2>
              </header>
              {offersCount > 0 ? (
                <OfferCarousel offers={s.offers} />
              ) : (
                <div className="sdx__emptyCard">
                  <div className="sdx__emptyCardIcon">
                    <Tag size={18} />
                  </div>
                  <div className="sdx__emptyCardText">
                    <strong>No active offers</strong>
                    <p>This sponsor hasn't posted any offer yet.</p>
                  </div>
                </div>
              )}
            </section>

            {/* ---------- OWNER ---------- */}
            {(s.ownerName || phone) && (
              <section className="sdx__block">
                <header className="sdx__blockHead">
                  <h2 className="sdx__h">Owner</h2>
                </header>
                <div className="sdx__owner">
                  <div className="sdx__ownerAvatar">
                    <UserRound size={20} />
                  </div>
                  <div className="sdx__ownerInfo">
                    <strong>{s.ownerName || "Business owner"}</strong>
                    {phone && (
                      <a href={`tel:${phone}`} className="sdx__ownerPhone">
                        <Phone size={12} /> {s.ownerPhone}
                      </a>
                    )}
                  </div>
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="sdx__ownerCallBtn"
                      aria-label="Call owner"
                    >
                      <Phone size={16} />
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* ---------- SOCIALS ---------- */}
            {socials.length > 0 && (
              <section className="sdx__block">
                <header className="sdx__blockHead">
                  <h2 className="sdx__h">Follow & Visit</h2>
                </header>
                <div className="sdx__socials">
                  {socials.map(([key, label, Icon]) => (
                    <a
                      key={key}
                      className="sdx__social"
                      href={safeUrl(s.links[key])}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="sdx__socialIcon">
                        <Icon size={16} />
                      </span>
                      <span className="sdx__socialLabel">{label}</span>
                      <ChevronRight size={14} className="sdx__socialChevron" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* ---------- LOCATION ---------- */}
            {(s.address || mapHref) && (
              <section className="sdx__block">
                <header className="sdx__blockHead">
                  <h2 className="sdx__h">Location</h2>
                </header>

                {s.address && (
                  <div className="sdx__addrCard">
                    <div className="sdx__addrIcon">
                      <MapPin size={16} />
                    </div>
                    <span className="sdx__addrText">{s.address}</span>
                    <button
                      type="button"
                      className="sdx__copyBtn"
                      onClick={handleCopy}
                      aria-label="Copy address"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}

                {mapHref && (
                  <a
                    className="sdx__mapBtn"
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation size={16} />
                    Open in Google Maps
                  </a>
                )}
              </section>
            )}

            <footer className="sdx__footer">
              Listed on our platform · Report an issue
            </footer>
          </div>
        )}

        <div className="pf__spacer" />
        <BottomNav />

        {copied && (
          <div className="sdx__toast" role="status">
            <CheckCircle2 size={15} /> Copied to clipboard
          </div>
        )}
      </div>
    </div>
  );
}

