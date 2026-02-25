import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">A</span>
            <span>Anime Atlas</span>
          </Link>
          <p className="footer-text">
            Eng yaxshi animelarni topish, tanlash va ilhom olish uchun zamonaviy platforma.
          </p>
        </div>
        <div>
          <p className="footer-title">Bo'limlar</p>
          <ul className="footer-list">
            <li>
              <a href="#catalogs">Janrlar</a>
            </li>
            <li>
              <a href="#anime-grid">Anime ro'yxati</a>
            </li>
          </ul>
        </div>
        <div>
          <p className="footer-title">Aloqa</p>
          <p className="footer-text">Email: animeatlas@site.uz</p>
          <p className="footer-text">Telegram: @animeatlas</p>
        </div>
      </div>
      <p className="copyright">© {new Date().getFullYear()} Anime Atlas. Barcha huquqlar himoyalangan.</p>
    </footer>
  );
};

export default Footer;
