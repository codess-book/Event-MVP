import { useEffect, useState } from "react";

// Shows the photo, or the first letter of the name if there is no photo
export default function Avatar({ user, className = "pf__avatar" }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [user.photoUrl]);

  const showImg = user.photoUrl && !broken;

  return (
    <div className={`avatar ${className}`} aria-hidden="true">
      {showImg ? (
        <img
          src={user.photoUrl}
          alt=""
          className="avatar__img"
          onError={() => setBroken(true)}
          loading="lazy"
          draggable={false}
        />
      ) : (
        <span className="avatar__initial">
          {user.name?.[0]?.toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}