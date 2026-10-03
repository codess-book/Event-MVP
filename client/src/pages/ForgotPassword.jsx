import { useState } from "react";
import { Link } from "react-router-dom";
import Field from "../components/Field";
import {
  useForgotPassword,
  useResetPassword,
} from "../hooks/auth/useAuthMutations";

export default function ForgotPassword() {
  // "request" -> "reset" -> "done"
  const [step, setStep] = useState("request");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState("");

  const forgot = useForgotPassword();
  const reset = useResetPassword();

  const onRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await forgot.trigger({ phone });
      setInfo(res.message);
      setStep("reset");
    } catch {
      // Message is shown from forgot.error
    }
  };

  const onReset = async (e) => {
    e.preventDefault();
    try {
      const res = await reset.trigger({ phone, code, password });
      setInfo(res.message);
      setStep("done");
    } catch {
      // Message is shown from reset.error
    }
  };

  return (
    <main className="auth">
      <h1 className="auth__brand">Aaradhna</h1>
      <p className="auth__tag">Navratri Garba</p>
      <h2 className="auth__title">Forgot password</h2>

      {step === "request" && (
        <form className="auth__form" onSubmit={onRequest}>
          <Field
            id="phone" name="phone" label="Registered mobile number" type="tel"
            inputMode="numeric" autoComplete="tel" maxLength={15}
            placeholder="98765 43210" value={phone}
            onChange={(e) => { forgot.reset(); setPhone(e.target.value); }}
            required
          />
          {forgot.error && (
            <div className="form-error" role="alert">{forgot.error.message}</div>
          )}
          <button className="btn" disabled={forgot.isMutating}>
            {forgot.isMutating ? "Sending…" : "Request reset code"}
          </button>
          <button
            type="button" className="link"
            style={{ background: "none", border: 0, fontSize: 14, cursor: "pointer" }}
            onClick={() => { setInfo(""); setStep("reset"); }}
          >
            I already have a code
          </button>
        </form>
      )}

      {step === "reset" && (
        <form className="auth__form" onSubmit={onReset}>
          {info && <div className="form-ok">{info}</div>}
          <Field
            id="phone" name="phone" label="Mobile number" type="tel"
            inputMode="numeric" autoComplete="tel" maxLength={15}
            value={phone}
            onChange={(e) => { reset.reset(); setPhone(e.target.value); }}
            required
          />
          <Field
            id="code" name="code" label="6-digit code from the core team"
            className="code" inputMode="numeric" autoComplete="one-time-code"
            maxLength={6} placeholder="••••••" value={code}
            onChange={(e) => { reset.reset(); setCode(e.target.value.replace(/\D/g, "")); }}
            required
          />
          <Field
            id="password" name="password" label="New password (min 6 characters)"
            type="password" autoComplete="new-password" value={password}
            onChange={(e) => { reset.reset(); setPassword(e.target.value); }}
            required
          />
          {reset.error && (
            <div className="form-error" role="alert">{reset.error.message}</div>
          )}
          <button className="btn" disabled={reset.isMutating || code.length !== 6}>
            {reset.isMutating ? "Updating…" : "Set new password"}
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="stack">
          <div className="form-ok">{info}</div>
          <Link to="/login" className="btn" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}>
            Go to sign in
          </Link>
        </div>
      )}

      {step !== "done" && (
        <p className="auth__alt">
          <Link to="/login">Back to sign in</Link>
        </p>
      )}
    </main>
  );
}