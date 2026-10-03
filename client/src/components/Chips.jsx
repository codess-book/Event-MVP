export default function Chips({ label, options, value, onChange }) {
  return (
    <div>
      <p className="chips-label">{label}</p>
      <div className="chips" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="chip"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}