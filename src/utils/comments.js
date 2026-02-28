const COMMENTS_KEY = "anime_comments_v1";
export const COMMENTS_UPDATED_EVENT = "anime-comments-updated";

const parseCommentsStore = () => {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const saveCommentsStore = (data) => {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(COMMENTS_UPDATED_EVENT));
};

export const getCommentsForAnime = (animeId) => {
  const allComments = parseCommentsStore();
  const list = allComments[String(animeId)];
  return Array.isArray(list) ? list : [];
};

export const getAllComments = () => parseCommentsStore();

export const addCommentForAnime = (animeId, comment) => {
  const allComments = parseCommentsStore();
  const key = String(animeId);
  const current = Array.isArray(allComments[key]) ? allComments[key] : [];
  allComments[key] = [comment, ...current];
  saveCommentsStore(allComments);
};
