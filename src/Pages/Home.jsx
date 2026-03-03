import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getLocalizedField } from "../utils/animeI18n";
import { COMMENTS_UPDATED_EVENT, getAllComments } from "../utils/comments";
import "swiper/css";
import "swiper/css/pagination";

const ALL_CATALOG = "__all__";

const normalizeEpisodes = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : 12;
};

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
  const [spotlightAnime, setSpotlightAnime] = useState(null);
  const hoverTimerRef = useRef(null);

  const fetchData = async () => {
    try {
      const req = await fetch("/db.json");
      if (!req.ok) throw new Error("fetch-error");
      const res = await req.json();
      const nextCatalogs = res?.animes?.[0]?.catalogs ?? [];
      const nextAnimes = res?.animes?.[0]?.animeList ?? [];
      setCatalogs(nextCatalogs);
      setAnimes(nextAnimes);
      setSpotlightAnime(nextAnimes[0] ?? null);
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

  const topAnime = useMemo(() => {
    return [...animes]
      .map((anime, index) => {
        const commentsCount = Array.isArray(commentsByAnime[String(anime.id)])
          ? commentsByAnime[String(anime.id)].length
          : 0;
        const releaseBoost = (Number(anime.releaseYear) || 2010) / 1000;
        const episodeBoost = Math.min(normalizeEpisodes(anime.episodes), 26) / 50;
        const ratingBoost = (Number(anime.rating) || 0) / 2;
        const score =
          6.8 + releaseBoost + episodeBoost + ratingBoost + commentsCount * 0.18 - index * 0.02;
        return { ...anime, score: Math.min(10, Number(score.toFixed(2))) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [animes, commentsByAnime]);

  const queueAnime = useMemo(() => {
    return filteredAnimes.slice(0, 6);
  }, [filteredAnimes]);

  const recentComments = useMemo(() => {
    const rows = Object.entries(commentsByAnime).flatMap(([animeId, list]) => {
      const anime = animes.find((item) => String(item.id) === String(animeId));
      if (!anime || !Array.isArray(list)) return [];

      return list.map((comment) => ({
        animeId,
        anime,
        comment,
      }));
    });

    return rows
      .sort(
        (a, b) => new Date(b.comment.createdAt).getTime() - new Date(a.comment.createdAt).getTime()
      )
      .slice(0, 5);
  }, [commentsByAnime, animes]);

  const homeText = {
    topTitle: t.home.topTitle || "Top 10 Anime",
    topHint: t.home.topHint || "Activity based ranking",
    queueTitle: t.home.queueTitle || "On Queue",
    queueHint: t.home.queueHint ? t.home.queueHint(queueAnime.length) : `${queueAnime.length} ta tanlangan anime`,
    randomTitle: t.home.randomTitle || "Random Spotlight",
    randomButton: t.home.randomButton || "Random tanlash",
    openAnime: t.home.openAnime || "Animega otish",
    quickNavTitle: t.home.quickNavTitle || "Quick navigation",
    latestCommentsTitle: t.home.latestCommentsTitle || "So'nggi izohlar",
  };

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

  const pickRandomAnime = () => {
    const pool = filteredAnimes.length ? filteredAnimes : animes;
    if (!pool.length) return;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setSpotlightAnime(pool[randomIndex]);
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

      <section className="container top-catalog-strip reveal-up">
        <div className="strip-scroll">
          <button
            type="button"
            className={`strip-pill ${activeCatalog === ALL_CATALOG ? "active" : ""}`}
            onClick={() => setActiveCatalog(ALL_CATALOG)}
          >
            {t.common.all}
          </button>
          {catalogs.map((catalog) => (
            <button
              key={catalog.id}
              type="button"
              className={`strip-pill ${activeCatalog === catalog.title ? "active" : ""}`}
              onClick={() => setActiveCatalog(catalog.title)}
            >
              {translateGenre(catalog.title)}
            </button>
          ))}
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
                style={{
                  backgroundImage: `linear-gradient(160deg, rgba(0,0,0,.6), rgba(0,0,0,.2)), url(${catalog.img})`,
                }}
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

      <section className="container section-block reveal-up home-hub">
        <div className="hub-main">
          <article className="panel-card top-panel">
            <div className="panel-head">
              <h2>{homeText.topTitle}</h2>
              <span>{homeText.topHint}</span>
            </div>
            <div className="top-list">
              {topAnime.map((anime, index) => (
                <Link key={anime.id} to={`/animeList/${anime.id}`} className="top-item">
                  <span className="top-rank">#{index + 1}</span>
                  <img src={anime.img} alt={getLocalizedField(anime.title, language)} />
                  <div>
                    <h4>{getLocalizedField(anime.title, language)}</h4>
                    <p>
                      {anime.score} / 10 • {anime.releaseYear} • {normalizeEpisodes(anime.episodes)} {t.common.episodesShort}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article id="queue" className="panel-card queue-panel">
            <div className="panel-head">
              <h2>{homeText.queueTitle}</h2>
              <span>{homeText.queueHint}</span>
            </div>
            <div className="queue-grid">
              {queueAnime.map((anime) => (
                <Link to={`/animeList/${anime.id}`} key={anime.id} className="queue-item">
                  <img src={anime.img} alt={getLocalizedField(anime.title, language)} />
                  <div>
                    <h4>{getLocalizedField(anime.title, language)}</h4>
                    <p>{anime.duration}</p>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article className="panel-card spotlight-panel">
            <div className="panel-head">
              <h2>{homeText.randomTitle}</h2>
              <button type="button" className="primary-btn" onClick={pickRandomAnime}>
                {homeText.randomButton}
              </button>
            </div>
            {spotlightAnime ? (
              <div className="spotlight-body">
                <img
                  src={spotlightAnime.bgImg || spotlightAnime.img}
                  alt={getLocalizedField(spotlightAnime.title, language)}
                />
                <div>
                  <h3>{getLocalizedField(spotlightAnime.title, language)}</h3>
                  <p>{getCardDescription(spotlightAnime)}</p>
                  <Link to={`/animeList/${spotlightAnime.id}`} className="primary-btn">
                    {homeText.openAnime}
                  </Link>
                </div>
              </div>
            ) : (
              <p className="empty-state">{t.home.emptyFilter}</p>
            )}
          </article>
        </div>

        <aside className="hub-sidebar">
          <article className="panel-card side-block">
            <h3>{homeText.quickNavTitle}</h3>
            <nav className="side-nav">
              <a href="#catalogs">{t.nav.genres}</a>
              <a href="#queue">{homeText.queueTitle}</a>
              <a href="#anime-grid">{t.nav.animeList}</a>
            </nav>
          </article>

          <article className="panel-card side-block">
            <h3>{homeText.latestCommentsTitle}</h3>
            <div className="latest-comments">
              {recentComments.length === 0 ? (
                <p className="empty-state">{t.comments.noComments}</p>
              ) : (
                recentComments.map((entry) => (
                  <Link
                    className="latest-comment"
                    key={entry.comment.id}
                    to={`/animeList/${entry.anime.id}`}
                  >
                    <strong>{getLocalizedField(entry.anime.title, language)}</strong>
                    <span>{entry.comment.text}</span>
                  </Link>
                ))
              )}
            </div>
          </article>
        </aside>
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
              <span>
                {previewAnime.episodes} {t.common.episodesShort}
              </span>
              <span>{previewAnime.duration}</span>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Home;
