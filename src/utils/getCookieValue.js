export function getCookieValue(cookieName, cookieStore) {
  if (!cookieStore || typeof cookieStore !== "string") {
    return null;
  }

  const targetCookie = cookieStore
    .split("; ")
    .find((cookie) => cookie.includes(cookieName));

  if (typeof targetCookie === "string") {
    const rawValue = targetCookie.substring(cookieName.length + 1);
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }

  return null;
}
