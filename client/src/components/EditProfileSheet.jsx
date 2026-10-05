import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  User as UserIcon,
  Store,
  Camera,
  Trash2,
  MapPin,
  Link2,
  Globe,
  MessageCircle,
  X,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Sheet from "./Sheet";
import Avatar from "./Avatar";
import IconField from "./IconField";
import { useUploadPhoto, useUpdateProfile } from "../hooks/profile/userProfile";
import { FaInstagram, FaFacebook, FaYoutube } from "react-icons/fa";
import "./edit.css";
/* ------------------------------- constants ------------------------------- */
const MAX_PHOTO_MB = 5;
const URL_RE = /^https?:\/\/.+\..+/i;
const PHONE_RE = /^\d{10,15}$/;

/* ------------------------------- validators ------------------------------ */
function validate({ name, isSponsor, businessName, mapLink, links }) {
  const e = {};
  if (!name?.trim()) e.name = "Name is required";
  else if (name.trim().length < 2) e.name = "Name is too short";
  else if (name.trim().length > 60) e.name = "Name is too long";

  if (isSponsor) {
    if (!businessName?.trim()) e.businessName = "Business name is required";
    else if (businessName.trim().length < 2) e.businessName = "Too short";

    if (mapLink && !URL_RE.test(mapLink.trim()))
      e.mapLink = "Enter a valid URL (https://…)";
    if (links.website && !URL_RE.test(links.website.trim()))
      e.website = "Enter a valid URL (https://…)";
    if (links.whatsapp && !PHONE_RE.test(links.whatsapp))
      e.whatsapp = "Enter 10–15 digit number";
  }
  return e;
}

