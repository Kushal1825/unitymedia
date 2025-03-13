import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { DarkModeProvider } from "./component/DarkModeContext/DarkModeContext.jsx"; // Import context
import "./index.css";
import router from "./route/router.jsx";
import { ApiProvider } from "./utils/ApiContext.jsx";
import { SocketContextProvider } from "./context/SocketContext.jsx";
import { PostProvider } from "./context/PostContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApiProvider>
      <DarkModeProvider>
        <SocketContextProvider>
          <PostProvider>
        <RouterProvider router={router} />
          </PostProvider>
        </SocketContextProvider>
      </DarkModeProvider>
    </ApiProvider>
  </React.StrictMode>
);
