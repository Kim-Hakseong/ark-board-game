import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HostScreen } from "./screens/host/HostScreen";
import { PlayScreen } from "./screens/play/PlayScreen";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root not found");

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HostScreen />} />
        <Route path="/play" element={<PlayScreen />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
