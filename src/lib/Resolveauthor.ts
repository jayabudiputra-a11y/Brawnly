export function resolveAuthorName(article: any, defaultName = "Brawnly Editorial"): string {
  const { author, author_name } = article ?? {};
  if (typeof author === "string" && author.trim()) return author.trim();
  if (author && typeof author === "object") {
    const username = typeof author.username === "string" ? author.username.trim() : "";
    const name     = typeof author.name     === "string" ? author.name.trim()     : "";
    if (username) return username;
    if (name)     return name;
  }
  if (typeof author_name === "string" && author_name.trim()) return author_name.trim();
  return defaultName;
}