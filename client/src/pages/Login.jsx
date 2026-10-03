import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Field from "../components/Field";
import { useLogin } from "../hooks/auth/useAuthMutations";

export default function Login() {
  const navigate = useNavigate();
  const { trigger, isMutating, error, reset } = useLogin();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => {
    if (error) reset();
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await trigger(form);
      navigate("/", { replace: true });
    } catch {
      /* error shown via `error` */
    }
  };

  const isFormValid = form.phone.length > 0 && form.password.length > 0;

  return (
    <div className="auth">
      {/* Brand logo + Om divider */}
      <div className="auth__brand">
        <img src="/aradhana-logo.png" alt="Aaradhna" className="auth__logo" />
        <p className="auth__brand-sub">Couple Garba</p>
      </div>

      <div className="auth__divider">
        <span className="auth__divider-line" />
        <span className="auth__divider-om">ॐ</span>
        <span className="auth__divider-line" />
      </div>

      <h1 className="auth__title">Welcome Back</h1>
      <p className="auth__tag">
        Step into the rhythm of <strong>Aaradhna</strong>
      </p>

      <form onSubmit={onSubmit} className="auth__form" noValidate>
        <Field
          label="Phone Number"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={onChange}
          placeholder="+91 98765 43210"
          autoComplete="tel"
          required
        />

        <div className="field">
          <div className="field__wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={onChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              aria-label="Password"
            />
            <button
              type="button"
              className="field__toggle"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="auth__row">
          <Link to="/forgot-password" className="link">
            Forgot Password?
          </Link>
        </div>

        {error && (
          <div role="alert" className="form-error">
            {error?.response?.data?.message ||
              error?.message ||
              "Login failed. Please check your credentials."}
          </div>
        )}

        <button
          type="submit"
          className="btn"
          disabled={isMutating || !isFormValid}
        >
          {isMutating ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="auth__alt">
        Don&apos;t have an account? <Link to="/register">Join Aaradhna</Link>
      </p>

      <p className="auth__footer">✦ Celebrating the Divine Energy ✦</p>
    </div>
  );
}
