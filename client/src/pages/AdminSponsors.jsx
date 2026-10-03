import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Avatar from "../components/Avatar";
import { useToast } from "../components/Toast";
import { useAdminSponsors,useUpdateSponsor } from "../hooks/admin/useAdminSponsers";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";

function Row({ s, categories }) {
  const toast = useToast();
  const { trigger, isMutating } = useUpdateSponsor();
  const [cat, setCat] = useState(s.category);

  // Old free-text categories (like "studio") stay visible until the admin picks a new one
  const options = cat && !categories.includes(cat) ? [cat, ...categories] : categories;

  const save = async (changes, okMsg) => {
    try {
      await trigger({ id: s.id, changes });
      toast(okMsg);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div className="card">
      <div className="card__top">
        <div className="adm__who">
          <Avatar user={{ name: s.businessName, photoUrl: s.photoUrl }} className="sp__logo adm__logo" />
          <div>
            <div className="card__name">{s.businessName}</div>
            <div className="card__meta">{s.name} · {s.phone} · {s.offerCount} offers</div>
          </div>
        </div>
        <span className={`badge ${s.isApproved ? "badge--gold" : ""}`}>
          {s.isApproved ? "live" : "pending"}
        </span>
      </div>

      <select className="adm__select" value={cat} onChange={(e) => setCat(e.target.value)}>
        <option value="">Choose category…</option>
        {options.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <div className="adm__btns">
        {s.isApproved ? (
          <>
            <button className="smallbtn" disabled={isMutating || !cat || cat === s.category}
              onClick={() => save({ sponsorCategory: cat }, "Category updated")}>
              Save category
            </button>
            <button className="smallbtn smallbtn--danger" disabled={isMutating}
              onClick={() => save({ isApproved: false }, "Sponsor hidden")}>
              Hide
            </button>
          </>
        ) : (
          <button className="a2__btn btn--sm" disabled={isMutating || !cat}
            onClick={() => save({ isApproved: true, sponsorCategory: cat }, "Approved, welcome sent")}>
            {isMutating ? "Approving…" : "Approve"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminSponsors() {
  const { sponsors, categories, isLoading, error } = useAdminSponsors();

  return (
    <div className="pf">
      <div className="pf__wrap">
        <header className="sp__bar">
          <Link to="/profile" className="iconbtn" aria-label="Back"><ArrowLeft size={22} /></Link>
          <span className="sp__barTitle">Manage sponsors</span>
          <span style={{ width: 42 }} />
        </header>

        <div className="sp__list">
          {isLoading && <p className="sheet__empty">Loading…</p>}
          {error && <div className="a2__err">{error.message}</div>}
          {!isLoading && !error && sponsors.length === 0 && (
            <p className="sheet__empty">No sponsors have registered yet.</p>
          )}
          {sponsors.map((s) => <Row key={s.id} s={s} categories={categories} />)}
        </div>
      </div>
    </div>
  );
}