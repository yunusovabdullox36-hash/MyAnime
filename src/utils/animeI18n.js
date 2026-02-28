export const getLocalizedField = (value, language) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return (
      value[language] ??
      value.uz ??
      value.ru ??
      value.en ??
      Object.values(value)[0] ??
      ""
    );
  }

  return value ?? "";
};
