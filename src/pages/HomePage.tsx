import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FoodCard } from "../app/components/FoodCard";
import { PopularCard } from "../app/components/PopularCard";
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

type ApiRestaurant = {
  id: number;
  name: string;
  location: string | null;
};

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

export default function HomePage() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  const surveyAnswers = JSON.parse(localStorage.getItem("surveyAnswers") || "{}");
  const userName = loggedInUser?.name || "User";
  const firstLetter = userName.charAt(0).toUpperCase();

  const [foods, setFoods] = useState<ApiFood[]>([]);
  const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const preferenceFilters = [
      surveyAnswers.dietaryRestriction,
      surveyAnswers.foodGoal,
    ].filter(Boolean);

    if (preferenceFilters.length > 0) {
      setSelectedFilters((prev) => [...new Set([...prev, ...preferenceFilters])]);
    }
  }, [surveyAnswers.dietaryRestriction, surveyAnswers.foodGoal]);

  useEffect(() => {
    const foodRoute = search.trim()
      ? `/api/search-foods?query=${encodeURIComponent(search.trim())}`
      : "/api/foods";

    setLoading(true);
    setError("");

    Promise.all([
      fetch(foodRoute).then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load foods");
        }

        return res.json();
      }),
      fetch("/api/restaurants").then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load restaurants");
        }

        return res.json();
      }),
    ])
      .then(([foodData, restaurantData]) => {
        setFoods(Array.isArray(foodData) ? foodData : []);
        setRestaurants(Array.isArray(restaurantData) ? restaurantData : []);
      })
      .catch(() => {
        setError("Unable to load food recommendations right now.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search]);

  const toggleFilter = (tag: string) => {
    setSelectedFilters((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const clearAll = () => {
    setSelectedFilters([]);
    setSearch("");
    setShowFilters(false);
  };

  const filteredFoods = useMemo(() => {
    return foods
      .map((food) => {
        const tags = food.category
          ? food.category
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [];

        const matchesFilters =
          selectedFilters.length === 0 ||
          selectedFilters.some((selectedTag) =>
            tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
          );

        let score = 0;

        if (matchesFilters) {
          score += 10;
        }

        if (search.trim()) {
          const normalizedSearch = search.trim().toLowerCase();

          if (food.name.toLowerCase().includes(normalizedSearch)) score += 20;
          if (food.restaurant_name.toLowerCase().includes(normalizedSearch)) score += 12;
          if (
            tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
          ) {
            score += 8;
          }
        }

        return {
          ...food,
          tags: tags.length > 0 ? tags : ["Campus Favorite"],
          score,
          matchesFilters,
        };
      })
      .filter((food) => food.matchesFilters)
      .sort((a, b) => {
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;

        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return ratingB - ratingA;
      });
  }, [foods, search, selectedFilters]);

  const popularPlaces = useMemo(() => {
    return restaurants.slice(0, 8).map((restaurant, index) => ({
      id: restaurant.id,
      name: restaurant.name,
      image: `https://picsum.photos/seed/restaurant-${restaurant.id}/400/240`,
      distance: restaurant.location || `Campus spot ${index + 1}`,
    }));
  }, [restaurants]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] h-[844px] bg-gray-50 overflow-hidden relative rounded-3xl shadow-2xl">
        <div className="h-full overflow-y-auto pb-20">
          <div className="bg-white px-5 pt-14 pb-6 rounded-b-3xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  <span className="text-gray-500 font-medium">Hello, </span>
                  {userName}
                </h1>
              </div>

              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                {firstLetter}
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600 mb-6">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-sm">UNT Campus</span>
            </div>

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search food or restaurant"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="relative w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-md hover:bg-green-600 active:scale-95 transition-all flex-shrink-0"
                >
                  <SlidersHorizontal className="w-5 h-5" />

                  {selectedFilters.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-white text-green-600 text-[11px] font-bold flex items-center justify-center shadow">
                      {selectedFilters.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="px-5 py-5">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {filterOptions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleFilter(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                      selectedFilters.includes(tag)
                        ? "bg-green-500 text-white border border-green-500"
                        : "bg-white text-gray-700 border border-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-5 mt-3 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Recommended For You
              </h2>

              <button
                onClick={clearAll}
                className="px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-sm font-semibold hover:bg-green-100 active:scale-95 transition-all"
              >
                Clear
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-gray-500">Loading recommendations...</p>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  image={food.image || fallbackImage}
                  name={food.name}
                  restaurant={food.restaurant_name}
                  location={food.restaurant_location || "Campus"}
                  tags={food.tags}
                  price={food.price}
                  rating={food.rating ?? 0}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No matching foods found.</p>
            )}
          </div>

          <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Popular Near You
              </h2>
              <button className="text-green-500 text-sm font-medium">
                See All
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {popularPlaces.length > 0 ? (
                popularPlaces.map((place) => (
                  <PopularCard key={place.id} {...place} />
                ))
              ) : (
                <p className="text-sm text-gray-500">No campus spots available yet.</p>
              )}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
