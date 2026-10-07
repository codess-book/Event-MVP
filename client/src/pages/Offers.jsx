import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Gift,
  RefreshCw,
  Store,
  Tag,
  WifiOff,
} from "lucide-react";
import { useOffers, markOffersSeen } from "../hooks/offers/useOffers";
import BottomNav from "../components/BottomNav";
import OfferCard from "../components/OfferCard";
import "../offers.css";

function Logo({ src, name, className }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className={`${className} ofx-logo--ph`}>{name?.[0] || "?"}</span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function Skeleton() {
  return (
    <div className="ofx-skel" aria-hidden="true">
      {[0, 1].map((i) => (
        <div key={i} className="ofx-skel__group">
          <div className="ofx-skel__head" />
          <div className="ofx-skel__card" />
          <div className="ofx-skel__card" />
        </div>
      ))}
    </div>
  );
}

export default function Offers() {
  const { offers, isLoading, error, mutate } = useOffers();
  const [params, setParams] = useSearchParams();
  const active = params.get("sponsor") || "all";

  useEffect(() => {
    markOffersSeen();
  }, []);

  const groups = useMemo(() => {
    const map = new Map();
    for (const o of offers) {
      if (!map.has(o.sponsor.id))
        map.set(o.sponsor.id, { sponsor: o.sponsor, items: [] });
      map.get(o.sponsor.id).items.push(o);
    }
    return [...map.values()];
  }, [offers]);

  const visible =
    active === "all" ? groups : groups.filter((g) => g.sponsor.id === active);

  const hasData = offers.length > 0;
  const showError = error && !hasData;
  const showEmpty = !isLoading && !showError && !visible.length;

  return (
    <div className="ofx">
      <div className="ofx-wrap">
        {/* Top bar */}
        <header className="ofx-bar">
          <Link to="/" className="ofx-bar__back" aria-label="Back to profile">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="ofx-bar__title">Sponsor Offers</h1>
          <span className="ofx-bar__spacer" aria-hidden="true" />
        </header>

        {/* Summary hero */}
        <section className="ofx-hero">
          <span className="ofx-hero__ic" aria-hidden="true">
            <Gift size={22} />
          </span>
          <div>
            <div className="ofx-hero__t">Exclusive deals for you</div>
            <div className="ofx-hero__s">
              {hasData
                ? `${offers.length} offer${offers.length > 1 ? "s" : ""} from ${groups.length} sponsor${groups.length > 1 ? "s" : ""}`
                : "Offers from our sponsors appear here"}
            </div>
          </div>
        </section>

        {/* Filter chips */}
        {groups.length > 0 && (
          <nav className="ofx-chips" aria-label="Filter by sponsor">
            <button
              type="button"
              className={`ofx-chip ${active === "all" ? "is-on" : ""}`}
              aria-pressed={active === "all"}
              onClick={() => setParams({}, { replace: true })}
            >
              All <span className="ofx-chip__n">{offers.length}</span>
            </button>
            {groups.map((g) => (
              <button
                type="button"
                key={g.sponsor.id}
                className={`ofx-chip ${active === g.sponsor.id ? "is-on" : ""}`}
                aria-pressed={active === g.sponsor.id}
                onClick={() =>
                  setParams({ sponsor: g.sponsor.id }, { replace: true })
                }
              >
                <Logo
                  src={g.sponsor.photoUrl}
                  name={g.sponsor.name}
                  className="ofx-chip__logo"
                />
                <span className="ofx-chip__name">{g.sponsor.name}</span>
                <span className="ofx-chip__n">{g.items.length}</span>
              </button>
            ))}
          </nav>
        )}

        {/* States */}
        {isLoading && !hasData && <Skeleton />}

        {showError && (
          <div className="ofx-state" role="alert">
            <span className="ofx-state__ic">
              <WifiOff size={30} />
            </span>
            <h2>Could not load offers</h2>
            <p>Check your connection and try again.</p>
            <button type="button" className="ofx-btn" onClick={() => mutate()}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {showEmpty && (
          <div className="ofx-state">
            <span className="ofx-state__ic">
              <Tag size={30} />
            </span>
            <h2>No offers right now</h2>
            <p>Check back soon, sponsors add new deals regularly.</p>
            {active !== "all" && (
              <button
                type="button"
                className="ofx-btn"
                onClick={() => setParams({}, { replace: true })}
              >
                Show all offers
              </button>
            )}
          </div>
        )}

        {/* Sponsor groups */}
        {visible.map((g) => (
          <section
            key={g.sponsor.id}
            className="ofx-group"
            aria-label={g.sponsor.name}
          >
            <Link to={`/sponsors/${g.sponsor.id}`} className="ofx-sp">
              <Logo
                src={g.sponsor.photoUrl}
                name={g.sponsor.name}
                className="ofx-sp__logo"
              />
              <div className="ofx-sp__info">
                <h2 className="ofx-sp__name">{g.sponsor.name}</h2>
                {g.sponsor.category && (
                  <span className="ofx-sp__cat">
                    <Store size={11} aria-hidden="true" /> {g.sponsor.category}
                  </span>
                )}
              </div>
              <span className="ofx-sp__count">
                {g.items.length} offer{g.items.length > 1 ? "s" : ""}
              </span>
            </Link>

            <div className="ofx-list">
              {g.items.map((o) => (
                <OfferCard
                  key={o.id}
                  offer={o}
                  to={`/sponsors/${o.sponsor.id}`}
                />
              ))}
            </div>
          </section>
        ))}

        <div className="ofx-spacer" />
      </div>

      <BottomNav />
    </div>
  );
}