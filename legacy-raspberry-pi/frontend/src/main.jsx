import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./theme.css";

// HashRouter (not BrowserRouter): the app is served as static files by FastAPI
// with no catch-all route for deep links, so history-based routing would 404
// on refresh (e.g. reloading /despensa on the wall tablet).
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
