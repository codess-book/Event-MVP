import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Field from "../components/Field";
import Chips from "../components/Chips";
import { useRegister } from "../hooks/auth/useAuthMutations";

const TYPES = [
  { value: "player", label: "Player" },
  { value: "member", label: "Member" },
  { value: "sponsor", label: "Sponsor" },
  { value: "visitor", label: "Visitor" },
];
const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export default function Register() {
  const navigate = useNavigate();
  const { trigger, isMutating, error, reset } = useRegister();
  const [form, setForm] = useState({
    userType: "player",
    name: "",
    phone: "",
    password: "",
    passNumber: "",
    gender: "",
    businessName: "",
  });

  const set = (name, value) => {
    if (error) reset();
    setForm((f) => ({ ...f, [name]: value }));
  };
  const onChange = (e) => set(e.target.name, e.target.value);

  const onSubmit = async (e) => {
    e.preventDefault();

    const { userType, name, phone, password } = form;
    const payload = { userType, name, phone, password };
    if (userType === "player") {
      payload.passNumber = form.passNumber;
      payload.gender = form.gender;
    }
    if (userType === "sponsor") payload.businessName = form.businessName;

    try {
      await trigger(payload);
      navigate("/", { replace: true });
    } catch {
      /* error shown via `error` */
    }
  };

  return (
    <main className="auth">
      {/* ---------- Brand ---------- */}
      <div className="auth__brand">
        <img src="/aradhana-logo.png" alt="Aaradhna" className="auth__logo" />
        <p className="auth__brand-sub">Couple Garba</p>
      </div>

      {/* ---------- Om divider ---------- */}
      <div className="auth__divider">
        <span className="auth__divider-line" />
        <span className="auth__divider-om">ॐ</span>
        <span className="auth__divider-line" />
      </div>

      {/* ---------- Title ---------- */}
      <h2 className="auth__title">Create Account</h2>
      <p className="auth__tag">
        Join the rhythm of <strong>Aaradhna</strong>
      </p>

      {/* ---------- Form ---------- */}
      <form className="auth__form" onSubmit={onSubmit}>
        <Chips
          label="I am a"
          options={TYPES}
          value={form.userType}
          onChange={(v) => set("userType", v)}
        />

        <Field
          id="name"
          name="name"
          label="Full name"
          autoComplete="name"
          value={form.name}
          onChange={onChange}
          required
        />

        <Field
          id="phone"
          name="phone"
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={15}
          placeholder="98765 43210"
          value={form.phone}
          onChange={onChange}
          required
        />

        {form.userType === "player" && (
          <>
            <Field
              id="passNumber"
              name="passNumber"
              label="Pass number"
              autoCapitalize="characters"
              maxLength={10}
              value={form.passNumber}
              onChange={onChange}
              required
            />
            <Chips
              label="Gender"
              options={GENDERS}
              value={form.gender}
              onChange={(v) => set("gender", v)}
            />
          </>
        )}

        {form.userType === "sponsor" && (
          <Field
            id="businessName"
            name="businessName"
            label="Shop / business name"
            value={form.businessName}
            onChange={onChange}
            required
          />
        )}

        <Field
          id="password"
          name="password"
          label="Password (min 6 characters)"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={onChange}
          required
        />

        {error && (
          <div className="form-error" role="alert">
            {error.message}
          </div>
        )}

        <button
          className="btn"
          disabled={isMutating || (form.userType === "player" && !form.gender)}
        >
          {isMutating ? "Creating account…" : "Create Account"}
        </button>
      </form>

      {/* ---------- Footer ---------- */}
      <p className="auth__alt">
        Already registered? <Link to="/login">Sign in</Link>
      </p>

      <p className="auth__footer">✦ Celebrating the Divine Energy ✦</p>
    </main>
  );
}

