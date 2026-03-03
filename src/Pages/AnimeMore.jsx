import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { getLocalizedField } from "../utils/animeI18n";
import { addCommentForAnime, getCommentsForAnime } from "../utils/comments";

const FALLBACK_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const normalizeEpisodes = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : 12;
};

const AnimeMore = () => {
  const { t, language } = useOutletContext();
  const { id } = useParams();
  const [animeMore, setAnimeMore] = useState(null);
  const [allAnimes, setAllAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const fetchAnime = useCallback(async () => {
    try {
      const req = await fetch("/db.json");
      if (!req.ok) throw new Error("fetch-error");
      const res = await req.json();
      const animeList = res?.animes?.[0]?.animeList ?? [];
      const anime = animeList.find((item) => item.id === Number(id));
      setAllAnimes(animeList);
      setAnimeMore(anime || null);
      setError(false);
    } catch {
      setError(true);
      setAnimeMore(null);
      setAllAnimes([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  useEffect(() => {
    setComments(getCommentsForAnime(id));
  }, [id]);

  const relatedAnimes = useMemo(() => {
    if (!animeMore) return [];
    const currentCatalog = animeMore.catalog || [];
    return allAnimes
      .filter((anime) => anime.id !== animeMore.id)
      .map((anime) => {
        const shared = (anime.catalog || []).filter((tag) => currentCatalog.includes(tag)).length;
        return { ...anime, shared };
      })
      .filter((anime) => anime.shared > 0)
      .sort((a, b) => b.shared - a.shared)
      .slice(0, 4);
  }, [allAnimes, animeMore]);

  const detailsText = {
    episodeLabel: t.details.episodeLabel || "Episode",
    newLabel: t.details.newLabel || "New",
    availableLabel: t.details.availableLabel || "Available",
    episodesBlock: t.details.episodesBlock || "Episode list",
    watchNextTitle: t.details.watchNextTitle || "Watch next",
    watchNextText: t.details.watchNextText || "Choose similar anime and continue your marathon.",
    watchNextButton: t.details.watchNextButton || "Open recommendations",
    relatedTitle: t.details.relatedTitle || "Related anime",
  };

  const episodesList = useMemo(() => {
    if (!animeMore) return [];
    const count = Math.min(24, Math.max(1, normalizeEpisodes(animeMore.episodes)));
    return Array.from({ length: count }, (_, index) => {
      const episode = index + 1;
      return {
        episode,
        title: `${detailsText.episodeLabel} ${episode}`,
        status: episode <= 3 ? detailsText.newLabel : detailsText.availableLabel,
      };
    });
  }, [animeMore, detailsText.episodeLabel, detailsText.newLabel, detailsText.availableLabel]);

  if (loading) {
    return (
      <div className="container anime-detail-page">
        <p className="empty-state">{t.common.loading}</p>
      </div>
    );
  }

  if (!animeMore) {
    return (
      <div className="container anime-detail-page">
        <p className="empty-state">{error ? t.common.fetchError : t.common.notFound}</p>
        <Link to="/" className="primary-btn">
          {t.common.backHome}
        </Link>
      </div>
    );
  }

  const trailerVideo =
    animeMore.video || animeMore.trailer || animeMore.previewVideo || FALLBACK_VIDEO_URL;
  const translateGenre = (genre) => t.genres?.[genre] || genre;
  const detailTitle = getLocalizedField(animeMore.title, language);
  const detailDescription = getLocalizedField(animeMore.description, language);
  const detailSummary = getLocalizedField(animeMore.xulosa, language);

  const onSubmitComment = (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const newComment = {
      id: `${Date.now()}`,
      name: name.trim() || t.comments.anonymous,
      text: trimmedMessage,
      createdAt: new Date().toISOString(),
    };

    addCommentForAnime(id, newComment);
    setComments((prev) => [newComment, ...prev]);
    setMessage("");
  };

  return (
    <section className="container anime-detail-page reveal-up">
      <div className="detail-hero">
        <img src={animeMore.img} alt={detailTitle} />
        <div className="detail-side">
          <h1>{detailTitle}</h1>
          <p>{detailDescription}</p>
          <div className="meta-grid">
            <div>
              <span>{t.details.releaseYear}</span>
              <strong>{animeMore.releaseYear}</strong>
            </div>
            <div>
              <span>{t.details.episodes}</span>
              <strong>{animeMore.episodes}</strong>
            </div>
            <div>
              <span>{t.details.duration}</span>
              <strong>{animeMore.duration}</strong>
            </div>
          </div>
          <div className="tags">
            {animeMore.catalog?.map((tag) => (
              <span className="tag" key={tag}>
                {translateGenre(tag)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <article className="detail-video-card">
        <h2>{t.details.watchPreview}</h2>
        <video
          className="detail-video"
          src={trailerVideo}
          poster={animeMore.bgImg || animeMore.img}
          controls
          playsInline
          preload="metadata"
        />
      </article>

      <div className="detail-hub">
        <div className="detail-main-col">
          <article className="summary-box">
            <h2>{t.common.detailsSummary}</h2>
            <p>{detailSummary}</p>
          </article>

          <article className="summary-box">
            <h2>{detailsText.episodesBlock}</h2>
            <div className="episodes-grid">
              {episodesList.map((episodeItem) => (
                <button type="button" key={episodeItem.episode} className="episode-card">
                  <strong>{episodeItem.title}</strong>
                  <span>{episodeItem.status}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="summary-box">
            <h2>{t.comments.title}</h2>
            <form className="comment-form" onSubmit={onSubmitComment}>
              <label>
                {t.comments.yourName}
                <input
                  className="search-input"
                  type="text"
                  placeholder={t.comments.yourNamePlaceholder}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label>
                {t.comments.message}
                <textarea
                  className="comment-textarea"
                  placeholder={t.comments.messagePlaceholder}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                />
              </label>
              <button className="primary-btn" type="submit">
                {t.comments.submit}
              </button>
            </form>
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="empty-state">{t.comments.noComments}</p>
              ) : (
                comments.map((comment) => (
                  <article className="comment-item" key={comment.id}>
                    <div className="comment-head">
                      <strong>{comment.name}</strong>
                      <span>
                        {new Date(comment.createdAt).toLocaleString(language === "uz" ? "uz-UZ" : language)}
                      </span>
                    </div>
                    <p>{comment.text}</p>
                  </article>
                ))
              )}
            </div>
          </article>
        </div>

        <aside className="detail-side-col">
          <article className="summary-box">
            <h2>{detailsText.watchNextTitle}</h2>
            <p>{detailsText.watchNextText}</p>
            <a className="primary-btn" href="#related-grid">
              {detailsText.watchNextButton}
            </a>
          </article>

          <article id="related-grid" className="summary-box">
            <h2>{detailsText.relatedTitle}</h2>
            <div className="related-list">
              {relatedAnimes.length === 0 ? (
                <p className="empty-state">{t.common.notFound}</p>
              ) : (
                relatedAnimes.map((anime) => (
                  <Link key={anime.id} to={`/animeList/${anime.id}`} className="related-item">
                    <img src={anime.img} alt={getLocalizedField(anime.title, language)} />
                    <div>
                      <strong>{getLocalizedField(anime.title, language)}</strong>
                      <span>
                        {anime.releaseYear} • {anime.duration}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
};

export default AnimeMore;
