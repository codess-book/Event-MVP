import { useEffect, useMemo, useRef, useState } from "react";
import {
  Gift,
  Trophy,
  User as UserIcon,
  Sparkles,
  X,
  Check,
  Loader2,
  AlertCircle,
  Bell,
  Store,
  Heart,
} from "lucide-react";
import Sheet from "./Sheet";
import IconField from "./IconField";
import { useToast } from "./Toast";
import { useAddPrize, useEditPrize } from "../hooks/prizes/usePrizes";
import { useSponsors } from "../hooks/sponsors/useSponsors";
import "../prizes.css";

const LIMITS = { title: 80, forWhat: 60, description: 300, donorName: 60 };
const MIN_TITLE = 3;

/* ------------------------------ counter ------------------------------ */
function Counter({ value, max }) {
  const near = value.length >= max * 0.8;
  return (
    <span
      className={`psx__counter ${near ? "psx__counter--near" : ""}`}
      aria-hidden="true"
    >
      {value.length}/{max}
    </span>
  );
}

/* ------------------------------ section title ------------------------------ */
function SectionLabel({ children }) {
  return <h3 className="psx__sectionLabel">{children}</h3>;
}

/* ------------------------------ main ------------------------------ */
export default function PrizeSheet({ prize, isAdmin, onClose }) {
  const toast = useToast();
  const add = useAddPrize();
  const edit = useEditPrize();
  const { isMutating, error, reset } = prize ? edit : add;
  const { sponsors = [], isLoading: sponsorsLoading } = useSponsors();

  const isEdit = !!prize;
  const showDonor = !isEdit && isAdmin;

  const initial = useMemo(
    () => ({
      title: prize?.title || "",
      forWhat: prize?.forWhat || "",
      description: prize?.description || "",
    }),
    [prize]
  );

  const [form, setForm] = useState({ ...initial, sponsorId: "", donorName: "" });
  const [donorMode, setDonorMode] = useState("sponsor");
  const [touched, setTouched] = useState(false);
  const titleRef = useRef(null);

  /* autofocus first field */
  useEffect(() => {
    const t = setTimeout(() => titleRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, []);

  /* clear server errors on edit */
  const onChange = (e) => {
    reset();
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const switchDonorMode = (mode) => {
    reset();
    setDonorMode(mode);
    setForm((f) => ({ ...f, sponsorId: "", donorName: "" }));
  };

  /* ------------------------------ validation ------------------------------ */
  const trimmed = {
    title: form.title.trim(),
    forWhat: form.forWhat.trim(),
    description: form.description.trim(),
    donorName: form.donorName.trim(),
  };

  const problems = {};
  if (trimmed.title.length < MIN_TITLE) {
    problems.title = `Prize name needs at least ${MIN_TITLE} characters`;
  }
  if (showDonor) {
    if (donorMode === "sponsor" && !form.sponsorId)
      problems.donor = "Choose a sponsor";
    if (donorMode === "person" && !trimmed.donorName)
      problems.donor = "Enter the donor's name";
  }

  const isDirty =
    trimmed.title !== initial.title ||
    trimmed.forWhat !== initial.forWhat ||
    trimmed.description !== initial.description;

  const canSubmit =
    !isMutating && !Object.keys(problems).length && (!isEdit || isDirty);

  /* ------------------------------ submit ------------------------------ */
  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    const body = {
      title: trimmed.title,
      forWhat: trimmed.forWhat,
      description: trimmed.description,
    };
    if (showDonor) {
      if (donorMode === "sponsor") body.sponsorId = form.sponsorId;
      else body.donorName = trimmed.donorName;
    }

    try {
      if (isEdit) await edit.trigger({ id: prize.id, prize: body });
      else await add.trigger(body);

      toast(
        isEdit ? "Prize updated" : "Prize added · everyone notified",
        "success"
      );
      onClose();
    } catch {
      /* shown from `error` */
    }
  };

  /* ------------------------------ render ------------------------------ */
  return (
    <Sheet title={isEdit ? "Edit prize" : "Add a prize"} onClose={onClose}>
      <form className="psx" onSubmit={onSubmit} noValidate>
        {/* ---------- hero / intro ---------- */}
        <div className="psx__hero">
          <div className="psx__heroIcon">
            {isEdit ? <Trophy size={22} /> : <Gift size={22} />}
          </div>
          <div className="psx__heroText">
            <h2 className="psx__heroTitle">
              {isEdit ? "Update this prize" : "Announce a new prize"}
            </h2>
            <p className="psx__heroSub">
              {isEdit
                ? "Changes go live instantly for everyone."
                : "Fill in the basics. Players get notified right away."}
            </p>
          </div>
        </div>

        {/* ---------- BASIC INFO ---------- */}
        <SectionLabel>Prize details</SectionLabel>

        <div className="psx__field">
          <IconField
            icon={Gift}
            id="p-title"
            name="title"
            label="Prize name"
            placeholder="e.g. Gold coin or ₹5,000 voucher"
            maxLength={LIMITS.title}
            value={form.title}
            onChange={onChange}
            inputRef={titleRef}
            autoComplete="off"
            required
            aria-invalid={touched && !!problems.title}
          />
          <div className="psx__meta">
            <span className="psx__err" role={touched && problems.title ? "alert" : undefined}>
              {touched && problems.title}
            </span>
            <Counter value={form.title} max={LIMITS.title} />
          </div>
        </div>

        <div className="psx__field">
          <IconField
            icon={Trophy}
            id="p-for"
            name="forWhat"
            label="Awarded for (optional)"
            placeholder="e.g. Best Dressed Couple"
            maxLength={LIMITS.forWhat}
            value={form.forWhat}
            onChange={onChange}
            autoComplete="off"
          />
          <div className="psx__meta">
            <span />
            <Counter value={form.forWhat} max={LIMITS.forWhat} />
          </div>
        </div>

        <div className="psx__field">
          <div className="psx__textarea">
            <label htmlFor="p-desc" className="psx__textareaLabel">
              Details (optional)
            </label>
            <textarea
              id="p-desc"
              name="description"
              rows={3}
              maxLength={LIMITS.description}
              value={form.description}
              onChange={onChange}
              placeholder="Anything players should know about this prize"
              className="psx__textareaInput"
            />
          </div>
          <div className="psx__meta">
            <span />
            <Counter value={form.description} max={LIMITS.description} />
          </div>
        </div>

        {/* ---------- DONOR ---------- */}
        {showDonor && (
          <fieldset className="psx__donor">
            <legend className="psx__sectionLabel" style={{ padding: 0, margin: 0 }}>
              Who is giving this prize?
            </legend>

            {/* segmented toggle */}
            <div className="psx__seg" role="radiogroup" aria-label="Donor type">
              <button
                type="button"
                role="radio"
                aria-checked={donorMode === "sponsor"}
                className={`psx__segBtn ${donorMode === "sponsor" ? "is-on" : ""}`}
                onClick={() => switchDonorMode("sponsor")}
              >
                <Store size={14} /> Sponsor
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={donorMode === "person"}
                className={`psx__segBtn ${donorMode === "person" ? "is-on" : ""}`}
                onClick={() => switchDonorMode("person")}
              >
                <Heart size={14} /> Someone else
              </button>
            </div>

            {donorMode === "sponsor" ? (
              <div className="psx__selectWrap">
                <Store size={16} className="psx__selectIcon" />
                <select
                  className="psx__select"
                  name="sponsorId"
                  value={form.sponsorId}
                  onChange={onChange}
                  disabled={sponsorsLoading || !sponsors.length}
                  aria-label="Sponsor"
                >
                  <option value="">
                    {sponsorsLoading
                      ? "Loading sponsors…"
                      : sponsors.length
                      ? "Select a sponsor"
                      : "No sponsors yet"}
                  </option>
                  {sponsors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.businessName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <IconField
                icon={UserIcon}
                id="p-donor"
                name="donorName"
                label="Donor name"
                placeholder="e.g. Rajesh Patel"
                maxLength={LIMITS.donorName}
                value={form.donorName}
                onChange={onChange}
                autoComplete="off"
                required
              />
            )}

            {touched && problems.donor && (
              <p className="psx__err psx__err--block" role="alert">
                <AlertCircle size={13} /> {problems.donor}
              </p>
            )}
          </fieldset>
        )}

        {/* ---------- INFO HINT ---------- */}
        {!isEdit && (
          <div className="psx__hint">
            <Bell size={14} />
            <span>Everyone gets a notification when a new prize is added.</span>
          </div>
        )}

        {/* ---------- SERVER ERROR ---------- */}
        {error && (
          <div className="psx__serverErr" role="alert">
            <AlertCircle size={16} />
            <span>{error.message || "Something went wrong. Please try again."}</span>
          </div>
        )}

        {/* ---------- ACTIONS ---------- */}
        <div className="psx__actions">
          <button
            type="button"
            className="psx__btn psx__btn--ghost"
            onClick={onClose}
            disabled={isMutating}
          >
            <X size={15} /> Cancel
          </button>
          <button
            type="submit"
            className="psx__btn psx__btn--primary"
            disabled={!canSubmit && (isMutating || (isEdit && !isDirty))}
          >
            {isMutating ? (
              <>
                <Loader2 size={15} className="spin" /> Saving…
              </>
            ) : isEdit ? (
              <>
                <Check size={15} /> Save changes
              </>
            ) : (
              <>
                <Sparkles size={15} /> Add prize
              </>
            )}
          </button>
        </div>
      </form>
    </Sheet>
  );
}