import { useEffect, useState } from "react";

// Shows the photo, or the first letter of the name if there is no photo
export default function Avatar({ user, className = "pf__avatar" }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [user.photoUrl]);

  return (
    <div className={className} aria-hidden="true">
      {user.photoUrl && !broken ? (
        <img src={user.photoUrl} alt="" onError={() => setBroken(true)} />
      ) : (
        user.name?.[0]?.toUpperCase()
      )}
    </div>
  );
}