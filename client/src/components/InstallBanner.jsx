import { useState } from "react";
import { Download, Share } from "lucide-react";
import { useInstall } from "../hooks/pwa/useInstall";

const KEY = "aaradhna_install_hidden";
const wasHidden = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } };

export default function InstallBanner() {
  const { installed, canInstall, ios, install } = useInstall();
  const [hidden, setHidden] = useState(wasHidden());

  const hide = () => {
    setHidden(true);
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
  };

  if (installed || hidden || (!canInstall && !ios)) return null;

  return (
    <div className="pushbar">
      <Download size={22} />
      <div>
        <strong>Install Aaradhna app</strong>
        {canInstall ? (
          <span>Quick access and event notifications.</span>
        ) : (
          <span>Tap <Share size={13} style={{ verticalAlign: "-2px" }} /> Share, then "Add to Home Screen".</span>
        )}
      </div>
      {canInstall ? (
        <button className="smallbtn" onClick={install}>Install</button>
      ) : (
        <button className="smallbtn" onClick={hide}>Got it</button>
      )}
    </div>
  );
}