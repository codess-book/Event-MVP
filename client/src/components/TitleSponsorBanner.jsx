const SPONSOR = {
  name: "Shree Shubham",
  sub: "Electronic & Furniture",
  tagline: "Your Home · Our Commitment",
  logo: "/sponsors/shubham-logo.png",
};

export default function TitleSponsorBanner() {
  return (
    <section className="tsb" aria-label="Title sponsor">
      <span className="tsb__ribbon">👑 Title Sponsor</span>
      <div className="tsb__body">
        <div className="tsb__logo">
          <img
            src={SPONSOR.logo}
            alt={SPONSOR.name}
            onError={(e) => {
              e.currentTarget.replaceWith(Object.assign(document.createElement("span"), { textContent: "SS" }));
            }}
          />
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