// pages/AdminFoodPartners.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User as UserIcon,
  Phone,
  Lock,
  Store,
  MapPin,
  Check,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UtensilsCrossed,
  Eye,
  EyeOff,
} from "lucide-react";
import IconField from "../components/IconField";
import BottomNav from "../components/BottomNav";
import { useToast } from "../components/Toast";
import { useCreateFoodPartner } from "../hooks/food/useFood";
import "../auth.css";
import "../profile.css";
import "../food.css";
import "../admin-food-partners.css";

const EMPTY = {
  name: "",
  phone: "",
  password: "",
  businessName: "",
  stallNumber: "",
};

/* ------------------------------ success card ------------------------------ */
function CreatedCard({ created, onDismiss }) {
  const [copied, setCopied] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const copyAll = async () => {
    const text = `Stall: ${created.stall}\nLogin: ${created.phone}\nPassword: ${created.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="afp__success">
      <div className="afp__successGlow" aria-hidden="true" />

      <div className="afp__successHead">
        <div className="afp__successIcon">
          <CheckCircle2 size={22} />
        </div>
        <div className="afp__successTitleBox">
          <h3 className="afp__successTitle">Account created</h3>
          <p className="afp__successSub">{created.stall} is ready to log in</p>
        </div>
      </div>

      <div className="afp__credList">
        <div className="afp__credRow">
          <span className="afp__credKey">Login (phone)</span>
          <span className="afp__credVal">{created.phone}</span>
        </div>

        <div className="afp__credRow">
          <span className="afp__credKey">Password</span>
          <div className="afp__credValRow">
            <span className="afp__credVal afp__credVal--pass">
              {showPass
                ? created.password
                : "•".repeat(created.password.length)}
            </span>
            <button
              type="button"
              className="afp__eyeBtn"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>

      <p className="afp__successNote">
        <AlertCircle size={13} />
        Share this with the stall owner now — it won't be shown again.
      </p>

      <div className="afp__successActions">
        <button
          type="button"
          className="afp__successBtn afp__successBtn--primary"
          onClick={copyAll}
        >
          {copied ? (
            <>
              <CheckCircle2 size={15} /> Copied!
            </>
          ) : (
            <>
              <Copy size={15} /> Copy credentials
            </>
          )}
        </button>
        <button
          type="button"
          className="afp__successBtn afp__successBtn--ghost"
          onClick={onDismiss}
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ main ------------------------------ */
export default function AdminFoodPartners() {
  const toast = useToast();
  const create = useCreateFoodPartner();
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState("");
  const [created, setCreated] = useState(null);

  const set = (k, clean) => (e) =>
    setF((s) => ({
      ...s,
      [k]: clean ? clean(e.target.value) : e.target.value,
    }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (f.name.trim().length < 2) return setErr("Enter owner name");
    if (!/^\d{10}$/.test(f.phone)) return setErr("Phone must be 10 digits");
    if (f.password.length < 8)
      return setErr("Password must be at least 8 characters");
    if (f.businessName.trim().length < 2) return setErr("Enter stall name");

    try {
      await create.trigger({
        name: f.name.trim(),
        phone: f.phone,
        password: f.password,
        businessName: f.businessName.trim(),
        stallNumber: f.stallNumber.trim(),
      });
      setCreated({
        phone: f.phone,
        password: f.password,
        stall: f.businessName.trim(),
      });
      setF(EMPTY);
      toast("Food partner created", "success");
    } catch (ex) {
      setErr(ex.message || "Could not create account");
    }
  };

  return (
    <div className="pf">
      <div className="pf__wrap">
        <div className="afp">
          {/* ---------- HEADER ---------- */}
          <header className="afp__header">
            <Link to="/profile" className="afp__backBtn" aria-label="Back">
              <ArrowLeft size={20} strokeWidth={2.4} />
            </Link>

            <div className="afp__headerCenter">
              <span className="afp__headerEyebrow">
                <ShieldCheck size={11} />
                Admin · Food
              </span>
              <h1 className="afp__headerTitle">Add food partner</h1>
            </div>

            <span style={{ width: 42 }} />
          </header>

          {/* ---------- INTRO ---------- */}
          <div className="afp__intro">
            <div className="afp__introIcon">
              <UtensilsCrossed size={20} />
            </div>
            <div className="afp__introText">
              <p>
                Create a login for a food stall. They fill the menu themselves.
              </p>
            </div>
          </div>

          {/* ---------- SUCCESS ---------- */}
          {created && (
            <CreatedCard created={created} onDismiss={() => setCreated(null)} />
          )}

          {/* ---------- FORM ---------- */}
          <form className="afp__form" onSubmit={submit} noValidate>
            <section className="afp__section">
              <h3 className="afp__sectionLabel">
                <span className="afp__sectionBar" />
                Owner details
              </h3>

              <IconField
                icon={UserIcon}
                id="fp-name"
                label="Owner name"
                value={f.name}
                onChange={set("name")}
                maxLength={60}
                autoComplete="name"
                disabled={create.isMutating}
              />

              <IconField
                icon={Phone}
                id="fp-phone"
                label="Phone (login)"
                inputMode="numeric"
                maxLength={10}
                value={f.phone}
                onChange={set("phone", (v) => v.replace(/\D/g, ""))}
                autoComplete="tel"
                disabled={create.isMutating}
              />
            </section>

            <section className="afp__section">
              <h3 className="afp__sectionLabel">
                <span className="afp__sectionBar" />
                Stall details
              </h3>

              <IconField
                icon={Store}
                id="fp-biz"
                label="Stall name"
                value={f.businessName}
                onChange={set("businessName")}
                maxLength={80}
                disabled={create.isMutating}
              />

              <IconField
                icon={MapPin}
                id="fp-no"
                label="Stall number (optional)"
                value={f.stallNumber}
                onChange={set("stallNumber")}
                maxLength={10}
                disabled={create.isMutating}
              />
            </section>

            <section className="afp__section">
              <h3 className="afp__sectionLabel">
                <span className="afp__sectionBar" />
                Login credentials
              </h3>

              <IconField
                icon={Lock}
                id="fp-pass"
                label="Temporary password"
                value={f.password}
                onChange={set("password")}
                maxLength={72}
                autoComplete="new-password"
                disabled={create.isMutating}
              />

              <div className="afp__hint">
                <Sparkles size={12} />
                <span>
                  Minimum 8 characters. Share it with the stall owner after
                  creating.
                </span>
              </div>
            </section>

            {/* error */}
            {err && (
              <div className="afp__err" role="alert">
                <AlertCircle size={16} />
                <span>{err}</span>
              </div>
            )}

            {/* submit */}
            <button
              type="submit"
              className="afp__submit"
              disabled={create.isMutating}
            >
              {create.isMutating ? (
                <>
                  <Loader2 size={16} className="spin" /> Creating…
                </>
              ) : (
                <>
                  <Check size={16} /> Create account
                </>
              )}
            </button>
          </form>

          <div className="pf__spacer" />
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
