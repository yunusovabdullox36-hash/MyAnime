import React, { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Components/Header";
import Footer from "./Components/Footer";
import { getPreferredLanguage, translations } from "./i18n";

const getPreferredTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const App = () => {
  const [theme, setTheme] = useState(getPreferredTheme);
  const [language, setLanguage] = useState(getPreferredLanguage);
  const t = translations[language];

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const toggleTheme = useMemo(
    () => () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
    []
  );

  return (
    <div className="app-shell">
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        onChangeLanguage={setLanguage}
        t={t}
      />
      <main className="page-content">
        <Outlet context={{ language, t }} />
      </main>
      <Footer t={t} />
    </div>
  );
};

export default App;
