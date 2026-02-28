import React from "react";
import { Link } from "react-router-dom";

const Footer = ({ t }) => {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">A</span>
            <span>{t.footer.brandName}</span>
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
          <p className="footer-text">{t.footer.emailLabel}: animeatlas@site.uz</p>
          <p className="footer-text">{t.footer.telegramLabel}: @animeatlas</p>
        </div>
      </div>
      <p className="copyright">
        (c) {new Date().getFullYear()} {t.footer.brandName}. {t.footer.rights}
      </p>
    </footer>
  );
};

export default Footer;
