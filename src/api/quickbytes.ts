export type Food = {
  id: number;
  restaurant_id: number;
  name: string;
  category: string | null;
  price: number | null;
  rating: number | null;
  image: string | null;
  restaurant_name: string;
  restaurant_location: string | null;
};

export type Restaurant = {
  id: number;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`QuickBytes API request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export function getFoods(query = "") {
  const normalizedQuery = query.trim();
  const path = normalizedQuery
    ? `/api/search-foods?query=${encodeURIComponent(normalizedQuery)}`
    : "/api/foods";
  return getJson<Food[]>(path);
}

export function getRestaurants() {
  return getJson<Restaurant[]>("/api/restaurants");
}
