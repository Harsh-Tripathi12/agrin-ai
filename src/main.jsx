import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";

import { LanguageProvider } from "./context/LanguageContext";
import { FarmProvider } from "./context/FarmContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <FarmProvider>
        <App />
      </FarmProvider>
    </LanguageProvider>
  </StrictMode>
);