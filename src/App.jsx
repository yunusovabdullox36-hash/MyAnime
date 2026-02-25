import React, { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Components/Header";
import Footer from "./Components/Footer";

const getPreferredTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const App = () => {
  const [theme, setTheme] = useState(getPreferredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useMemo(
    () => () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
    []
  );

  return (
    <div className="app-shell">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main className="page-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
