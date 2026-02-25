export const translations = {
  uz: {
    nav: {
      home: "Bosh sahifa",
      genres: "Janrlar",
      animeList: "Anime ro'yxati",
      menuAria: "Menyu",
    },
    common: {
      light: "Light",
      dark: "Dark",
      all: "Barchasi",
      episodesShort: "qism",
      loading: "Yuklanmoqda...",
      fetchError: "Serverdan ma'lumot olishda xatolik bo'ldi.",
      notFound: "Anime topilmadi.",
      backHome: "Bosh sahifaga qaytish",
      detailsSummary: "Xulosa",
    },
    home: {
      heroBadge: "Premium Anime Collection",
      heroTitle: "Anime olamiga yangi dizaynda sho'ng'ing",
      heroText:
        "Zamonaviy, tezkor va moslashuvchan platformada eng trend animelarni tomosha qilish uchun tanlang.",
      heroButton: "Anime ko'rish",
      genresTitle: "Janrlar",
      genresText: "Qiziqishingizga mos janrni tanlang.",
      searchTitle: "Anime qidiruvi",
      searchText: "Nomi yoki tavsif bo'yicha tez toping.",
      searchPlaceholder: "Masalan: Titan, Demon, Your Name...",
      resultTitle: "Topilgan animelar",
      resultText: (count) => `${count} ta natija chiqdi.`,
      emptyFilter: "Bu filter bo'yicha anime topilmadi.",
    },
    details: {
      releaseYear: "Chiqqan yili",
      episodes: "Qismlar",
      duration: "Davomiyligi",
    },
    footer: {
      about:
        "Eng yaxshi animelarni topish, tanlash va ilhom olish uchun zamonaviy platforma.",
      sections: "Bo'limlar",
      contact: "Aloqa",
      rights: "Barcha huquqlar himoyalangan.",
    },
  },
  ru: {
    nav: {
      home: "Главная",
      genres: "Жанры",
      animeList: "Список аниме",
      menuAria: "Меню",
    },
    common: {
      light: "Светлая",
      dark: "Темная",
      all: "Все",
      episodesShort: "эп.",
      loading: "Загрузка...",
      fetchError: "Ошибка при получении данных с сервера.",
      notFound: "Аниме не найдено.",
      backHome: "Вернуться на главную",
      detailsSummary: "Описание",
    },
    home: {
      heroBadge: "Премиум коллекция аниме",
      heroTitle: "Погрузитесь в мир аниме в новом дизайне",
      heroText:
        "Выбирайте самые трендовые аниме на современной, быстрой и адаптивной платформе.",
      heroButton: "Смотреть аниме",
      genresTitle: "Жанры",
      genresText: "Выберите жанр по интересам.",
      searchTitle: "Поиск аниме",
      searchText: "Быстрый поиск по названию или описанию.",
      searchPlaceholder: "Например: Titan, Demon, Your Name...",
      resultTitle: "Найденные аниме",
      resultText: (count) => `Найдено результатов: ${count}.`,
      emptyFilter: "По этому фильтру аниме не найдено.",
    },
    details: {
      releaseYear: "Год выхода",
      episodes: "Эпизоды",
      duration: "Длительность",
    },
    footer: {
      about:
        "Современная платформа, чтобы находить лучшие аниме, выбирать и вдохновляться.",
      sections: "Разделы",
      contact: "Контакты",
      rights: "Все права защищены.",
    },
  },
  en: {
    nav: {
      home: "Home",
      genres: "Genres",
      animeList: "Anime List",
      menuAria: "Menu",
    },
    common: {
      light: "Light",
      dark: "Dark",
      all: "All",
      episodesShort: "ep",
      loading: "Loading...",
      fetchError: "Failed to load data from server.",
      notFound: "Anime not found.",
      backHome: "Back to home",
      detailsSummary: "Summary",
    },
    home: {
      heroBadge: "Premium Anime Collection",
      heroTitle: "Dive into anime with a fresh new design",
      heroText:
        "Watch the most trending anime on a modern, fast, and responsive platform.",
      heroButton: "Watch Anime",
      genresTitle: "Genres",
      genresText: "Pick a genre that matches your interests.",
      searchTitle: "Anime Search",
      searchText: "Find quickly by title or description.",
      searchPlaceholder: "For example: Titan, Demon, Your Name...",
      resultTitle: "Found Anime",
      resultText: (count) => `${count} results found.`,
      emptyFilter: "No anime found for this filter.",
    },
    details: {
      releaseYear: "Release Year",
      episodes: "Episodes",
      duration: "Duration",
    },
    footer: {
      about:
        "A modern platform to discover top anime, choose what to watch, and get inspired.",
      sections: "Sections",
      contact: "Contact",
      rights: "All rights reserved.",
    },
  },
};

export const getPreferredLanguage = () => {
  const savedLanguage = localStorage.getItem("language");
  if (savedLanguage === "uz" || savedLanguage === "ru" || savedLanguage === "en") {
    return savedLanguage;
  }

  const browserLanguage = navigator.language?.toLowerCase() || "";
  if (browserLanguage.startsWith("ru")) return "ru";
  if (browserLanguage.startsWith("en")) return "en";
  return "uz";
};
