import "./Ticker.css";

// items = [{ text: "Aaradhna Couple Garba 2026", href?: "https://..." }, ...]  (plain strings also work)
// Full-width strip. Scrolls right to left in a seamless loop and pauses while touched or hovered.
export default function Ticker({ items = [], speed = 38 }) {
  const list = items
    .map((i) => (typeof i === "string" ? { text: i } : i))
    .filter((i) => i && i.text);

  if (!list.length) return null;

  // Duration grows with text length so the speed feels the same for any number of items
  const chars = list.reduce((n, i) => n + i.text.length + 6, 0);
  const seconds = Math.max(14, Math.round((chars * 9) / speed));

  const group = (hidden) => (
    <ul className="tk__group" aria-hidden={hidden || undefined}>
      {list.map((i, idx) => (
        <li className="tk__item" key={`${i.text}-${idx}`}>
          {i.href ? (
            <a href={i.href} target="_blank" rel="noopener noreferrer" tabIndex={hidden ? -1 : undefined}>
              {i.text}
            </a>
          ) : (
            <span>{i.text}</span>
          )}
          <i className="tk__dot" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="tk" role="region" aria-label="Announcements">
      <div className="tk__view">
        <div className="tk__track" style={{ "--tk-dur": `${seconds}s` }}>
          {group(false)}
          {/* Second copy makes the loop seamless */}
          {group(true)}
        </div>
      </div>
    </div>
  );
}