import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { DetectionProvider } from "./context/DetectionContext";

import App from "./App";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DetectionProvider>
          <App />
        </DetectionProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);