import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Ticket,
  CalendarDays,
  Tag,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import { useSponsor } from "../hooks/sponsors/useSponsors";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import OfferCarousel from "../components/OfferCarousel";

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

export default function SponsorDetail() {
  const { id } = useParams();
  const { sponsor: s, isLoading, error } = useSponsor(id);

  // Use the saved Maps link, or fall back to a Maps search for the address
  const mapHref =
    s?.mapLink ||
    (s?.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.businessName} ${s.address}`)}`
      : "");

  return (
    <div className="pf">
      <div className="pf__wrap">
        <header className="sp__bar">
          <Link to="/sponsors" className="iconbtn" aria-label="Back">
            <ArrowLeft size={22} />
          </Link>
          <span className="sp__barTitle">Sponsor</span>
          <span style={{ width: 42 }} />
        </header>

        {isLoading && <p className="sheet__empty">Loading…</p>}
        {error && (
          <div style={{ padding: 16 }}>
            <div className="a2__err">
              {error.status === 404
                ? "This sponsor is not available."
                : error.message}
            </div>
          </div>
        )}

        {s && (
          <div className="sp__detail">
            <Avatar
              user={{ name: s.businessName, photoUrl: s.photoUrl }}
              className="sp__big"
            />
            <h1 className="sp__dname">{s.businessName}</h1>
            {s.category && <span className="pf__badge">{s.category}</span>}

        {s.offers.length > 0 ? (
  <div style={{ width: "100%", marginTop: 20 }}>
    <h2 className="pf__section" style={{ margin: "0 0 10px" }}>Offers ({s.offers.length})</h2>
    <OfferCarousel offers={s.offers} />
  </div>
) : (
  <p className="sp__none"><Tag size={16} /> No offer from this sponsor right now.</p>
)}

            {(s.address || mapHref) && (
              <div className="sp__loc">
                <h2 className="pf__section" style={{ margin: "0 0 8px" }}>
                  Location
                </h2>
                {s.address && (
                  <p className="sp__addr">
                    <MapPin size={18} /> {s.address}
                  </p>
                )}
                {mapHref && (
                  <a
                    className="a2__btn sp__map"
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation size={18} /> Open in Google Maps
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        <div className="pf__spacer" />
        <BottomNav />
      </div>
    </div>
  );
}
