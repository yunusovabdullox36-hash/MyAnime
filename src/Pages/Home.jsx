import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getLocalizedField } from "../utils/animeI18n";
import { COMMENTS_UPDATED_EVENT, getAllComments } from "../utils/comments";
import "swiper/css";
import "swiper/css/pagination";

const ALL_CATALOG = "__all__";

const Home = () => {
  const { t, language } = useOutletContext();
  const [catalogs, setCatalogs] = useState([]);
  const [animes, setAnimes] = useState([]);
  const [commentsByAnime, setCommentsByAnime] = useState({});
  const [activeCatalog, setActiveCatalog] = useState(ALL_CATALOG);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [previewAnime, setPreviewAnime] = useState(null);
  const [previewPosition, setPreviewPosition] = useState({ top: 0, left: 0 });
  const hoverTimerRef = useRef(null);

  const fetchData = async () => {
    try {
      const req = await fetch("/db.json");
      if (!req.ok) throw new Error("fetch-error");
      const res = await req.json();
      setCatalogs(res?.animes?.[0]?.catalogs ?? []);
      setAnimes(res?.animes?.[0]?.animeList ?? []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const syncComments = () => setCommentsByAnime(getAllComments());
    syncComments();

    window.addEventListener(COMMENTS_UPDATED_EVENT, syncComments);
    window.addEventListener("focus", syncComments);
    return () => {
      window.removeEventListener(COMMENTS_UPDATED_EVENT, syncComments);
      window.removeEventListener("focus", syncComments);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const featuredAnime = animes[0];

  const filteredAnimes = useMemo(() => {
    return animes.filter((anime) => {
      const byCatalog =
        activeCatalog === ALL_CATALOG || anime.catalog?.includes(activeCatalog);
      const title = getLocalizedField(anime.title, language).toLowerCase();
      const description = getLocalizedField(anime.description, language).toLowerCase();
      const bySearch =
        title.includes(search.toLowerCase()) ||
        description.includes(search.toLowerCase());
      return byCatalog && bySearch;
    });
  }, [animes, activeCatalog, search, language]);

  const translateGenre = (genre) => t.genres?.[genre] || genre;
  const translateGenreDescription = (catalog) =>
    t.genreDescriptions?.[catalog.title] || catalog.description;
  const getCardDescription = (anime) => {
    const raw = getLocalizedField(anime.description, language);
    const hasLocalizedObject =
      anime?.description &&
      typeof anime.description === "object" &&
      !Array.isArray(anime.description);

    if (language === "uz" || hasLocalizedObject) return raw;

    const genres = (anime.catalog || []).slice(0, 2).map(translateGenre).join(", ");
    return t.home.cardAutoDescription({
      year: anime.releaseYear || "-",
      genres,
    });
  };
  const getAnimeComments = (animeId) => {
    const list = commentsByAnime[String(animeId)];
    return Array.isArray(list) ? list : [];
  };

  const handleCardEnter = (anime, event) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    const rect = event.currentTarget.getBoundingClientRect();
    hoverTimerRef.current = setTimeout(() => {
      const modalWidth = 360;
      const modalGap = 12;
      const modalHeight = 470;
      const canPlaceRight = rect.right + modalGap + modalWidth <= window.innerWidth;
      const left = canPlaceRight
        ? rect.right + modalGap
        : Math.max(10, rect.left - modalWidth - modalGap);
      const top = Math.max(10, Math.min(rect.top, window.innerHeight - modalHeight - 10));

      setPreviewPosition({ top, left });
      setPreviewAnime(anime);
    }, 700);
  };

  const handleCardLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setPreviewAnime(null);
  };

  return (
    <div className="home-page">
      <section className="hero-section reveal-up">
        <div className="hero-overlay" />
        {featuredAnime?.bgImg || featuredAnime?.img ? (
          <img src={featuredAnime?.bgImg || featuredAnime?.img} alt={t.common.heroAlt} />
        ) : null}
        <div className="container hero-content">
          <p className="hero-badge">{t.home.heroBadge}</p>
          <h1>{t.home.heroTitle}</h1>
          <p>{t.home.heroText}</p>
          <a className="primary-btn" href="#anime-grid">
            {t.home.heroButton}
          </a>
        </div>
      </section>

      <section id="catalogs" className="container section-block reveal-up">
        <div className="section-head">
          <h2>{t.home.genresTitle}</h2>
          <p>{t.home.genresText}</p>
        </div>
        <Swiper
          slidesPerView={1}
          spaceBetween={18}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          loop={catalogs.length > 3}
          autoplay={{ delay: 2600, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Pagination, Autoplay]}
          className="catalog-swiper"
        >
          {catalogs.map((catalog) => (
            <SwiperSlide key={catalog.id}>
              <article
                className="catalog-card"
                style={{ backgroundImage: `linear-gradient(160deg, rgba(0,0,0,.6), rgba(0,0,0,.2)), url(${catalog.img})` }}
              >
                <h3>{translateGenre(catalog.title)}</h3>
                <p>{translateGenreDescription(catalog)}</p>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="container section-block reveal-up">
        <div className="section-head">
          <h2>{t.home.searchTitle}</h2>
          <p>{t.home.searchText}</p>
        </div>

        <div className="controls">
          <input
            className="search-input"
            type="text"
            placeholder={t.home.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="chips">
            <button
              type="button"
              className={`chip ${activeCatalog === ALL_CATALOG ? "active" : ""}`}
              onClick={() => setActiveCatalog(ALL_CATALOG)}
            >
              {t.common.all}
            </button>
            {catalogs.map((catalog) => (
              <button
                key={catalog.id}
                type="button"
                className={`chip ${activeCatalog === catalog.title ? "active" : ""}`}
                onClick={() => setActiveCatalog(catalog.title)}
              >
                {translateGenre(catalog.title)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="anime-grid" className="container section-block reveal-up">
        <div className="section-head">
          <h2>{t.home.resultTitle}</h2>
          <p>{t.home.resultText(filteredAnimes.length)}</p>
        </div>

        {error && <p className="empty-state">{t.common.fetchError}</p>}

        {loading ? (
          <p className="empty-state">{t.common.loading}</p>
        ) : !error ? (
          <div className="anime-grid">
            {filteredAnimes.map((anime) => (
              <Link
                to={`/animeList/${anime.id}`}
                key={anime.id}
                className="anime-card"
                onMouseEnter={(event) => handleCardEnter(anime, event)}
                onMouseLeave={handleCardLeave}
              >
                <div className="anime-media">
                  <div className="anime-poster" style={{ backgroundImage: `url(${anime.img})` }} />
                  <div className="anime-media-overlay">
                    <span className="media-pill">{t.common.poster}</span>
                  </div>
                </div>
                <div className="anime-info">
                  <h3>{getLocalizedField(anime.title, language)}</h3>
                  <p>{getCardDescription(anime)}</p>
                  <div className="tags">
                    {anime.catalog?.slice(0, 3).map((tag) => (
                      <span className="tag" key={tag}>
                        {translateGenre(tag)}
                      </span>
                    ))}
                  </div>
                  <div className="card-comments">
                    <strong>{t.comments.cardCount(getAnimeComments(anime.id).length)}</strong>
                    <span>
                      {getAnimeComments(anime.id)[0]?.text
                        ? `${t.comments.latestOnCard}: ${getAnimeComments(anime.id)[0].text}`
                        : t.comments.noComments}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        {!loading && !error && filteredAnimes.length === 0 && (
          <p className="empty-state">{t.home.emptyFilter}</p>
        )}
      </section>

      {previewAnime && (
        <aside
          className="hover-preview-modal"
          style={{
            top: `${previewPosition.top}px`,
            left: `${previewPosition.left}px`,
            backgroundImage: `linear-gradient(160deg, rgba(17, 10, 6, 0.88), rgba(17, 10, 6, 0.45)), url(${previewAnime.bgImg || previewAnime.img})`,
          }}
        >
          <div className="hover-preview-inner">
            <img src={previewAnime.img} alt={previewAnime.title} />
            <h4>{getLocalizedField(previewAnime.title, language)}</h4>
            <p>{getCardDescription(previewAnime)}</p>
            <div className="hover-preview-meta">
              <span>{previewAnime.releaseYear}</span>
              <span>{previewAnime.episodes} {t.common.episodesShort}</span>
              <span>{previewAnime.duration}</span>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Home;
