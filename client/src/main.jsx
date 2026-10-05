import "./hooks/pwa/useInstall";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import "./index.css";
import App from "./App.jsx";
import { api } from "./lib/api";
import { logout } from "./hooks/auth/useAuthMutations";
import { ToastProvider } from "./components/Toast.jsx";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SWRConfig
      value={{
        fetcher: api,
        onError: (e) => e.status === 401 && logout(),
      }}
    >
      <ToastProvider>
        <App />
      </ToastProvider>
    </SWRConfig>
  </StrictMode>,
);
