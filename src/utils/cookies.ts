export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(`${name}=`)) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
};

export const setCookie = (name: string, value: string, days: number = 1): void => {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`;
};

export const clearCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};
