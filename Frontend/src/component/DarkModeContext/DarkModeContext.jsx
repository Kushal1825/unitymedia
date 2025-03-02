import React, { createContext, useState, useContext, useEffect } from "react";

// 100: "#0D1117",
//           200: "#161B22",
//           300: "#1F2428",
//           400: "#242C38",
const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    // Retrieve initial state from localStorage or set to false
    const savedDarkMode = localStorage.getItem("darkMode");
    return savedDarkMode === "true";
  });

  const [navbarActive, setNavbarActive] = useState(false);
  const [text, setText] = useState("bars");

  const handleNavbarToggle = () => {
    setNavbarActive((prev) => !prev);
    setText((prev) => (prev === "bars" ? "list-check" : "bars"));
  };

  const enableDarkMode = () => setDark(true);
  const disableDarkMode = () => setDark(false);

  // Save `dark` value to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("darkMode", dark);
  }, [dark]);

  return (
    <DarkModeContext.Provider
      value={{
        dark,
        enableDarkMode,
        disableDarkMode,
        navbarActive,
        setNavbarActive,
        text,
        handleNavbarToggle,
      }}
    >
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);
