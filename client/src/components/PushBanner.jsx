import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { usePush } from "../hooks/notifications/usePush";
import { syncDeviceToken } from "../lib/push";
import { api } from "../lib/api";
import { useToast } from "./Toast";

export default function PushBanner() {
  const { supported, permission, enable } = usePush();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  // "idle" | "ok" | "error"
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const register = async () => {
    setBusy(true);
    try {
      await syncDeviceToken();
      setStatus({ state: "ok", message: "" });
    } catch (e) {
      console.error("[push] token failed:", e);
      setStatus({ state: "error", message: e.message || "Could not register this device" });
    }
    setBusy(false);
  };

  // Permission already granted: register the token for real
  useEffect(() => {
    if (permission === "granted") register();
  }, [permission]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!supported) return null;

  if (permission === "denied") {
    return (
      <div className="pf__notice">
        Notifications are blocked. Allow them from your browser's site settings.
      </div>
    );
  }

  if (permission !== "granted") {
    const onEnable = async () => {
      setBusy(true);
      try {
        await enable();
      } catch (e) {
        setStatus({ state: "error", message: e.message });
      }
      setBusy(false);
    };
    return (
      <div className="pushbar">
        <BellRing size={22} />
        <div>
          <strong>Don't miss updates</strong>
          <span>Get offers and event news on your phone.</span>
        </div>
        <button className="smallbtn" disabled={busy} onClick={onEnable}>
          {busy ? "…" : "Turn on"}
        </button>
      </div>
    );
  }

  if (status.state === "error") {
    return (
      <div className="pushbar">
        <BellRing size={22} />
        <div>
          <strong>Could not turn on</strong>
          <span>{status.message}</span>
        </div>
        <button className="smallbtn" disabled={busy} onClick={register}>
          Retry
        </button>
      </div>
    );
  }

  const sendTest = async () => {
    setBusy(true);
    try {
      const r = await api("/notifications/test", { method: "POST" });
      toast(
        r.sent ? "Test sent. Check your notifications." : `Push failed: ${r.errors?.join(", ") || "unknown"}`,
        r.sent ? "success" : "error"
      );
    } catch (e) {
      toast(e.message, "error");
    }
    setBusy(false);
  };

  return (
    <div className="pushbar pushbar--on">
      <BellRing size={20} />
      <div>
        <strong>{status.state === "ok" ? "Notifications are on" : "Checking…"}</strong>
      </div>
      {status.state === "ok" && (
        <button className="smallbtn" disabled={busy} onClick={sendTest}>
          Send test
        </button>
      )}
    </div>
  );
}