import React from "react";
import { Link } from "react-router-dom";

const Footer = ({ t }) => {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">A</span>
            <span>Anime Atlas</span>
          </Link>
          <p className="footer-text">{t.footer.about}</p>
        </div>
        <div>
          <p className="footer-title">{t.footer.sections}</p>
          <ul className="footer-list">
            <li>
              <a href="#catalogs">{t.nav.genres}</a>
            </li>
            <li>
              <a href="#anime-grid">{t.nav.animeList}</a>
            </li>
          </ul>
        </div>
        <div>
          <p className="footer-title">{t.footer.contact}</p>
          <p className="footer-text">Email: animeatlas@site.uz</p>
          <p className="footer-text">Telegram: @animeatlas</p>
        </div>
      </div>
      <p className="copyright">
        © {new Date().getFullYear()} Anime Atlas. {t.footer.rights}
      </p>
    </footer>
  );
};

export default Footer;
