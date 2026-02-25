import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

const Home = () => {
  const { t } = useOutletContext();
  const [catalogs, setCatalogs] = useState([]);
  const [animes, setAnimes] = useState([]);
  const [activeCatalog, setActiveCatalog] = useState(t.common.all);
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
    setActiveCatalog(t.common.all);
  }, [t]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const featuredAnime = animes[0];

  const filteredAnimes = useMemo(() => {
    return animes.filter((anime) => {
      const byCatalog =
        activeCatalog === t.common.all || anime.catalog?.includes(activeCatalog);
      const bySearch =
        anime.title?.toLowerCase().includes(search.toLowerCase()) ||
        anime.description?.toLowerCase().includes(search.toLowerCase());
      return byCatalog && bySearch;
    });
  }, [animes, activeCatalog, search, t]);

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
          <img src={featuredAnime?.bgImg || featuredAnime?.img} alt="Hero background" />
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
                <h3>{catalog.title}</h3>
                <p>{catalog.description}</p>
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
              className={`chip ${activeCatalog === t.common.all ? "active" : ""}`}
              onClick={() => setActiveCatalog(t.common.all)}
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
                {catalog.title}
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
                <div className="anime-poster" style={{ backgroundImage: `url(${anime.img})` }} />
                <div className="anime-info">
                  <h3>{anime.title}</h3>
                  <p>{anime.description?.slice(0, 110)}...</p>
                  <div className="tags">
                    {anime.catalog?.slice(0, 3).map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
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
            <h4>{previewAnime.title}</h4>
            <p>{previewAnime.description}</p>
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
