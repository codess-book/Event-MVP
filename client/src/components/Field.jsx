import { useState } from "react";
export default function Field({ label, id, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} {...props} />
    </div>
  );
}