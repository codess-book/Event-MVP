// pages/Challenges.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Trophy,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ZoomIn,
  Crown,
} from "lucide-react";
import { useToast } from "../components/Toast";
import { useEvent } from "../hooks/events/useEvents";
import {
  useMyEntries,
  useWinners,
  useSubmitPhoto,
} from "../hooks/challenges/useChallenges";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import "../Lightcards.css";
import "../challenges.css";

const MAX_MB = 10;
const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/* ------------------------------ camera modal ------------------------------ */
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
          "Could not open the camera. Allow camera access or use Gallery."
        )
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
          new File([b], `photo-${Date.now()}.jpg`, { type: "image/jpeg" })
        ),
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="chx__camBackdrop">
      <div className="chx__camBox">
        {err ? (
          <div className="chx__camErr">
            <AlertCircle size={20} />
            <p>{err}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="chx__camVideo"
            style={{ transform: facing === "user" ? "scaleX(-1)" : "none" }}
          />
        )}

        <div className="chx__camActions">
          {!err && (
            <button
              type="button"
              className="chx__btn chx__btn--primary"
              onClick={snap}
            >
              <Camera size={16} /> Capture
            </button>
          )}
          <button
            type="button"
            className="chx__btn chx__btn--ghost"
            onClick={onClose}
          >
            <X size={16} /> Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ main ------------------------------ */
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
    (i) =>
      i.kind === "update" && i.category === "challenge" && i.day === today
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

  return (
    <div className="pf">
      <div className="pf__wrap">
        {/* ---------- top bar ---------- */}
        <header className="chx__bar">
          <Link to="/profile" className="chx__iconBtn" aria-label="Back">
            <ArrowLeft size={20} />
          </Link>
          <span className="chx__barTitle">Challenges</span>
          <span style={{ width: 40 }} />
        </header>

        <div className="chx__body">
          {!challenge ? (
            <div className="chx__empty">
              <div className="chx__emptyIcon">
                <Camera size={28} />
              </div>
              <h3 className="chx__emptyTitle">No challenge yet</h3>
              <p className="chx__emptyText">
                Today's challenge isn't out yet. Please check back soon!
              </p>
            </div>
          ) : (
            <>
              {/* ---------- CHALLENGE INFO ---------- */}
              <section className="chx__hero">
                <div className="chx__heroGlow" aria-hidden="true" />

                <div className="chx__badge">
                  <Sparkles size={12} />
                  <span>Today's Challenge</span>
                </div>

                <h1 className="chx__title">{challenge.title}</h1>

                {challenge.body && (
                  <p className="chx__desc">{challenge.body}</p>
                )}
              </section>

              {/* ---------- PHOTO CARD ---------- */}
              <section className="chx__photoCard">
                {shown ? (
                  <button
                    type="button"
                    className="chx__photoBtn"
                    onClick={() => setZoom(shown)}
                    aria-label="View full size"
                  >
                    <img src={shown} alt="Your entry" className="chx__photo" />
                    <span className="chx__zoomHint">
                      <ZoomIn size={14} /> Tap to zoom
                    </span>
                  </button>
                ) : (
                  <div className="chx__placeholder">
                    <div className="chx__placeholderIcon">
                      <Camera size={36} />
                    </div>
                    <p className="chx__placeholderText">
                      Take a photo or choose one from your gallery
                    </p>
                  </div>
                )}

                {file && (
                  <div className="chx__status chx__status--pending">
                    <AlertCircle size={14} />
                    <span>Not uploaded yet. Tap "Upload photo" below.</span>
                  </div>
                )}
                {mine && !file && (
                  <div className="chx__status chx__status--done">
                    <CheckCircle2 size={14} />
                    <span>
                      Submitted
                      {mine.isWinner && (
                        <>
                          {" · "}
                          <Crown size={12} /> Winner
                        </>
                      )}
                    </span>
                  </div>
                )}
              </section>

              {/* ---------- ACTIONS ---------- */}
              <section className="chx__actions">
                {isMobile() ? (
                  <label className="chx__actionBtn">
                    <Camera size={16} />
                    <span>Take photo</span>
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
                    type="button"
                    className="chx__actionBtn"
                    onClick={() => setCam(true)}
                  >
                    <Camera size={16} />
                    <span>Take photo</span>
                  </button>
                )}

                <label className="chx__actionBtn">
                  <ImageIcon size={16} />
                  <span>Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={pick}
                    hidden
                  />
                </label>
              </section>

              {/* ---------- UPLOAD ---------- */}
              <button
                type="button"
                className="chx__uploadBtn"
                disabled={!file || submit.isMutating}
                onClick={upload}
              >
                {submit.isMutating ? (
                  <>
                    <Loader2 size={16} className="spin" /> Uploading…
                  </>
                ) : mine ? (
                  <>
                    <Sparkles size={16} /> Replace photo
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Upload photo
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* ---------- CAMERA ---------- */}
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

        {/* ---------- ZOOM ---------- */}
        {zoom && (
          <div
            className="chx__zoomBackdrop"
            onClick={() => setZoom(null)}
            role="dialog"
            aria-label="Photo preview"
          >
            <button
              type="button"
              className="chx__zoomClose"
              onClick={() => setZoom(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <img src={zoom} alt="Full size" className="chx__zoomImg" />
          </div>
        )}
      </div>
    </div>
  );
}