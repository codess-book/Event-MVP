import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Field from "../components/Field";
import { useLogin } from "../hooks/auth/useAuthMutations";

export default function Login() {
  const navigate = useNavigate();
  const { trigger, isMutating, error, reset } = useLogin();
  const [form, setForm] = useState({ phone: "", password: "" });

  const onChange = (e) => {
    if (error) reset(); // clear the old error as soon as the user edits
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await trigger(form);
      navigate("/", { replace: true });
    } catch {
      // The message is shown from `error`, nothing else to do here
    }
  };

  return (
    <main className="auth">
      <h1 className="auth__brand">Aaradhna</h1>
      <p className="auth__tag">Navratri Garba</p>

      <h2 className="auth__title">Welcome back</h2>
      <form className="auth__form" onSubmit={onSubmit}>
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
        <Field
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={onChange}
          required
        />

        {error && <div className="form-error" role="alert">{error.message}</div>}

        <button className="btn" disabled={isMutating}>
          {isMutating ? "Signing in…" : "Sign in"}
        </button>
        <Link className="link" to="/forgot-password" style={{ textAlign: "center", fontSize: 14 }}>
          Forgot password?
        </Link>
      </form>

      <p className="auth__alt">
        New here? <Link to="/register">Create account</Link>
      </p>
    </main>
  );
}