export default function EditProfileSheet({ user, onClose }) {
  const fileRef = useRef(null);
  const save = useUpdateProfile();
  const upload = useUploadPhoto();
  const busy = save.isMutating || upload.isMutating;
  const error = upload.error || save.error;

  const isSponsor = user?.userType === "sponsor";

  /* ------------------------------- form state ------------------------------ */
  const [name, setName] = useState(user?.name ?? "");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [mapLink, setMapLink] = useState(user?.mapLink ?? "");
  const [links, setLinks] = useState({
    website: user?.links?.website ?? "",
    instagram: user?.links?.instagram ?? "",
    facebook: user?.links?.facebook ?? "",
    youtube: user?.links?.youtube ?? "",
    whatsapp: user?.links?.whatsapp ?? "",
  });

  /* --------------------------------- ui state ------------------------------ */
  const [touched, setTouched] = useState({});
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState(null);

  /* ------------------------------ derived state ---------------------------- */
  const errors = useMemo(
    () => validate({ name, isSponsor, businessName, mapLink, links }),
    [name, isSponsor, businessName, mapLink, links]
  );
  const hasErrors = Object.keys(errors).length > 0;

  const clearErrors = useCallback(() => {
    save.reset?.();
    upload.reset?.();
  }, [save, upload]);

  /* ----------------------------- side effects ------------------------------ */
  // Esc to close
  const handleClose = useCallback(() => {
    if (busy) return;
    onClose?.();
  }, [busy, onClose]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  /* -------------------------------- handlers ------------------------------- */
  const setLink = (key) => (e) => {
    clearErrors();
    const value =
      key === "whatsapp" ? e.target.value.replace(/\D/g, "") : e.target.value;
    setLinks((l) => ({ ...l, [key]: value }));
  };

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", message: "Only image files allowed" });
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setToast({ type: "error", message: `Max ${MAX_PHOTO_MB}MB allowed` });
      return;
    }

    clearErrors();

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      await upload.trigger(file);
      setToast({ type: "success", message: "Photo updated" });
    } catch (err) {
      setPreview(null);
      setToast({ type: "error", message: err?.message || "Upload failed" });
    }
  };

  const onRemove = async () => {
    clearErrors();
    setPreview(null);
    try {
      await upload.trigger(null);
      setToast({ type: "success", message: "Photo removed" });
    } catch (err) {
      setToast({ type: "error", message: err?.message || "Could not remove" });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

    setTouched({
      name: true,
      businessName: true,
      mapLink: true,
      website: true,
      whatsapp: true,
    });

    if (hasErrors) {
      setToast({ type: "error", message: "Please fix highlighted fields" });
      return;
    }

    try {
      const payload = isSponsor
        ? {
            name: name.trim(),
            businessName: businessName.trim(),
            address: address.trim(),
            mapLink: mapLink.trim(),
            links,
          }
        : { name: name.trim() };

      await save.trigger(payload);
      setToast({ type: "success", message: "Profile saved" });
      setTimeout(() => onClose?.(), 500);
    } catch (err) {
      setToast({
        type: "error",
        message: err?.message || "Could not save changes",
      });
    }
  };

  const avatarSrc = preview || user?.photoUrl;

  /* --------------------------------- render -------------------------------- */
  return (
    <Sheet title="Edit profile" onClose={handleClose}>
      {toast && (
        <div className={`eps__toast eps__toast--${toast.type}`} role="status">
          {toast.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* -------- photo -------- */}
      <div className="photoedit">
        <div className="photoedit__pic">
          <div className="photoedit__ring">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="photoedit__avatar" />
            ) : (
              <Avatar user={user} className="pf__avatar" />
            )}
          </div>

          <button
            type="button"
            className="photoedit__fab"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            aria-label={user?.photoUrl ? "Change photo" : "Add photo"}
          >
            {upload.isMutating ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <Camera size={16} />
            )}
          </button>
        </div>

        <div className="photoedit__btns">
          <button
            type="button"
            className="smallbtn"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            <Camera size={16} /> {user?.photoUrl ? "Change" : "Add photo"}
          </button>
          {(user?.photoUrl || preview) && (
            <button
              type="button"
              className="smallbtn smallbtn--danger"
              disabled={busy}
              onClick={onRemove}
            >
              <Trash2 size={16} /> Remove
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={onPick}
        />
      </div>

      {/* -------- form -------- */}
      <form className="sheet__form" onSubmit={onSubmit} noValidate>
        <IconField
          icon={UserIcon}
          id="e-name"
          label="Full Name"
          value={name}
          onChange={(e) => { clearErrors(); setName(e.target.value); }}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          error={touched.name && errors.name}
          maxLength={60}
          autoComplete="name"
          disabled={busy}
          required
        />

        {isSponsor && (
          <>
            <IconField
              icon={Store}
              id="e-biz"
              label="Shop / Business Name"
              value={businessName}
              onChange={(e) => { clearErrors(); setBusinessName(e.target.value); }}
              onBlur={() => setTouched((t) => ({ ...t, businessName: true }))}
              error={touched.businessName && errors.businessName}
              maxLength={80}
              autoComplete="organization"
              disabled={busy}
              required
            />
            <IconField
              icon={MapPin}
              id="e-addr"
              label="Shop address"
              placeholder="Shop no, area, city"
              maxLength={200}
              value={address}
              onChange={(e) => { clearErrors(); setAddress(e.target.value); }}
              autoComplete="street-address"
              disabled={busy}
            />
            <IconField
              icon={Link2}
              id="e-map"
              label="Google Maps link (optional)"
              placeholder="https://maps.app.goo.gl/..."
              maxLength={300}
              value={mapLink}
              onChange={(e) => { clearErrors(); setMapLink(e.target.value); }}
              onBlur={() => setTouched((t) => ({ ...t, mapLink: true }))}
              error={touched.mapLink && errors.mapLink}
              inputMode="url"
              disabled={busy}
            />
            <IconField
              icon={Globe}
              id="e-web"
              label="Website (optional)"
              placeholder="https://www.myshop.com"
              maxLength={200}
              value={links.website}
              onChange={setLink("website")}
              onBlur={() => setTouched((t) => ({ ...t, website: true }))}
              error={touched.website && errors.website}
              inputMode="url"
              disabled={busy}
            />
            <IconField
              icon={FaInstagram}
              id="e-ig"
              label="Instagram link (optional)"
              placeholder="https://instagram.com/myshop"
              maxLength={200}
              value={links.instagram}
              onChange={setLink("instagram")}
              disabled={busy}
            />
            <IconField
              icon={FaFacebook}
              id="e-fb"
              label="Facebook link (optional)"
              placeholder="https://facebook.com/myshop"
              maxLength={200}
              value={links.facebook}
              onChange={setLink("facebook")}
              disabled={busy}
            />
            <IconField
              icon={FaYoutube}
              id="e-yt"
              label="YouTube link (optional)"
              placeholder="https://youtube.com/@myshop"
              maxLength={200}
              value={links.youtube}
              onChange={setLink("youtube")}
              disabled={busy}
            />
            <IconField
              icon={MessageCircle}
              id="e-wa"
              label="WhatsApp number (optional)"
              placeholder="10-digit number"
              inputMode="numeric"
              maxLength={15}
              value={links.whatsapp}
              onChange={setLink("whatsapp")}
              onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))}
              error={touched.whatsapp && errors.whatsapp}
              disabled={busy}
            />
          </>
        )}

        {error && (
          <div className="a2__err" role="alert">
            <AlertCircle size={16} />
            <span>{error.message || "Something went wrong."}</span>
          </div>
        )}

        {/* -------- actions -------- */}
        <div className="eps__actions">
          <button
            type="button"
            className="eps__btn eps__btn--ghost"
            onClick={handleClose}
            disabled={busy}
          >
            <X size={16} /> Cancel
          </button>
          <button
            type="submit"
            className="eps__btn eps__btn--primary"
            disabled={busy}
          >
            {save.isMutating ? (
              <>
                <Loader2 size={16} className="spin" /> Saving…
              </>
            ) : (
              <>
                <Check size={16} /> Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </Sheet>
  );
}