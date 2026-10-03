import { useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Plus, Pencil, Trash2, Heart } from "lucide-react";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import PrizeSheet from "../components/PrizeSheet";
import { useToast } from "../components/Toast";
import { useMe } from "../hooks/auth/useMe";
import { usePrizes, useDeletePrize } from "../hooks/prizes/usePrizes";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";

export default function Prizes() {
  const { user } = useMe();
  const toast = useToast();
  const { prizes, isLoading, error } = usePrizes();
  const del = useDeletePrize();
  const [sheet, setSheet] = useState(null); // null | { prize }  (prize null = adding)

  const isAdmin = user?.role === "admin";
  const canAdd = isAdmin || (user?.userType === "sponsor" && user?.isApproved);

  const onDelete = async (p) => {
    try {
      await del.trigger(p.id);
      toast("Prize removed");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div className="pf">
      <div className="pf__wrap">
        <header className="sp__head">
          <h1 className="sp__h1">Prizes</h1>
          <p className="sp__sub">Play your best and win something special</p>
        </header>

        {canAdd && (
          <div style={{ padding: "16px 16px 0" }}>
            <button className="a2__btn" style={{ width: "100%", margin: 0 }}
              onClick={() => setSheet({ prize: null })}>
              <Plus size={18} style={{ verticalAlign: "-3px" }} /> Add a prize
            </button>
          </div>
        )}

        <div className="sp__list">
          {isLoading && <p className="sheet__empty">Loading…</p>}
          {error && <div className="a2__err">{error.message}</div>}
          {!isLoading && !error && prizes.length === 0 && (
            <p className="sheet__empty">No prizes announced yet.</p>
          )}

          {prizes.map((p) => (
            <article key={p.id} className="prize">
              <div className="prize__top">
                <span className="tile__ic"><Trophy size={22} /></span>
                <div className="prize__txt">
                  <h3 className="prize__title">{p.title}</h3>
                  {p.forWhat && <span className="pf__badge">{p.forWhat}</span>}
                </div>
              </div>
              {p.description && <p className="offer__desc">{p.description}</p>}

              {p.donor.type === "sponsor" ? (
                <Link to={`/sponsors/${p.donor.id}`} className="prize__donor">
                  <Avatar user={{ name: p.donor.name, photoUrl: p.donor.photoUrl }} className="prize__av" />
                  <span>Sponsored by <strong>{p.donor.name}</strong></span>
                </Link>
              ) : (
                <div className="prize__donor">
                  <Heart size={16} />
                  <span>Gifted by <strong>{p.donor.name}</strong></span>
                </div>
              )}

              {p.canEdit && (
                <div className="offer__btns">
                  <button className="smallbtn" onClick={() => setSheet({ prize: p })}>
                    <Pencil size={15} /> Edit
                  </button>
                  <button className="smallbtn smallbtn--danger" disabled={del.isMutating} onClick={() => onDelete(p)}>
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="pf__spacer" />
        <BottomNav />
      </div>

      {sheet && <PrizeSheet prize={sheet.prize} isAdmin={isAdmin} onClose={() => setSheet(null)} />}
    </div>
  );
}