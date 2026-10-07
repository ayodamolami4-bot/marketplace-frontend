import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./app/store";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>
  </React.StrictMode>
);
