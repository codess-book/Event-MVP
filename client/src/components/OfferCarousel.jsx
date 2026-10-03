import { useRef, useState } from "react";
import { Pencil, Trash2, Ticket, CalendarDays } from "lucide-react";

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

// Read-only for visitors; pass onEdit/onRemove to show the sponsor's buttons
export default function OfferCarousel({ offers, onEdit, onRemove, removingId }) {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);

  const onScroll = () => {
    const el = ref.current;
    const card = el?.firstElementChild;
    if (!card) return;
    setIndex(Math.round(el.scrollLeft / (card.offsetWidth + 12)));
  };

  return (
    <div>
      <div className="ocar" ref={ref} onScroll={onScroll}>
        {offers.map((o) => (
          <article key={o.id} className={`offer ocar__card ${o.expired ? "is-expired" : ""}`}>
            <div className="offer__top">
              <h3 className="offer__title">{o.title}</h3>
              {o.expired && <span className="offer__exp">Expired</span>}
            </div>
            {o.description && <p className="offer__desc">{o.description}</p>}
            <div className="offer__meta">
              {o.code && <span className="offer__code"><Ticket size={14} /> {o.code}</span>}
              {o.validTill && (
                <span className="offer__date"><CalendarDays size={14} /> Valid till {fmtDate(o.validTill)}</span>
              )}
            </div>
            {onEdit && (
              <div className="offer__btns">
                <button className="smallbtn" onClick={() => onEdit(o)}><Pencil size={15} /> Edit</button>
                <button className="smallbtn smallbtn--danger" disabled={removingId === o.id} onClick={() => onRemove(o)}>
                  <Trash2 size={15} /> {removingId === o.id ? "Removing…" : "Remove"}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {offers.length > 1 && (
        <div className="ocar__dots" aria-hidden="true">
          {offers.map((o, i) => <span key={o.id} className={i === index ? "on" : ""} />)}
        </div>
      )}
    </div>
  );
}