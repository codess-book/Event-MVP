import { useState } from "react";

const SPONSOR = {
  name: "Shree Shubham",
  sub: "Electronic & Furniture",
  tagline: "Your Home · Our Commitment",
  logo: "/sponsors/shubham-logo.png",
  initials: "SS",
};

export default function TitleSponsorBanner() {
  // Track a failed logo in state instead of mutating the DOM by hand
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <section className="tsb" aria-label="Title sponsor">
      <span className="tsb__ribbon">👑 Title Sponsor</span>
      <div className="tsb__body">
        <div className="tsb__logo">
          {logoFailed ? (
            <span>{SPONSOR.initials}</span>
          ) : (
            <img
              src={SPONSOR.logo}
              alt={SPONSOR.name}
              onError={() => setLogoFailed(true)}
            />
          )}
        </div>
        <div className="tsb__text">
          <div className="tsb__name">{SPONSOR.name}</div>
          <div className="tsb__sub">{SPONSOR.sub}</div>
          <div className="tsb__tag">{SPONSOR.tagline}</div>
        </div>
      </div>
    </section>
  );
}