import { Link } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle } from "lucide-react";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import { useMembers } from "../hooks/members/useMembers";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";

export default function Members() {
  const { members, isLoading, error } = useMembers();

  return (
    <div className="pf">
      <div className="pf__wrap">
        <header className="sp__bar">
          <Link to="/profile" className="iconbtn" aria-label="Back"><ArrowLeft size={22} /></Link>
          <span className="sp__barTitle">Our Team</span>
          <span style={{ width: 42 }} />
        </header>

        <div className="sp__list">
          {isLoading && <p className="sheet__empty">Loading…</p>}
          {error && <div className="a2__err">{error.message}</div>}
          {!isLoading && !error && members.length === 0 && (
            <p className="sheet__empty">No members to show yet.</p>
          )}

          {members.map((x) => (
            <div key={x.id} className="sp__card mem">
              <Avatar user={{ name: x.name, photoUrl: x.photoUrl }} className="sp__logo" />
              <div className="sp__info">
                <div className="sp__name">{x.name}</div>
                <div className="sp__catTxt">{x.phone}</div>
              </div>
              <div className="mem__btns">
                <a className="iconbtn mem__btn" href={`tel:+91${x.phone}`} aria-label={`Call ${x.name}`}>
                  <Phone size={18} />
                </a>
                <a className="iconbtn mem__btn" href={`https://wa.me/91${x.phone}`} target="_blank"
                  rel="noopener noreferrer" aria-label={`WhatsApp ${x.name}`}>
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="pf__spacer" />
        <BottomNav />
      </div>
    </div>
  );
}