// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; 
import { SideMenuProvider } from "./SideMenuContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
  <SideMenuProvider>
      <App />
    </SideMenuProvider>
  </React.StrictMode>
);

