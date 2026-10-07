import { Link } from "react-router-dom";
import { Gift, Megaphone } from "lucide-react";

export default function OffersBanner({ count, total }) {
  if (!total) return null;
  return (
    <Link to="/offers" className="ob">
      <span className="ob__ic"><Gift size={22} /></span>
      <span className="ob__txt">
        <b>
          {count > 0
            ? `${count} New Offer${count > 1 ? "s" : ""} Available`
            : `${total} Offers from our sponsors`}
        </b>
        <small>Tap to view exclusive deals →</small>
      </span>
      <Megaphone size={20} className="ob__deco" />
      <span className="ob__btn">View Offers</span>
    </Link>
  );
}