// Static GitHub Pages entry. Renders the single Line page with no server,
// auth, or database: those template pieces only matter for `npm run dev`.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LineApp } from "@/components/line/app";
import "./pages.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LineApp />
  </StrictMode>,
);
