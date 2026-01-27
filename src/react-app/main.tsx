import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Basic shims for browser compatibility
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}
if (typeof (window as any).Buffer === 'undefined') {
  (window as any).Buffer = { from: () => ({}) } as any;
}

import "@/react-app/index.css";
import App from "@/react-app/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
