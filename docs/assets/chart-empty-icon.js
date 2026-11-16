import React from "react";
import { createRoot } from "react-dom/client";
import IconEmptyChart from "@arco-design/iconbox-react-babi/esm/IconEmptyChart/index.js";

// Use the same IconBox component as the business chart empty state.
createRoot(document.getElementById("chart-empty-icon")).render(
  React.createElement(IconEmptyChart, { width: 80, height: 80, "aria-hidden": true })
);
