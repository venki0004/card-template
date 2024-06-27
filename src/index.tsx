import { createRoot } from "react-dom/client";

import App from "./App";
import { BrowserRouter } from "react-router-dom";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement as HTMLElement);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
