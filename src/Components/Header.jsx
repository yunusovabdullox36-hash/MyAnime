import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const Navbar = ({ theme, onToggleTheme, language, onChangeLanguage, t }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container nav-row">
        <Link className="brand" to="/">
          <span className="brand-mark">A</span>
          <span>shuni</span>
        </Link>

        <nav className={`nav-links ${isOpen ? "open" : ""}`}>
          <NavLink to="/" className="nav-link" onClick={() => setIsOpen(false)}>
            {t.nav.home}
          </NavLink>
          <a href="#catalogs" className="nav-link" onClick={() => setIsOpen(false)}>
            {t.nav.genres}
          </a>
          <a href="#anime-grid" className="nav-link" onClick={() => setIsOpen(false)}>
            {t.nav.animeList}
          </a>
        </nav>

        <div className="nav-actions">
          <div className="lang-switch" role="group" aria-label="Language switcher">
            {["uz", "ru", "en"].map((lang) => (
              <button
                key={lang}
                type="button"
                className={`lang-btn ${language === lang ? "active" : ""}`}
                onClick={() => onChangeLanguage(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="theme-toggle" onClick={onToggleTheme} type="button">
            {theme === "dark" ? t.common.light : t.common.dark}
          </button>
          <button
            className="menu-button"
            onClick={() => setIsOpen((prev) => !prev)}
            type="button"
            aria-label={t.nav.menuAria}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
