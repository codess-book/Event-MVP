import { useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Tag, Gift, Store } from "lucide-react";
import { useOffers, markOffersSeen } from "../hooks/offers/useOffers";
import BottomNav from "../components/BottomNav";
import "../auth.css";
// import "../profile.css";
import "../offers.css";

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        timeZone: "Asia/Kolkata",
      })
    : "";

export default function Offers() {
  const { offers, isLoading } = useOffers();
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

  return (
    <div className="pf ofp-page">
      <div className="pf__wrap ofp">
        {/* ---------- Top bar ---------- */}
        <header className="ofp__bar">
          <Link to="/" className="ofp__back" aria-label="Back">
            <ArrowLeft size={20} />
          </Link>
          <div className="ofp__barTitle">
            <span className="ofp__barIcon">
              <Gift size={14} />
            </span>
            <h1>Sponsor Offers</h1>
          </div>
          <div className="ofp__barSpacer" />
        </header>

        {/* ---------- Filter chips ---------- */}
        <div className="ofp__chips" role="tablist">
          <button
            role="tab"
            aria-selected={active === "all"}
            className={`ofp__chip ${active === "all" ? "is-on" : ""}`}
            onClick={() => setParams({})}
          >
            All
            <span className="ofp__chipCount">{offers.length}</span>
          </button>
          {groups.map((g) => (
            <button
              key={g.sponsor.id}
              role="tab"
              aria-selected={active === g.sponsor.id}
              className={`ofp__chip ${active === g.sponsor.id ? "is-on" : ""}`}
              onClick={() => setParams({ sponsor: g.sponsor.id })}
            >
              {g.sponsor.photoUrl ? (
                <img
                  src={g.sponsor.photoUrl}
                  alt=""
                  className="ofp__chipLogo"
                />
              ) : (
                <span className="ofp__chipLogoFallback">
                  {g.sponsor.name?.[0]}
                </span>
              )}
              {g.sponsor.name}
              <span className="ofp__chipCount">{g.items.length}</span>
            </button>
          ))}
        </div>

        {/* ---------- Loading ---------- */}
        {isLoading && (
          <div className="ofp__state">
            <div className="ofp__spinner" />
            <p>Loading offers…</p>
          </div>
        )}

        {/* ---------- Empty ---------- */}
        {!isLoading && !visible.length && (
          <div className="ofp__state">
            <span className="ofp__stateIcon">
              <Tag size={34} />
            </span>
            <h3>No offers right now</h3>
            <p>Check back soon — new deals are added daily.</p>
          </div>
        )}

        {/* ---------- Sponsor groups ---------- */}
        {visible.map((g) => (
          <section key={g.sponsor.id} className="ofp__group">
            <header className="ofp__sp">
              <div className="ofp__spLogo">
                {g.sponsor.photoUrl ? (
                  <img src={g.sponsor.photoUrl} alt="" />
                ) : (
                  <span>{g.sponsor.name?.[0]}</span>
                )}
              </div>
              <div className="ofp__spBody">
                <div className="ofp__spName">{g.sponsor.name}</div>
                {g.sponsor.category && (
                  <small className="ofp__spCat">
                    <Store size={11} /> {g.sponsor.category}
                  </small>
                )}
              </div>
              <span className="ofp__spBadge">
                {g.items.length} offer{g.items.length > 1 ? "s" : ""}
              </span>
            </header>

            <div className="ofp__list">
              {g.items.map((o) => (
                <article key={o.id} className="ofp__card">
                  {o.imageUrl && (
                    <div className="ofp__imgWrap">
                      <img
                        src={o.imageUrl}
                        alt=""
                        loading="lazy"
                        className="ofp__img"
                      />
                      {o.tag && <span className="ofp__imgTag">{o.tag}</span>}
                    </div>
                  )}

                  <div className="ofp__body">
                    {o.tag && !o.imageUrl && (
                      <span className="ofp__tag">
                        <Tag size={11} /> {o.tag}
                      </span>
                    )}
                    <h3 className="ofp__title">{o.title}</h3>
                    {o.description && (
                      <p className="ofp__desc">{o.description}</p>
                    )}
                    {o.validTill && (
                      <div className="ofp__valid">
                        <CalendarDays size={12} />
                        <span>Valid till {fmt(o.validTill)}</span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        <div className="pf__spacer" />
        <BottomNav />
      </div>
    </div>
  );
}
