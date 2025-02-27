import React from "react";
import { createRoot } from "react-dom/client";
import LinePlot from "./components/LinePlot.jsx";

const rootElement = document.getElementById("app");
const root = createRoot(rootElement);

root.render(
  <>
    <div>PostgreSQL Performance Farm</div>
    <LinePlot />
  </>
);
