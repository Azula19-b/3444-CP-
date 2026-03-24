import { Heart, Search, SlidersHorizontal, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "../app/components/BottomNav";

type ApiFood = {
  id: number;
  name: string;
  category: string | null;
  price: number | null;
  rating: number | null;
  image: string | null;
  restaurant_name: string;
  restaurant_location: string | null;
};

type SortOption = "rating" | "price" | "name";

const filterOptions = [
  "Halal",
  "Vegan",
  "Vegetarian",
  "Gluten-Free",
  "Healthy",
  "High Protein",
];

const fallbackImage =
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1080&q=80";

export default function SearchPage() {
  const [foods, setFoods] = useState<ApiFood[]>([]);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    const stored = localStorage.getItem("favoriteFoods");
    return stored ? JSON.parse(stored) : {};
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("favoriteFoods", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const route = submittedSearch.trim()
      ? `/api/search-foods?query=${encodeURIComponent(submittedSearch.trim())}`
      : "/api/foods";

    setLoading(true);
    setError("");

    fetch(route)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load search results");
        }

        return res.json();
      })
      .then((data) => {
        setFoods(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Unable to load search results right now.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [submittedSearch]);

  const displayedFoods = useMemo(() => {
    const filtered = foods.filter((food) => {
      const tags = food.category
        ? food.category.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

      if (selectedFilters.length === 0) {
        return true;
      }

      return selectedFilters.some((selectedTag) =>
        tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    });

    const sorted = [...filtered];

    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "price") {
      sorted.sort(
        (a, b) =>
          (a.price ?? Number.MAX_SAFE_INTEGER) -
          (b.price ?? Number.MAX_SAFE_INTEGER)
      );
    } else {
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return sorted;
  }, [foods, selectedFilters, sortBy]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(search.trim());
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((item) => item !== filter) : [...prev, filter]
    );
  };

  const toggleFavorite = (foodId: number) => {
    setFavorites((prev) => ({
      ...prev,
      [foodId]: !prev[foodId],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] min-h-[844px] bg-gray-50 overflow-hidden relative rounded-3xl shadow-2xl">
        <div className="px-5 pt-10 pb-24">
          <div className="flex items-center gap-3 mb-5">
            <form onSubmit={handleSubmit} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search food or restaurants"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </form>

            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-md">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
          </div>

          <div className="mb-5">
            <h1 className="text-[28px] font-bold text-gray-900">Search</h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading
                ? "Searching..."
                : `${displayedFoods.length} result${displayedFoods.length === 1 ? "" : "s"} ${
                    submittedSearch ? `for "${submittedSearch}"` : "available on campus"
                  }`}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => toggleFilter(filter)}
                  className={`px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap border ${
                    selectedFilters.includes(filter)
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700"
            >
              <option value="rating">Top Rated</option>
              <option value="price">Lowest Price</option>
              <option value="name">A-Z</option>
            </select>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-3xl p-5 text-sm text-gray-500 shadow-sm">
                Loading results...
              </div>
            ) : error ? (
              <div className="bg-white rounded-3xl p-5 text-sm text-red-500 shadow-sm">
                {error}
              </div>
            ) : displayedFoods.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                <p className="text-lg font-semibold text-gray-900 mb-1">No results found</p>
                <p className="text-sm text-gray-500">
                  Try another search or remove a filter.
                </p>
              </div>
            ) : (
              displayedFoods.map((food) => {
                const tags = food.category
                  ? food.category.split(",").map((tag) => tag.trim()).filter(Boolean)
                  : ["Campus Favorite"];

                return (
                  <article key={food.id} className="bg-white rounded-3xl shadow-sm overflow-hidden">
                    <div className="relative h-44">
                      <img
                        src={food.image || fallbackImage}
                        alt={food.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => toggleFavorite(food.id)}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favorites[food.id] ? "fill-red-500 text-red-500" : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-semibold text-gray-900">{food.name}</h2>
                          <p className="text-sm text-gray-500">
                            {food.restaurant_name || "Unknown restaurant"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-700">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {food.rating ?? "N/A"}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-3">
                        <span>{food.restaurant_location || "Location unavailable"}</span>
                        <span>|</span>
                        <span>
                          {food.price != null
                            ? `$${Number(food.price).toFixed(2)}`
                            : "Price unavailable"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
