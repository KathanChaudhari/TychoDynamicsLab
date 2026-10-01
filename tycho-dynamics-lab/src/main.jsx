import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import App from "./App.jsx";
import AppErrorBoundary from "./errors/AppErrorBoundary.jsx";

import "./index.css";

const rootElement =
  document.getElementById(
    "root"
  );

createRoot(
  rootElement
).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);