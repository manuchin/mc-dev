import React from "react";
import { createRoot } from "react-dom/client";
import { DbProvider } from "./lib/db.jsx";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DbProvider>
      <App />
    </DbProvider>
  </React.StrictMode>
);
