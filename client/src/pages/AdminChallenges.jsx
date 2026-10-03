// pages/AdminChallenges.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../components/Toast";
import { useEvent } from "../hooks/events/useEvents"; // apne file ke naam se match karo
import { useAdminEntries, useSetWinner, useDeleteEntry } from "../hooks/challenges/useChallenges";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import "../lightcards.css";

export default function AdminChallenges() {
  const toast = useToast();
  const { items } = useEvent();
  const challenges = items.filter((i) => i.kind === "update" && i.category === "challenge").sort((a, b) => b.day.localeCompare(a.day));
  const [pick, setPick] = useState("");
  const id = pick || challenges[0]?._id || "";
  const { entries, isLoading, error } = useAdminEntries(id);
  const win = useSetWinner();
  const del = useDeleteEntry();
  const busy = win.isMutating || del.isMutating;

  const makeWinner = async (e) => {
    if (!window.confirm(`Make ${e.user?.name} the winner? Everyone will be notified.`)) return;
    try { await win.trigger({ id: e._id }); toast("Winner selected"); } catch (er) { toast(er.message, "error"); }
  };
  const remove = async (e) => {
    if (!window.confirm("Delete this photo?")) return;
    try { await del.trigger({ id: e._id }); toast("Deleted"); } catch (er) { toast(er.message, "error"); }
  };

  return (
    <div className="pf lc"><div className="pf__wrap">
      <header className="sp__bar">
        <Link to="/profile" className="iconbtn" aria-label="Back"><ArrowLeft size={22} /></Link>
        <span className="sp__barTitle">Challenge photos</span>
        <span style={{ width: 42 }} />
      </header>
      <div className="sp__list">
        {!challenges.length ? (
          <p className="sheet__empty">Add a Challenge entry from Manage Event first.</p>
        ) : (
          <select className="adm__select" value={id} onChange={(e) => setPick(e.target.value)}>
            {challenges.map((c) => <option key={c._id} value={c._id}>{c.day} · {c.title}</option>)}
          </select>
        )}
        {isLoading && <p className="sheet__empty">Loading…</p>}
        {error && <div className="a2__err">{error.message}</div>}
        {id && !isLoading && !entries.length && <p className="sheet__empty">No photos submitted yet.</p>}
        {entries.map((e) => (
          <div className="card" key={e._id}>
            <a href={e.photoUrl} target="_blank" rel="noopener noreferrer">
              <img src={e.photoUrl} alt="" style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 12 }} />
            </a>
            <div className="card__top" style={{ marginTop: 8 }}>
              <div>
                <div className="card__name">{e.user?.name}</div>
                <div className="card__meta">{e.user?.phone} · {e.user?.userType}{e.user?.passNumber ? ` · #${e.user.passNumber}` : ""}</div>
              </div>
              {e.isWinner && <span className="badge badge--gold">winner</span>}
            </div>
            <div className="adm__btns">
              {!e.isWinner && <button className="a2__btn btn--sm" disabled={busy} onClick={() => makeWinner(e)}>Make winner</button>}
              <button className="smallbtn smallbtn--danger" disabled={busy} onClick={() => remove(e)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div></div>
  );
}