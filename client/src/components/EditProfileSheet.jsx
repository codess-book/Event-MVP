import { useRef, useState } from "react";
import { User as UserIcon, Store, Camera, Trash2 } from "lucide-react";
import Sheet from "./Sheet";
import Avatar from "./Avatar";
import IconField from "./IconField";
import { useUploadPhoto, useUpdateProfile } from "../hooks/profile/userProfile";
import { MapPin, Link2 } from "lucide-react";

export default function EditProfileSheet({ user, onClose }) {
  const fileRef = useRef(null);
  const save = useUpdateProfile();
  const upload = useUploadPhoto();
  const [name, setName] = useState(user.name);
  const [businessName, setBusinessName] = useState(user.businessName || "");
  const isSponsor = user.userType === "sponsor";
  const busy = save.isMutating || upload.isMutating;
  const error = upload.error || save.error;
  const [address, setAddress] = useState(user.address || "");
  const [mapLink, setMapLink] = useState(user.mapLink || "");

  const clearErrors = () => {
    save.reset();
    upload.reset();
  };

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be picked again
    if (!file) return;
    clearErrors();
    try {
      await upload.trigger(file);
    } catch {
      /* shown from `error` */
    }
  };

  const onRemove = async () => {
    clearErrors();
    try {
      await save.trigger({ photoUrl: null });
    } catch {
      /* shown from `error` */
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await save.trigger(
        isSponsor ? { name, businessName, address, mapLink } : { name },
      );

      onClose();
    } catch {
      /* shown from `error` */
    }
  };

  return (
    <Sheet title="Edit profile" onClose={onClose}>
      <div className="photoedit">
        <div className={`photoedit__pic ${upload.isMutating ? "is-busy" : ""}`}>
          <Avatar user={user} className="pf__avatar" />
          {upload.isMutating && <span className="spinner" />}
        </div>
        <div className="photoedit__btns">
          <button
            type="button"
            className="smallbtn"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            <Camera size={16} /> {user.photoUrl ? "Change photo" : "Add photo"}
          </button>
          {user.photoUrl && (
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

      <form className="sheet__form" onSubmit={onSubmit}>
        <IconField
          icon={UserIcon}
          id="e-name"
          label="Full Name"
          value={name}
          onChange={(e) => {
            clearErrors();
            setName(e.target.value);
          }}
          required
        />
        {isSponsor && (
          <IconField
            icon={Store}
            id="e-biz"
            label="Shop / Business Name"
            value={businessName}
            onChange={(e) => {
              clearErrors();
              setBusinessName(e.target.value);
            }}
            required
          />
        )}
        {isSponsor && (
          <>
            <IconField
              icon={MapPin}
              id="e-addr"
              label="Shop address"
              placeholder="Shop no, area, city"
              maxLength={200}
              value={address}
              onChange={(e) => {
                clearErrors();
                setAddress(e.target.value);
              }}
            />
            <IconField
              icon={Link2}
              id="e-map"
              label="Google Maps link (optional)"
              placeholder="https://maps.app.goo.gl/..."
              maxLength={300}
              value={mapLink}
              onChange={(e) => {
                clearErrors();
                setMapLink(e.target.value);
              }}
            />
          </>
        )}
        {error && (
          <div className="a2__err" role="alert">
            {error.message}
          </div>
        )}
        <button className="a2__btn" disabled={busy}>
          {save.isMutating ? "Saving…" : "Save changes"}
        </button>
      </form>
    </Sheet>
  );
}
