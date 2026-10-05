import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "./install.css";

const APP_URL = "https://www.aaradhna.site";
const SHARE_TEXT = "Install the Aaradhna Garba app on your phone:";
const M = "#6e0f1c"; // maroon
const G = "#d9a441"; // gold
const L = "#e3d6c6"; // light line

// Simple line-art phone screens, one per step
const ART = {
  scan: (
    <>
      <rect x="46" y="44" width="28" height="28" rx="2" fill="none" stroke={M} strokeWidth="2" />
      <rect x="50" y="48" width="8" height="8" fill={M} />
      <rect x="62" y="48" width="8" height="8" fill={M} />
      <rect x="50" y="60" width="8" height="8" fill={M} />
      <rect x="63" y="62" width="3" height="3" fill={M} />
      <rect x="67" y="66" width="3" height="3" fill={M} />
      <path d="M40 38v-6h6M80 38v-6h-6M40 78v6h6M80 78v6h-6" fill="none" stroke={G} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="112" r="7" fill="none" stroke={M} strokeWidth="2" />
    </>
  ),
  dots: (
    <>
      <rect x="38" y="14" width="34" height="8" rx="4" fill={L} />
      <circle cx="80" cy="18" r="8" fill="none" stroke={G} strokeWidth="2.5" />
      {[14, 18, 22].map((y) => <circle key={y} cx="80" cy={y} r="1.5" fill={M} />)}
      <rect x="48" y="30" width="38" height="52" rx="4" fill="#fff" stroke={L} strokeWidth="2" />
      <path d="M54 40h26M54 50h26M54 60h18" stroke={L} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="50" y="65" width="34" height="12" rx="3" fill={G} fillOpacity=".35" stroke={G} strokeWidth="2" />
      <path d="M55 71h22" stroke={M} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  share: (
    <>
      <path d="M42 40h36M42 52h28M42 64h32" stroke={L} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="32" y="112" width="56" height="22" fill="#f4eee6" />
      <path d="M54 125v5h12v-5M60 128v-11M56.5 120.5L60 117l3.5 3.5" fill="none" stroke={M} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="60" cy="123" r="11" fill="none" stroke={G} strokeWidth="2.5" />
    </>
  ),
  addhome: (
    <>
      <rect x="36" y="46" width="48" height="84" rx="6" fill="#f4eee6" />
      <path d="M42 58h30M42 70h24" stroke={L} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="38" y="80" width="44" height="14" rx="3" fill={G} fillOpacity=".35" stroke={G} strokeWidth="2" />
      <rect x="42" y="83" width="8" height="8" rx="1.5" fill="none" stroke={M} strokeWidth="1.8" />
      <path d="M46 85v4M44 87h4M54 87h22" stroke={M} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M42 104h30M42 114h22" stroke={L} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  confirm: (
    <>
      <rect x="38" y="46" width="44" height="46" rx="6" fill="#f4eee6" stroke={L} strokeWidth="2" />
      <rect x="44" y="53" width="11" height="11" rx="2.5" fill={M} />
      <path d="M59 56h18M59 62h12" stroke={L} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 84h10" stroke={L} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="58" y="77" width="20" height="10" rx="3" fill={G} />
      <circle cx="68" cy="82" r="11" fill="none" stroke={G} strokeWidth="1.8" />
    </>
  ),
  done: (
    <>
      {[30, 50, 70].flatMap((y) =>
        [42, 58, 74].map((x) =>
          x === 58 && y === 50 ? null : <rect key={x + "-" + y} x={x} y={y} width="12" height="12" rx="3" fill={L} />
        )
      )}
      <rect x="58" y="50" width="12" height="12" rx="3" fill={M} />
      <text x="64" y="59.5" textAnchor="middle" fontSize="9" fontWeight="700" fill={G} fontFamily="serif">A</text>
      <circle cx="64" cy="56" r="10" fill="none" stroke={G} strokeWidth="2" />
      <rect x="38" y="108" width="44" height="16" rx="6" fill={L} fillOpacity=".6" />
    </>
  ),
};

function Art({ kind }) {
  return (
    <svg viewBox="0 0 120 140" role="img" aria-hidden="true">
      <rect x="32" y="6" width="56" height="128" rx="9" fill="#fff" stroke={M} strokeWidth="2.5" />
      <rect x="52" y="10" width="16" height="3" rx="1.5" fill={M} />
      {ART[kind]}
    </svg>
  );
}

const GUIDES = {
  android: {
    label: "Android",
    note: "Use Chrome.",
    steps: [
      ["scan", "Scan the QR code", "Open your camera and scan the QR code below, or tap the link."],
      ["dots", "Tap the 3 dots", "After the link opens, tap the 3 dots at the top right and scroll down to Install app."],
      ["confirm", "Tap Install", "Tap Install, then Create shortcut if it asks."],
      ["done", "Done", "Find the Aaradhna app on your home screen and tap to open."],
    ],
  },
  ios: {
    label: "iPhone",
    note: "Use Safari. Links opened inside WhatsApp or Instagram can't install the app.",
    steps: [
      ["scan", "Open in Safari", "Scan the QR code with your camera, or paste the link in Safari."],
      ["share", "Tap Share", "Tap the Share button, the square with an arrow at the bottom."],
      ["addhome", "Add to Home Screen", "Scroll down in the Share menu and tap Add to Home Screen."],
      ["confirm", "Tap Add", "The Aaradhna icon now sits on your home screen. Open it from there."],
    ],
  },
};

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

export default function InstallPage() {
  const [tab, setTab] = useState(isIOS() ? "ios" : "android");
  const [installEvent, setInstallEvent] = useState(null);
  const [msg, setMsg] = useState("");
  const qrRef = useRef(null);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2500);
  };

  const installNow = async () => {
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      flash("Link copied");
    } catch {
      flash("Could not copy. Long-press the link instead.");
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Aaradhna", text: SHARE_TEXT, url: APP_URL });
      } catch {
        /* share sheet closed */
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${APP_URL}`)}`, "_blank");
    }
  };

  const getQrBlob = () => new Promise((resolve) => qrRef.current.toBlob(resolve, "image/png"));

  const downloadQr = async () => {
    const blob = await getQrBlob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "aaradhna-install-qr.png";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const shareQr = async () => {
    const blob = await getQrBlob();
    const file = new File([blob], "aaradhna-install-qr.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: `${SHARE_TEXT} ${APP_URL}` });
      } catch {
        /* share sheet closed */
      }
    } else {
      await downloadQr();
      flash("QR saved. Share it from your gallery.");
    }
  };

  const guide = GUIDES[tab];

  return (
    <main className="inst">
      <img className="inst__logo" src="/aradhana-logo.png" alt="Aaradhna" />
      <h1 className="inst__title">How to install</h1>
      <p className="inst__lead">Add Aaradhna to your home screen once. It then opens like any other app.</p>

      {isInstalled() ? (
        <p className="inst__done">The app is already installed on this phone.</p>
      ) : (
        <>
          {installEvent && (
            <button className="inst__btn inst__btn--gold" onClick={installNow}>
              Install now
            </button>
          )}

          <div className="inst__tabs" role="tablist" aria-label="Phone type">
            {Object.entries(GUIDES).map(([key, g]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                className={`inst__tab ${tab === key ? "is-on" : ""}`}
                onClick={() => setTab(key)}
              >
                {g.label}
              </button>
            ))}
          </div>
          <p className="inst__note">{guide.note}</p>

          <ol className="inst__steps">
            {guide.steps.map(([kind, title, text], i) => (
              <li key={tab + kind} className="inst__step">
                <div className="inst__art">
                  <Art kind={kind} />
                </div>
                <h2>
                  {i + 1}. {title}
                </h2>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </>
      )}

      <section className="inst__share" aria-label="Share the app">
        <div className="inst__qr">
          <QRCodeCanvas
            ref={qrRef}
            value={APP_URL}
            size={512}
            level="M"
            marginSize={2}
            bgColor="#ffffff"
            fgColor="#14070a"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        <p className="inst__url">{APP_URL.replace("https://", "")}</p>
        <div className="inst__row">
          <button className="inst__btn" onClick={shareLink}>Share link</button>
          <button className="inst__btn" onClick={copyLink}>Copy link</button>
          <button className="inst__btn" onClick={shareQr}>Share QR</button>
          <button className="inst__btn" onClick={downloadQr}>Save QR</button>
        </div>
        <p className="inst__msg" role="status" aria-live="polite">{msg}</p>
      </section>
    </main>
  );
}