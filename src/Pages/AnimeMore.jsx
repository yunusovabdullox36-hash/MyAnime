import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const AnimeMore = () => {
  const { id } = useParams();
  const [animeMore, setAnimeMore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnime = useCallback(async () => {
    try {
      const req = await fetch("/db.json");
      if (!req.ok) throw new Error("Ma'lumot yuklanmadi.");
      const res = await req.json();
      const anime = res?.animes?.[0]?.animeList?.find((item) => item.id === Number(id));
      setAnimeMore(anime || null);
      setError("");
    } catch {
      setError("Serverdan ma'lumot olishda xatolik bo'ldi.");
      setAnimeMore(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  if (loading) {
    return (
      <div className="container anime-detail-page">
        <p className="empty-state">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!animeMore) {
    return (
      <div className="container anime-detail-page">
        <p className="empty-state">{error || "Anime topilmadi."}</p>
        <Link to="/" className="primary-btn">
          Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  return (
    <section className="container anime-detail-page reveal-up">
      <div className="detail-hero">
        <img src={animeMore.img} alt={animeMore.title} />
        <div className="detail-side">
          <h1>{animeMore.title}</h1>
          <p>{animeMore.description}</p>
          <div className="meta-grid">
            <div>
              <span>Chiqqan yili</span>
              <strong>{animeMore.releaseYear}</strong>
            </div>
            <div>
              <span>Qismlar</span>
              <strong>{animeMore.episodes}</strong>
            </div>
            <div>
              <span>Davomiyligi</span>
              <strong>{animeMore.duration}</strong>
            </div>
          </div>
          <div className="tags">
            {animeMore.catalog?.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <article className="summary-box">
        <h2>Xulosa</h2>
        <p>{animeMore.xulosa}</p>
      </article>
    </section>
  );
};

export default AnimeMore;
