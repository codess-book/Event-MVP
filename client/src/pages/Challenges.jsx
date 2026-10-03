// pages/Challenges.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Image as ImageIcon, Trophy, X } from "lucide-react";
import { useToast } from "../components/Toast";
import { useEvent } from "../hooks/events/useEvents"; // match your hook file name
import {
  useMyEntries,
  useWinners,
  useSubmitPhoto,
} from "../hooks/challenges/useChallenges";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import "../Lightcards.css";

const MAX_MB = 10;
const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// In-app camera for laptops/desktops (phones use the native camera app instead)
function CameraModal({ facing, onCapture, onClose }) {
  const videoRef = useRef(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let stream,
      cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) {
      setErr("Camera is not available in this browser. Please use Gallery.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() =>
        setErr(
          "Could not open the camera. Allow camera access or use Gallery.",
        ),
      );
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  const snap = () => {
    const v = videoRef.current;
    if (!v?.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    c.toBlob(
      (b) =>
        b &&
        onCapture(
          new File([b], `photo-${Date.now()}.jpg`, { type: "image/jpeg" }),
        ),
      "image/jpeg",
      0.9,
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.92)",
        zIndex: 60,
        display: "grid",
        placeItems: "center",
        padding: 12,
      }}
    >
      <div style={{ width: "100%", maxWidth: 480, textAlign: "center" }}>
        {err ? (
          <p style={{ color: "#fff" }}>{err}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              borderRadius: 14,
              background: "#000",
              transform: facing === "user" ? "scaleX(-1)" : "none",
            }}
          />
        )}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginTop: 14,
          }}
        >
          {!err && (
            <button className="a2__btn btn--sm" onClick={snap}>
              <Camera size={16} /> Capture
            </button>
          )}
          <button className="smallbtn" onClick={onClose}>
            <X size={15} /> Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Challenges() {
  const toast = useToast();
  const { items } = useEvent();
  const { entries } = useMyEntries();
  const { winners } = useWinners();
  const submit = useSubmitPhoto();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [cam, setCam] = useState(false);

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const challenge = items.find(
    (i) => i.kind === "update" && i.category === "challenge" && i.day === today,
  );
  const mine = challenge && entries.find((e) => e.challenge === challenge._id);
  const facing =
    challenge && /selfie/i.test(challenge.title) ? "user" : "environment";
  const shown = preview || mine?.photoUrl;

  const accept = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/") && !/\.hei[cf]$/i.test(f.name))
      return toast("Please choose a photo", "error");
    if (f.size > MAX_MB * 1024 * 1024)
      return toast(`Photo must be under ${MAX_MB} MB`, "error");
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };
  const pick = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    accept(f);
  };

  const upload = async () => {
    try {
      await submit.trigger({ challengeId: challenge._id, file });
      toast(mine ? "Photo replaced" : "Photo submitted. Good luck!");
      setFile(null);
      setPreview(null);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const btn = {
    cursor: "pointer",
    display: "inline-flex",
    gap: 6,
    alignItems: "center",
  };
  const light = {
    background: "#fffaf0",
    color: "#3a0d12",
    border: "1px solid #ecd9b4",
    borderRadius: 16,
    padding: 16,
  };

  return (
    <div className="pf lc">
      <div className="pf__wrap">
        <header className="sp__bar">
          <Link to="/profile" className="iconbtn" aria-label="Back">
            <ArrowLeft size={22} />
          </Link>
          <span className="sp__barTitle">Challenges</span>
          <span style={{ width: 42 }} />
        </header>

        <div className="sp__list">
          {!challenge ? (
            <p className="sheet__empty">
              Today's challenge isn't out yet. Please check back soon!
            </p>
          ) : (
            <>
              {/* Top: challenge name */}
              <div style={light}>
                <span className="badge badge--gold">TODAY'S CHALLENGE</span>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#6b0f1a",
                  }}
                >
                  {challenge.title}
                </div>
                {challenge.body && (
                  <p style={{ margin: "6px 0 0", color: "#6b5a50" }}>
                    {challenge.body}
                  </p>
                )}
              </div>

              {/* Middle: photo / camera */}
              <div style={{ ...light, textAlign: "center" }}>
                {shown ? (
                  <img
                    src={shown}
                    alt="Your entry"
                    onClick={() => setZoom(shown)}
                    style={{
                      width: "100%",
                      maxHeight: 360,
                      objectFit: "cover",
                      borderRadius: 14,
                      cursor: "zoom-in",
                    }}
                  />
                ) : (
                  <div style={{ padding: "40px 0", opacity: 0.6 }}>
                    <Camera size={44} />
                    <p style={{ margin: "8px 0 0" }}>
                      Take a photo or choose one from your gallery
                    </p>
                  </div>
                )}
                {file && (
                  <p style={{ margin: "8px 0 0", color: "#6b5a50" }}>
                    Not uploaded yet. Tap "Upload photo" below.
                  </p>
                )}
                {mine && !file && (
                  <p style={{ margin: "8px 0 0", color: "#6b5a50" }}>
                    ✅ Submitted{mine.isWinner ? " · 🏆 Winner" : ""}
                  </p>
                )}

                <div
                  className="adm__btns"
                  style={{ justifyContent: "center", marginTop: 10 }}
                >
                  {isMobile() ? (
                    <label className="smallbtn" style={btn}>
                      <Camera size={15} /> Take photo
                      <input
                        type="file"
                        accept="image/*"
                        capture={facing}
                        onChange={pick}
                        hidden
                      />
                    </label>
                  ) : (
                    <button
                      className="smallbtn"
                      style={btn}
                      onClick={() => setCam(true)}
                    >
                      <Camera size={15} /> Take photo
                    </button>
                  )}
                  <label className="smallbtn" style={btn}>
                    <ImageIcon size={15} /> Gallery
                    <input
                      type="file"
                      accept="image/*"
                      onChange={pick}
                      hidden
                    />
                  </label>
                </div>
              </div>

              {/* Bottom: upload */}
              <button
                className="a2__btn"
                disabled={!file || submit.isMutating}
                onClick={upload}
              >
                {submit.isMutating
                  ? "Uploading…"
                  : mine
                    ? "Replace photo"
                    : "Upload photo"}
              </button>
            </>
          )}

          {/* {winners.length > 0 && (
            <>
              <h2 className="pf__section">
                <Trophy size={16} /> Winners
              </h2>
              {winners.map((w) => (
                <div className="card" key={w.id}>
                  <img
                    src={w.photoUrl}
                    alt={w.title}
                    onClick={() => setZoom(w.photoUrl)}
                    style={{
                      width: "100%",
                      maxHeight: 260,
                      objectFit: "cover",
                      borderRadius: 12,
                      cursor: "zoom-in",
                    }}
                  />
                  <div className="card__name" style={{ marginTop: 8 }}>
                    {w.title}
                  </div>
                  <div className="card__meta">🏆 {w.name}</div>
                </div>
              ))}
            </>
          )} */}
        </div>

        {cam && (
          <CameraModal
            facing={facing}
            onClose={() => setCam(false)}
            onCapture={(f) => {
              setCam(false);
              accept(f);
            }}
          />
        )}

        {zoom && (
          <div
            onClick={() => setZoom(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.9)",
              display: "grid",
              placeItems: "center",
              zIndex: 50,
              padding: 12,
            }}
          >
            <img
              src={zoom}
              alt="Full size"
              style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 8 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
