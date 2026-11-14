export function readStoredJson<T>(key: string, fallback: T): T {
  const value = localStorage.getItem(key);
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    // A malformed browser value should not prevent the application from loading.
    localStorage.removeItem(key);
    return fallback;
  }
}
