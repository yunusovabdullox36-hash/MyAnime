import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const Navbar = ({ theme, onToggleTheme }) => {
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
            Bosh sahifa
          </NavLink>
          <a href="#catalogs" className="nav-link" onClick={() => setIsOpen(false)}>
            Janrlar
          </a>
          <a href="#anime-grid" className="nav-link" onClick={() => setIsOpen(false)}>
            Anime ro'yxati
          </a>
        </nav>

        <div className="nav-actions">
          <button className="theme-toggle" onClick={onToggleTheme} type="button">
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button
            className="menu-button"
            onClick={() => setIsOpen((prev) => !prev)}
            type="button"
            aria-label="Menu"
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
