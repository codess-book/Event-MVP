import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Sheet from "./Sheet";

const SITE = "https://www.aaradhna.site"; // sahi domain
const INSTALL_URL = `${SITE}/install`;

const SHARE_TEXT = `🪔 Aaradhna Garba 2026

App install karo, event updates, challenges aur offers sab ek jagah.

📲 Install karne ke steps:
1. Link kholo (iPhone par Safari, Android par Chrome)
2. Android: 3 dots → Install app
   iPhone: Share → Add to Home Screen
3. Home screen se app kholo aur register karo

Link: ${INSTALL_URL}`;

export default function ShareAppSheet({ onClose }) {
  const qrRef = useRef(null);
  const [msg, setMsg] = useState("");

  const flash = (t) => {
    setMsg(t);
    setTimeout(() => setMsg(""), 2500);
  };

  // QR ko poster jaisa image banata hai: title + QR + link + steps
  const makePoster = () =>
    new Promise((resolve) => {
      const qr = qrRef.current;
      const W = 900, H = 1300;
      const c = document.createElement("canvas");
      c.width = W; c.height = H;
      const x = c.getContext("2d");

      x.fillStyle = "#6e0f1c"; x.fillRect(0, 0, W, H);
      x.fillStyle = "#fff"; x.fillRect(40, 40, W - 80, H - 80);

      x.fillStyle = "#6e0f1c"; x.textAlign = "center";
      x.font = "bold 56px serif";
      x.fillText("Aaradhna Garba", W / 2, 140);
      x.fillStyle = "#d9a441";
      x.font = "28px sans-serif";
      x.fillText("Scan karke app install karo", W / 2, 190);

      x.drawImage(qr, 175, 230, 550, 550);

      x.fillStyle = "#6e0f1c";
      x.font = "bold 30px sans-serif";
      x.fillText(INSTALL_URL.replace("https://", ""), W / 2, 840);

      x.textAlign = "left";
      x.fillStyle = "#14070a";
      x.font = "26px sans-serif";
      [
        "Android (Chrome):",
        "  3 dots  >  Install app  >  Install",
        "",
        "iPhone (Safari):",
        "  Share  >  Add to Home Screen  >  Add",
        "",
        "WhatsApp/Instagram ke andar se install nahi hota,",
        "link ko Safari ya Chrome mein kholo.",
      ].forEach((line, i) => x.fillText(line, 100, 920 + i * 44));

      c.toBlob(resolve, "image/png");
    });

  const shareAll = async () => {
    const blob = await makePoster();
    const file = new File([blob], "aaradhna-install.png", { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: SHARE_TEXT });
      } catch { /* share sheet closed */ }
    } else if (navigator.share) {
      try {
        await navigator.share({ title: "Aaradhna", text: SHARE_TEXT, url: INSTALL_URL });
      } catch { /* closed */ }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`, "_blank");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_URL);
      flash("Link copied");
    } catch {
      flash("Copy nahi hua, link ko long-press karo");
    }
  };

  const savePoster = async () => {
    const blob = await makePoster();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "aaradhna-install.png";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Sheet title="Share Aaradhna app" onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#fff", padding: 12, borderRadius: 16, display: "inline-block" }}>
          <QRCodeCanvas
            ref={qrRef}
            value={INSTALL_URL}
            size={512}
            level="M"
            marginSize={2}
            style={{ width: 240, height: 240 }}
          />
        </div>
        <p style={{ fontWeight: 700, margin: "10px 0 2px" }}>
          {INSTALL_URL.replace("https://", "")}
        </p>
        <p style={{ fontSize: 13, opacity: 0.75, margin: 0 }}>
          Samne wale se kaho camera se ye QR scan kare
        </p>
      </div>

      <ol style={{ margin: "16px 0", paddingLeft: 20, fontSize: 14, lineHeight: 1.7 }}>
        <li>Camera se QR scan karo</li>
        <li><b>Android:</b> 3 dots → Install app</li>
        <li><b>iPhone:</b> Safari mein Share → Add to Home Screen</li>
        <li>Home screen se app kholo aur register karo</li>
      </ol>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button className="smallbtn" onClick={shareAll}>Share (QR + steps)</button>
        <button className="smallbtn" onClick={copyLink}>Copy link</button>
        <button className="smallbtn" style={{ gridColumn: "1 / -1" }} onClick={savePoster}>
          Save QR poster
        </button>
      </div>
      <p role="status" aria-live="polite" style={{ textAlign: "center", fontSize: 13, minHeight: 18 }}>
        {msg}
      </p>
    </Sheet>
  );
}