import React, { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { getLocalizedField } from "../utils/animeI18n";
import { addCommentForAnime, getCommentsForAnime } from "../utils/comments";

const FALLBACK_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const AnimeMore = () => {
  const { t, language } = useOutletContext();
  const { id } = useParams();
  const [animeMore, setAnimeMore] = useState(null);
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
      const anime = res?.animes?.[0]?.animeList?.find((item) => item.id === Number(id));
      setAnimeMore(anime || null);
      setError(false);
    } catch {
      setError(true);
      setAnimeMore(null);
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

      <article className="summary-box">
        <h2>{t.common.detailsSummary}</h2>
        <p>{detailSummary}</p>
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
    </section>
  );
};

export default AnimeMore;
