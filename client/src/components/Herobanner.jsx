import "./HeroBanner.css";

// Soft mandala drawn behind the text: 12 petals plus rings
function Mandala() {
  return (
    <svg className="hb__mandala" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} cx="100" cy="52" rx="11" ry="38" transform={`rotate(${i * 30} 100 100)`} />
        ))}
        <circle cx="100" cy="100" r="22" />
        <circle cx="100" cy="100" r="62" />
        <circle cx="100" cy="100" r="96" />
      </g>
    </svg>
  );
}

// `sponsor` = { name, logoUrl, href? } or null.
// Leave it null until a sponsor takes the slot; the banner then shows only the event name.
export default function HeroBanner({ sponsor = null }) {
  const presented = sponsor && (
    <>
      <span className="hb__by">Presented by</span>
      {sponsor.logoUrl ? (
        <img className="hb__logo" src={sponsor.logoUrl} alt={sponsor.name} loading="lazy" />
      ) : (
        <span className="hb__sname">{sponsor.name}</span>
      )}
    </>
  );

  return (
    <section className="hb" aria-label="Aaradhna Couple Garba 2026">
      <Mandala />

      <p className="hb__greet">🙏 जय माता दी</p>
      <h2 className="hb__name">Aaradhna</h2>
      <p className="hb__sub">Couple Garba 2026</p>

      <div className="hb__rule" aria-hidden="true">
        <span />
        <i />
        <span />
      </div>

      {sponsor &&
        (sponsor.href ? (
          <a className="hb__sponsor" href={sponsor.href} target="_blank" rel="noopener noreferrer">
            {presented}
          </a>
        ) : (
          <div className="hb__sponsor">{presented}</div>
        ))}
    </section>
  );
}