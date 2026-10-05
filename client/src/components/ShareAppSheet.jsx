import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Share2, Copy, Download, Check } from "lucide-react";
import Sheet from "./Sheet";

const SITE = "https://www.aaradhna.site";
const INSTALL_URL = `${SITE}/install`;
const DISPLAY_URL = INSTALL_URL.replace("https://", "");

const MAROON = "#6e0f1c";
const GOLD = "#d9a441";
const INK = "#2a1013";

const SHARE_TEXT = `Aaradhna Garba 2026

Install the official Aaradhna app for event updates, challenges, prizes and sponsor offers.

How to install
1. Open the link below (Chrome on Android, Safari on iPhone)
2. Android: tap the 3 dots, then Install app
   iPhone: tap Share, then Add to Home Screen
3. Open Aaradhna from your home screen and register

${INSTALL_URL}`;

const GUIDES = [
  {
    label: "Android",
    browser: "Chrome",
    steps: ["Scan the QR code", "Tap the 3 dots", "Tap Install app"],
  },
  {
    label: "iPhone",
    browser: "Safari",
    steps: ["Scan the QR code", "Tap Share", "Tap Add to Home Screen"],
  },
];

const css = `
.sas{display:flex;flex-direction:column;gap:18px;color:${INK}}
.sas__qrCard{position:relative;margin:0 auto;padding:18px 18px 14px;width:100%;max-width:290px;
  background:#fff;border-radius:22px;border:1px solid #eadfce;text-align:center;
  box-shadow:0 10px 30px rgba(110,15,28,.10)}
.sas__corner{position:absolute;width:22px;height:22px;border:3px solid ${GOLD}}
.sas__corner--tl{top:8px;left:8px;border-right:0;border-bottom:0;border-top-left-radius:10px}
.sas__corner--tr{top:8px;right:8px;border-left:0;border-bottom:0;border-top-right-radius:10px}
.sas__corner--bl{bottom:8px;left:8px;border-right:0;border-top:0;border-bottom-left-radius:10px}
.sas__corner--br{bottom:8px;right:8px;border-left:0;border-top:0;border-bottom-right-radius:10px}
.sas__qr{display:block;margin:6px auto 0;width:100%;max-width:230px;height:auto;aspect-ratio:1}
.sas__scan{margin:10px 0 2px;font-size:15px;font-weight:700;color:${MAROON}}
.sas__url{display:inline-block;margin:4px 0 2px;padding:5px 12px;border-radius:999px;
  background:#f6efe4;font-size:12.5px;font-weight:600;color:${MAROON};word-break:break-all}
.sas__title{margin:0 0 8px;font-size:14px;font-weight:700;color:${INK}}
.sas__guides{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sas__guide{padding:12px;border-radius:14px;background:#faf5ec;border:1px solid #eadfce}
.sas__gHead{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px}
.sas__gName{font-size:14px;font-weight:700;color:${MAROON}}
.sas__gBrowser{font-size:11.5px;color:#7a6a64}
.sas__steps{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px}
.sas__steps li{display:flex;gap:8px;align-items:flex-start;font-size:12.5px;line-height:1.35}
.sas__n{flex:none;width:18px;height:18px;border-radius:50%;background:${MAROON};color:#fff;
  font-size:10.5px;font-weight:700;display:grid;place-items:center;margin-top:1px}
.sas__note{margin:0;padding:10px 12px;border-radius:12px;background:#fff8e6;
  border-left:3px solid ${GOLD};font-size:12.5px;line-height:1.45;color:#5b4a2a}
.sas__actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sas__btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  min-height:46px;padding:0 14px;border-radius:14px;font:inherit;font-size:14px;font-weight:700;
  cursor:pointer;border:1.5px solid ${MAROON};background:#fff;color:${MAROON};
  transition:transform .12s ease,background .12s ease}
.sas__btn:active{transform:scale(.98)}
.sas__btn:focus-visible{outline:3px solid ${GOLD};outline-offset:2px}
.sas__btn--primary{grid-column:1/-1;background:${MAROON};color:#fff;border-color:${MAROON};min-height:50px;font-size:15px}
.sas__status{min-height:18px;margin:0;text-align:center;font-size:13px;font-weight:600;color:${MAROON}}
@media (max-width:340px){.sas__guides{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.sas__btn{transition:none}}
`;

