import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function IconField({ icon: Icon, label, id, type = "text", ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="f2">
      <Icon size={20} />
      <div className="f2__body">
        <label htmlFor={id}>{label}</label>
        <input id={id} type={isPassword && show ? "text" : type} {...props} />
      </div>
      {isPassword && (
        <button
          type="button"
          className="f2__eye"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
}