import React from "react";
import { createRoot } from "react-dom/client";
import LinePlot from "./components/LinePlot.jsx";

const rootElement = document.getElementById("app");
const root = createRoot(rootElement);

root.render(
  <>
    <h1>PostgreSQL Performance Farm</h1>
    <div className="chart">
      <LinePlot />
    </div>
  </>
);
