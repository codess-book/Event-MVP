import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Type } from "lucide-react";
import IconField from "../components/IconField";
import { useSendNotification } from "../hooks/notifications/useNotifications";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";

const AUDIENCES = [
  { value: "all", label: "Everyone" },
  { value: "player", label: "Players" },
  { value: "member", label: "Members" },
  { value: "sponsor", label: "Sponsors" },
];

export default function AdminNotify() {
  const { trigger, isMutating, error, reset } = useSendNotification();
  const [form, setForm] = useState({ title: "", body: "", audience: "all" });
  const [result, setResult] = useState(null);

  const set = (name, value) => {
    reset();
    setResult(null);
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const who = AUDIENCES.find((a) => a.value === form.audience).label;
    if (!window.confirm(`Send this to ${who}?`)) return;
    try {
      setResult(await trigger(form));
      setForm((f) => ({ ...f, title: "", body: "" }));
    } catch { /* shown from `error` */ }
  };

  return (
    <div className="pf">
      <div className="pf__wrap">
        <header className="sp__bar">
          <Link to="/profile" className="iconbtn" aria-label="Back"><ArrowLeft size={22} /></Link>
          <span className="sp__barTitle">Send notification</span>
          <span style={{ width: 42 }} />
        </header>

        <form className="sheet__form" style={{ padding: 16 }} onSubmit={onSubmit}>
          <p className="chips-label" style={{ color: "var(--mut)", margin: 0 }}>Send to</p>
          <div className="sp__cats" style={{ padding: 0 }} role="group" aria-label="Audience">
            {AUDIENCES.map((a) => (
              <button key={a.value} type="button" className="sp__cat"
                aria-pressed={form.audience === a.value} onClick={() => set("audience", a.value)}>
                {a.label}
              </button>
            ))}
          </div>

          <IconField icon={Type} id="n-title" label="Title" placeholder="e.g. Today's dress code"
            maxLength={60} value={form.title} onChange={(e) => set("title", e.target.value)} required />

          <div className="f2 f2--area">
            <div className="f2__body">
              <label htmlFor="n-body">Message</label>
              <textarea id="n-body" rows={4} maxLength={200} placeholder="Short and clear works best"
                value={form.body} onChange={(e) => set("body", e.target.value)} required />
            </div>
          </div>

          {error && <div className="a2__err" role="alert">{error.message}</div>}
          {result && (
            <div className="pf__notice">
              {result.pushed
                ? `Sent to ${result.sent} of ${result.devices} devices. It is also in everyone's bell list.`
                : result.message}
            </div>
          )}

          <button className="a2__btn" disabled={isMutating}>
            {isMutating ? "Sending…" : "Send notification"}
          </button>
        </form>
      </div>
    </div>
  );
}