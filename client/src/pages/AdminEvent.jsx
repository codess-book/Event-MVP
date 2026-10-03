// pages/AdminEvent.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../components/Toast";
// import { useEvent, useCreateEvent, useDeleteEvent } from "../hooks/event/useEvent";
import { useEvent,useCreateEvent,useDeleteEvent } from "../hooks/events/useEvents";
import { todayIST, UPDATE_LABEL, PLACE_LABEL } from "./Event";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import "../lightcards.css";

const empty = (kind) => ({
  kind, category: kind === "update" ? "dresscode" : "washroom",
  title: "", body: "", day: todayIST(), time: "19:00", mapLink: "", notify: kind === "update",
});

export default function AdminEvent() {
  const toast = useToast();
  const { items } = useEvent();
  const create = useCreateEvent();
  const del = useDeleteEvent();
  const [f, setF] = useState(empty("update"));
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async () => {
    const payload = { kind: f.kind, title: f.title, body: f.body, notify: f.notify };
    if (f.kind !== "schedule") payload.category = f.category;
    if (f.kind !== "place") payload.day = f.day;
    if (f.kind === "schedule") payload.time = f.time;
    if (f.kind === "place") payload.mapLink = f.mapLink;
    try {
      await create.trigger(payload);
      toast(f.notify ? "Saved & notification sent" : "Saved");
      setF(empty(f.kind));
    } catch (e) { toast(e.message, "error"); }
  };

  const remove = async (i) => {
    if (!window.confirm(`Delete "${i.title}"?`)) return;
    try { await del.trigger({ id: i._id }); toast("Deleted"); } catch (e) { toast(e.message, "error"); }
  };

  return (
    <div className="pf lc"><div className="pf__wrap">
      <header className="sp__bar">
        <Link to="/profile" className="iconbtn" aria-label="Back"><ArrowLeft size={22} /></Link>
        <span className="sp__barTitle">Manage event</span>
        <span style={{ width: 42 }} />
      </header>

      <div className="sp__list">
        <div className="card">
          <select className="adm__select" value={f.kind} onChange={(e) => setF(empty(e.target.value))}>
            <option value="update">Today: dress code / challenge</option>
            <option value="schedule">Schedule: aarti, garba, break…</option>
            <option value="place">Venue: washroom, food, water…</option>
          </select>

          {f.kind !== "schedule" && (
            <select className="adm__select" value={f.category} onChange={set("category")}>
              {Object.entries(f.kind === "update" ? UPDATE_LABEL : PLACE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          )}

          <input className="adm__select" placeholder="Title (e.g. Best selfie challenge)" maxLength={60} value={f.title} onChange={set("title")} />
          <textarea className="adm__select" placeholder="Details (optional)" maxLength={300} rows={3} value={f.body} onChange={set("body")} />

          {f.kind !== "place" && <input className="adm__select" type="date" value={f.day} onChange={set("day")} />}
          {f.kind === "schedule" && <input className="adm__select" type="time" value={f.time} onChange={set("time")} />}
          {f.kind === "place" && <input className="adm__select" placeholder="Google Maps link" value={f.mapLink} onChange={set("mapLink")} />}

          <label className="card__meta" style={{ display: "block", margin: "8px 0" }}>
            <input type="checkbox" checked={f.notify} onChange={set("notify")} /> Notify everyone
          </label>
          <button className="a2__btn btn--sm" disabled={create.isMutating || f.title.trim().length < 2} onClick={submit}>
            {create.isMutating ? "Saving…" : "Save"}
          </button>
        </div>

        {items.map((i) => (
          <div className="card" key={i._id}>
            <div className="card__top">
              <div>
                <div className="card__name">{i.title}</div>
                <div className="card__meta">{i.kind}{i.category && ` · ${i.category}`}{i.day && ` · ${i.day}`}{i.time && ` · ${i.time}`}</div>
              </div>
              <button className="smallbtn smallbtn--danger" disabled={del.isMutating} onClick={() => remove(i)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div></div>
  );
}