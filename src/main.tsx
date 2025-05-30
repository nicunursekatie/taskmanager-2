import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App";
import "./includeCompactStyles";

// Import and initialize Tempo Devtools
import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