export default function ShareAppSheet({ onClose }) {
  const qrRef = useRef(null);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2500);
  };

  // Builds a shareable image: title, QR, link and install steps
  const makePoster = () =>
    new Promise((resolve) => {
      const W = 900;
      const H = 1360;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const x = c.getContext("2d");

      // Frame
      x.fillStyle = MAROON;
      x.fillRect(0, 0, W, H);
      x.fillStyle = GOLD;
      x.fillRect(28, 28, W - 56, H - 56);
      x.fillStyle = "#fffdf9";
      x.fillRect(34, 34, W - 68, H - 68);

      // Header band
      x.fillStyle = MAROON;
      x.fillRect(34, 34, W - 68, 210);
      x.textAlign = "center";
      x.fillStyle = "#fff";
      x.font = "bold 64px Georgia, serif";
      x.fillText("Aaradhna Garba", W / 2, 130);
      x.fillStyle = GOLD;
      x.font = "30px Arial, sans-serif";
      x.fillText("Official event app", W / 2, 186);

      // QR
      x.fillStyle = "#fff";
      x.fillRect(165, 285, 570, 570);
      x.strokeStyle = GOLD;
      x.lineWidth = 4;
      x.strokeRect(165, 285, 570, 570);
      x.drawImage(qrRef.current, 185, 305, 530, 530);

      x.fillStyle = MAROON;
      x.font = "bold 36px Arial, sans-serif";
      x.fillText("Scan to install the app", W / 2, 925);
      x.font = "28px Arial, sans-serif";
      x.fillText(DISPLAY_URL, W / 2, 970);

      // Divider
      x.fillStyle = GOLD;
      x.fillRect(120, 1005, W - 240, 3);

      // Steps
      x.textAlign = "left";
      const rows = [
        ["Android (Chrome)", true],
        ["Tap the 3 dots, then Install app", false],
        ["iPhone (Safari)", true],
        ["Tap Share, then Add to Home Screen", false],
      ];
      let y = 1062;
      rows.forEach(([text, head]) => {
        x.fillStyle = head ? MAROON : INK;
        x.font = head
          ? "bold 30px Arial, sans-serif"
          : "28px Arial, sans-serif";
        x.fillText(text, 120, y);
        y += head ? 42 : 66;
      });

      x.fillStyle = "#7a6a64";
      x.font = "24px Arial, sans-serif";
      x.fillText(
        "Open the link in Chrome or Safari, not inside WhatsApp or Instagram.",
        120,
        y + 6,
      );

      c.toBlob(resolve, "image/png");
    });

  const shareAll = async () => {
    try {
      const blob = await makePoster();
      const file = new File([blob], "aaradhna-install.png", {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: SHARE_TEXT });
      } else if (navigator.share) {
        await navigator.share({
          title: "Aaradhna",
          text: SHARE_TEXT,
          url: INSTALL_URL,
        });
      } else {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`,
          "_blank",
        );
      }
    } catch {
      /* share sheet closed */
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_URL);
      setCopied(true);
      flash("Link copied");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      flash("Could not copy. Press and hold the link instead.");
    }
  };

  const saveImage = async () => {
    const blob = await makePoster();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "aaradhna-install.png";
    a.click();
    URL.revokeObjectURL(a.href);
    flash("Image saved");
  };

  return (
    <Sheet title="Share the app" onClose={onClose}>
      <style>{css}</style>
      <div className="sas">
        <div className="sas__qrCard">
          <span className="sas__corner sas__corner--tl" />
          <span className="sas__corner sas__corner--tr" />
          <span className="sas__corner sas__corner--bl" />
          <span className="sas__corner sas__corner--br" />
          <QRCodeCanvas
            ref={qrRef}
            className="sas__qr"
            value={INSTALL_URL}
            size={512}
            level="M"
            marginSize={1}
            bgColor="#ffffff"
            fgColor="#14070a"
            style={{ width: "100%", height: "auto" }}
          />
          <p className="sas__scan">Scan with your phone camera</p>
          <span className="sas__url">{DISPLAY_URL}</span>
        </div>

        <div>
          <h3 className="sas__title">How to install</h3>
          <div className="sas__guides">
            {GUIDES.map((g) => (
              <section className="sas__guide" key={g.label}>
                <div className="sas__gHead">
                  <span className="sas__gName">{g.label}</span>
                  <span className="sas__gBrowser">{g.browser}</span>
                </div>
                <ol className="sas__steps">
                  {g.steps.map((s, i) => (
                    <li key={s}>
                      <span className="sas__n">{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </div>

        <p className="sas__note">
          Links opened inside WhatsApp or Instagram cannot install the app. Open
          the link in Chrome or Safari.
        </p>

        <div className="sas__actions">
          <button className="sas__btn sas__btn--primary" onClick={shareAll}>
            <Share2 size={18} /> Share QR and instructions
          </button>
          <button className="sas__btn" onClick={copyLink}>
            {copied ? <Check size={17} /> : <Copy size={17} />}
            {copied ? "Copied" : "Copy link"}
          </button>
          <button className="sas__btn" onClick={saveImage}>
            <Download size={17} /> Save image
          </button>
        </div>

        <p className="sas__status" role="status" aria-live="polite">
          {msg}
        </p>
      </div>
    </Sheet>
  );
}
