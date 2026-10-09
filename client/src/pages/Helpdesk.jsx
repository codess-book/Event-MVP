import {
  Shield,
  Siren,
  Ambulance,
  Flame,
  Users,
  Baby,
  Phone,
  MessageCircle,
  Copy,
  LifeBuoy,
  MapPinned,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // adjust if you use a different router
import { useToast } from "../components/Toast";
import "./help-desk.css";

/* ---------------------------------------------------------------
   EDIT THIS: Aaradhna team contacts.
   Entries without a valid 10-digit phone are hidden automatically,
   so nothing broken ever reaches your users.
---------------------------------------------------------------- */
const TEAM = [
  { name: "Rahul Sharma", role: "Event coordinator", phone: "7000418456" },
  { name: "Priya Verma", role: "Lost & found desk", phone: "9926492003" },
];

/* Public emergency numbers (India). */
const EMERGENCY = [
  { num: "100", label: "Police", icon: Shield },
  { num: "108", label: "Ambulance", icon: Ambulance },
  { num: "101", label: "Fire", icon: Flame },
  { num: "1091", label: "Women helpline", icon: Users },
  { num: "1098", label: "Child helpline", icon: Baby },
];

const TIPS = [
  "Stay calm and move to the nearest entry gate or a volunteer.",
  "Call an Aaradhna team member below and tell them where you are.",
  "If a child is missing, share their name, age and what they are wearing.",
];

const cleanPhone = (p = "") => String(p).replace(/\D/g, "").slice(-10);
const isValid = (p) => cleanPhone(p).length === 10;

export default function HelpDesk() {
  const toast = useToast();
  const navigate = useNavigate();
  const team = TEAM.filter((m) => isValid(m.phone));

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Number copied");
    } catch {
      toast("Could not copy. Please type it manually.");
    }
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <main className="hd">
      {/* ---------- Top bar with back button ---------- */}
      <div className="hd-topbar">
        <button
          type="button"
          className="hd-back"
          onClick={goBack}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <header className="hd-head">
        <span className="hd-head__ic" aria-hidden="true">
          <LifeBuoy size={22} />
        </span>
        <div>
          <h1>Help desk</h1>
          <p>Emergency numbers and the Aaradhna team, one tap away</p>
        </div>
      </header>

      {/* Primary emergency action */}
      <a className="hd-sos" href="tel:112">
        <span className="hd-sos__ic" aria-hidden="true">
          <Siren size={26} />
        </span>
        <span className="hd-sos__txt">
          <strong>Call 112</strong>
          <small>Police, ambulance and fire in one number</small>
        </span>
        <Phone size={20} aria-hidden="true" />
      </a>

      <section className="hd-sec" aria-labelledby="hd-emg">
        <h2 id="hd-emg">Emergency services</h2>
        <ul className="hd-grid">
          {EMERGENCY.map(({ num, label, icon: Icon }) => (
            <li key={num}>
              <a className="hd-card" href={`tel:${num}`}>
                <span className="hd-card__ic" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <span className="hd-card__num">{num}</span>
                <span className="hd-card__label">{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="hd-sec" aria-labelledby="hd-lost">
        <h2 id="hd-lost">Lost someone or need help?</h2>
        <div className="hd-tips">
          <MapPinned size={20} aria-hidden="true" />
          <ol>
            {TIPS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="hd-sec" aria-labelledby="hd-team">
        <h2 id="hd-team">Aaradhna team</h2>
        {team.length === 0 ? (
          <p className="hd-empty">
            Team contacts will appear here soon. For any emergency, call 112.
          </p>
        ) : (
          <ul className="hd-list">
            {team.map((m) => {
              const ph = cleanPhone(m.phone);
              return (
                <li key={m.name} className="hd-person">
                  <div className="hd-person__info">
                    <strong>{m.name}</strong>
                    <span>{m.role}</span>
                    <span className="hd-person__num">+91 {ph}</span>
                  </div>
                  <div className="hd-person__act">
                    <button
                      type="button"
                      className="hd-ic"
                      onClick={() => copy(ph)}
                      aria-label={`Copy ${m.name}'s number`}
                    >
                      <Copy size={18} />
                    </button>
                    <a
                      className="hd-ic"
                      href={`https://wa.me/91${ph}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${m.name}`}
                    >
                      <MessageCircle size={18} />
                    </a>
                    <a
                      className="hd-ic hd-ic--call"
                      href={`tel:+91${ph}`}
                      aria-label={`Call ${m.name}`}
                    >
                      <Phone size={18} />
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}