import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { DarkModeProvider } from "./component/DarkModeContext/DarkModeContext.jsx"; // Import context
import "./index.css";
import router from "./route/router.jsx";
import { ApiProvider } from "./utils/ApiContext.jsx";
import { SocketContextProvider } from "./context/SocketContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApiProvider>
      <DarkModeProvider>
        <SocketContextProvider>
        <RouterProvider router={router} />
        </SocketContextProvider>
      </DarkModeProvider>
    </ApiProvider>
  </React.StrictMode>
);
