import { useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { useOffers, markOffersSeen } from "../hooks/offers/useOffers";
import BottomNav from "../components/BottomNav";
import "../auth.css";
import "../profile.css";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }) : "";

export default function Offers() {
  const { offers, isLoading } = useOffers();
  const [params, setParams] = useSearchParams();
  const active = params.get("sponsor") || "all";

  useEffect(() => { markOffersSeen(); }, []);

  const groups = useMemo(() => {
    const map = new Map();
    for (const o of offers) {
      if (!map.has(o.sponsor.id)) map.set(o.sponsor.id, { sponsor: o.sponsor, items: [] });
      map.get(o.sponsor.id).items.push(o);
    }
    return [...map.values()];
  }, [offers]);

  const visible = active === "all" ? groups : groups.filter((g) => g.sponsor.id === active);

  return (
    <div className="pf">
      <div className="pf__wrap ofp">
        <div className="ofp__bar">
          <Link to="/" className="iconbtn" aria-label="Back"><ArrowLeft size={20} /></Link>
          <h1>Sponsor Offers</h1>
        </div>

        <div className="ofp__chips">
          <button className={`ofp__chip ${active === "all" ? "is-on" : ""}`} onClick={() => setParams({})}>All</button>
          {groups.map((g) => (
            <button
              key={g.sponsor.id}
              className={`ofp__chip ${active === g.sponsor.id ? "is-on" : ""}`}
              onClick={() => setParams({ sponsor: g.sponsor.id })}
            >
              {g.sponsor.name}
            </button>
          ))}
        </div>

        {isLoading && <p className="sheet__empty">Loading offers…</p>}
        {!isLoading && !visible.length && <p className="sheet__empty">No offers right now</p>}

        {visible.map((g) => (
          <section key={g.sponsor.id} className="ofp__group">
            <header className="ofp__sp">
              {g.sponsor.photoUrl ? <img src={g.sponsor.photoUrl} alt="" /> : <span>{g.sponsor.name?.[0]}</span>}
              <div>
                <div className="ofp__spName">{g.sponsor.name}</div>
                {g.sponsor.category && <small>{g.sponsor.category}</small>}
              </div>
            </header>
            <div className="ofp__list">
              {g.items.map((o) => (
                <article key={o.id} className="ofp__card">
                  {o.imageUrl && <img src={o.imageUrl} alt="" loading="lazy" className="ofp__img" />}
                  <div className="ofp__body">
                    {o.tag && <span className="mo__tag">{o.tag}</span>}
                    <h3>{o.title}</h3>
                    {o.description && <p>{o.description}</p>}
                    {o.validTill && (
                      <small><CalendarDays size={12} /> Valid till {fmt(o.validTill)}</small>
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