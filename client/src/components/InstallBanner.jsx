import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, X } from "lucide-react";
import { useInstall } from "../hooks/pwa/useInstall";

const KEY = "aaradhna_install_hidden";
const wasHidden = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export default function InstallBanner() {
  const { installed, canInstall, install } = useInstall();
  const [hidden, setHidden] = useState(wasHidden());

  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (installed || hidden) return null;

  return (
    <div className="pushbar">
      <Download size={22} />
      <div>
        <strong>Install Aaradhna app</strong>
        <span>Quick access and event notifications.</span>
      </div>
      {canInstall ? (
        <button className="smallbtn" onClick={install}>
          Install
        </button>
      ) : (
        <Link
          to="/install"
          className="smallbtn"
          style={{ textDecoration: "none" }}
        >
          How to
        </Link>
      )}
      <button className="iconbtn" aria-label="Dismiss" onClick={hide}>
        <X size={16} />
      </button>
    </div>
  );
}
