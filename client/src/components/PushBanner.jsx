import { useState } from "react";
import { BellRing } from "lucide-react";
import { usePush } from "../hooks/notifications/usePush";

export default function PushBanner() {
  const { supported, permission, enable } = usePush();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!supported) return null;

  if (permission === "granted") {
    return (
      <div className="pushbar pushbar--on">
        <BellRing size={20} />
        <div>
          <strong>Notifications are on</strong>
        </div>
      </div>
    );
  }
  if (permission === "denied") {
    return (
      <div className="pf__notice">
        Notifications are blocked. Turn them on from your browser's site
        settings to get event updates.
      </div>
    );
  }

  const onEnable = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await enable();
    } catch {
      setFailed(true);
    }
    setBusy(false);
  };

  return (
    <div className="pushbar">
      <BellRing size={22} />
      <div>
        <strong>Don't miss updates</strong>
        <span>
          {failed
            ? "Could not turn on. Please try again."
            : "Get offers and event news on your phone."}
        </span>
      </div>
      <button className="smallbtn" disabled={busy} onClick={onEnable}>
        {busy ? "…" : "Turn on"}
      </button>
    </div>
  );
}
