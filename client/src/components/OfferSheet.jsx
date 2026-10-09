import { useMemo, useState } from "react";
import { Tag, Ticket, CalendarDays } from "lucide-react";
import Sheet from "./Sheet";
import IconField from "./IconField";
import { useAddOffer, useEditOffer } from "../hooks/profile/useOffers";
import { useToast } from "./Toast";
import "./offer-sheet.css";

const TZ = "Asia/Kolkata";
const TITLE_MAX = 80;
const DESC_MAX = 300;
const CODE_RE = /^[A-Z0-9_-]*$/;

// "2026-10-20" in IST, which is what <input type="date"> expects
const toDateInput = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ }) : "";

const todayIST = () => new Date().toLocaleDateString("en-CA", { timeZone: TZ });

const addDays = (ymd, n) => {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const prettyDate = (ymd) =>
  new Date(`${ymd}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  });

// Quick picks so a sponsor does not have to open the calendar
const QUICK = [
  { label: "Today", days: 0 },
  { label: "3 days", days: 3 },
  { label: "1 week", days: 7 },
  { label: "1 month", days: 30 },
];

// Returns { field: message } for anything the sponsor must fix
function validate(form, isEdit, original) {
  const errs = {};
  const title = form.title.trim();
  if (title.length < 3) errs.title = "Title must be at least 3 characters";
  if (form.code && !CODE_RE.test(form.code))
    errs.code = "Use only letters, numbers, - and _";
  // Editing an already-expired offer is fine as long as the date is untouched
  const dateChanged = !isEdit || form.validTill !== original.validTill;
  if (form.validTill && dateChanged && form.validTill < todayIST())
    errs.validTill = "Date cannot be in the past";
  return errs;
}

// `offer` is null when adding a new one
export default function OfferSheet({ offer, onClose }) {
  const add = useAddOffer();
  const edit = useEditOffer();
  const { isMutating, error, reset } = offer ? edit : add;
  const toast = useToast();

  const original = useMemo(
    () => ({
      title: offer?.title || "",
      description: offer?.description || "",
      code: offer?.code || "",
      validTill: toDateInput(offer?.validTill),
    }),
    [offer],
  );
  const [form, setForm] = useState(original);
  const [touched, setTouched] = useState({});

  const errs = validate(form, !!offer, original);
  const dirty = JSON.stringify(form) !== JSON.stringify(original);
  const canSubmit = !isMutating && (!offer || dirty);

  const set = (name, value) => {
    reset();
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === "code") value = value.toUpperCase().replace(/\s+/g, "");
    set(name, value);
  };
  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));
  const show = (name) => touched[name] && errs[name];

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isMutating) return;
    if (Object.keys(errs).length) {
      setTouched({ title: true, code: true, validTill: true });
      return;
    }
    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      code: form.code.trim(),
    };
    try {
      if (offer) await edit.trigger({ id: offer.id, offer: payload });
      else await add.trigger(payload);
      toast(offer ? "Offer updated" : "Offer added");
      onClose();
    } catch {
      /* shown from `error` */
    }
  };

  const today = todayIST();
  const expired = !!form.validTill && form.validTill < today;

  return (
    <Sheet title={offer ? "Edit offer" : "Add an offer"} onClose={onClose}>
      <form className="sheet__form os" onSubmit={onSubmit} noValidate>
        {/* Live preview: shows exactly what visitors will see */}
        <section className="os-ticket" aria-label="Offer preview">
          <div className="os-ticket__main">
            <p className="os-ticket__title">
              {form.title.trim() || "Your offer title"}
            </p>
            <p className="os-ticket__desc">
              {form.description.trim() ||
                "Add a short description so visitors know how to claim it."}
            </p>
          </div>
          <div className="os-ticket__side">
            <span className="os-ticket__code">{form.code || "NO CODE"}</span>
            <span className={`os-ticket__valid${expired ? " is-expired" : ""}`}>
              {form.validTill
                ? `${expired ? "Expired" : "Valid till"} ${prettyDate(form.validTill)}`
                : "No expiry"}
            </span>
          </div>
        </section>

        <div className="os-field">
          <IconField
            icon={Tag}
            id="o-title"
            name="title"
            label="Offer title"
            placeholder="e.g. Flat 10% off on pre-wedding shoots"
            maxLength={TITLE_MAX}
            value={form.title}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={!!show("title")}
            aria-describedby="o-title-help"
            autoFocus={!offer}
            required
          />
          <div className="os-help" id="o-title-help">
            <span className={show("title") ? "os-help__err" : ""}>
              {show("title") || "Keep it short and specific"}
            </span>
            <span className="os-count">
              {form.title.length}/{TITLE_MAX}
            </span>
          </div>
        </div>

        <div className="os-field">
          <div className="f2 f2--area">
            <div className="f2__body">
              <label htmlFor="o-desc">Description (optional)</label>
              <textarea
                id="o-desc"
                name="description"
                rows={3}
                maxLength={DESC_MAX}
                placeholder="Show your Aaradhna pass at the counter"
                value={form.description}
                onChange={onChange}
                aria-describedby="o-desc-help"
              />
            </div>
          </div>
          <div className="os-help" id="o-desc-help">
            <span>How can visitors claim this offer?</span>
            <span className="os-count">
              {form.description.length}/{DESC_MAX}
            </span>
          </div>
        </div>

        <div className="os-field">
          <IconField
            icon={Ticket}
            id="o-code"
            name="code"
            label="Offer code (optional)"
            placeholder="e.g. GARBA10"
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={20}
            value={form.code}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={!!show("code")}
            aria-describedby="o-code-help"
          />
          <div className="os-help" id="o-code-help">
            <span className={show("code") ? "os-help__err" : ""}>
              {show("code") || "Letters and numbers only. Shown in capitals."}
            </span>
          </div>
        </div>

        <div className="os-field">
          <IconField
            icon={CalendarDays}
            id="o-date"
            name="validTill"
            label="Valid till (optional)"
            type="date"
            min={offer ? undefined : today}
            value={form.validTill}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={!!show("validTill")}
            aria-describedby="o-date-help"
          />
          <div className="os-chips" role="group" aria-label="Quick validity">
            {QUICK.map((q) => {
              const v = addDays(today, q.days);
              return (
                <button
                  key={q.label}
                  type="button"
                  className={`os-chip${form.validTill === v ? " is-on" : ""}`}
                  aria-pressed={form.validTill === v}
                  onClick={() => set("validTill", v)}
                >
                  {q.label}
                </button>
              );
            })}
            {form.validTill && (
              <button
                type="button"
                className="os-chip os-chip--clear"
                onClick={() => set("validTill", "")}
              >
                No expiry
              </button>
            )}
          </div>
          <div className="os-help" id="o-date-help">
            <span className={show("validTill") ? "os-help__err" : ""}>
              {show("validTill") || "Leave empty if the offer never expires"}
            </span>
          </div>
        </div>

        {error && (
          <div className="a2__err" role="alert">
            {error.message}
          </div>
        )}

        <div className="os-actions">
          <button
            type="button"
            className="os-btn os-btn--ghost"
            onClick={onClose}
            disabled={isMutating}
          >
            Cancel
          </button>
          <button
            className="a2__btn os-btn os-btn--primary"
            disabled={!canSubmit}
          >
            {isMutating ? "Saving…" : offer ? "Save changes" : "Add offer"}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
