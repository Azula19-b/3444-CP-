import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { FoodCard } from "../app/components/FoodCard";
import { PopularCard } from "../app/components/PopularCard";
import { BottomNav } from "../app/components/BottomNav";

const recommendedFoods = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1675092789086-4bd2b93ffc69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwYnVkZGhhJTIwYm93bCUyMHZlZ2FufGVufDF8fHx8MTc3MzIwNjM3NXww&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Rainbow Buddha Bowl",
    restaurant: "Green Leaf Cafe",
    tags: ["Vegan", "Healthy"],
    calories: 420,
    rating: 4.8,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1604909052743-94e838986d24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMHNhbGFkfGVufDF8fHx8MTc3MzIwMDU1MHww&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Grilled Chicken Salad",
    restaurant: "Campus Grill",
    tags: ["High Protein", "Healthy"],
    calories: 380,
    rating: 4.6,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1644364935906-792b2245a2c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxhbCUyMGtlYmFiJTIwcGxhdGV8ZW58MXx8fHwxNzczMjA2Mzc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Mediterranean Plate",
    restaurant: "Sultan's Kitchen",
    tags: ["Halal", "High Protein"],
    calories: 550,
    rating: 4.9,
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1653379557259-48a725b08460?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YXJpYW4lMjBidXJyaXRvfGVufDF8fHx8MTc3MzIwNjM3Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Veggie Burrito Bowl",
    restaurant: "Burrito Bar",
    tags: ["Vegetarian", "Healthy"],
    calories: 465,
    rating: 4.7,
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1561997315-6d0610a96b9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90ZWluJTIwc21vb3RoaWUlMjBib3dsfGVufDF8fHx8MTc3MzIwNjM3Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Protein Power Bowl",
    restaurant: "Smoothie Station",
    tags: ["High Protein", "Vegan"],
    calories: 340,
    rating: 4.5,
  },
];

const popularPlaces = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1685879226944-30c32b186aa7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwY2FmZXxlbnwxfHx8fDE3NzMyMDYzNzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Student Union Cafe",
    distance: "0.2 mi",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1685040235380-a42a129ade4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjByZXN0YXVyYW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzczMTIwMjE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Library Bistro",
    distance: "0.4 mi",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1678530365665-6aab72086a9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwZGluaW5nfGVufDF8fHx8MTc3MzIwNjM3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    name: "Eagle's Nest Diner",
    distance: "0.5 mi",
  },
];

const filterOptions = [
  "Halal",
  "Vegan",
  "Vegetarian",
  "Gluten-Free",
  "Healthy",
  "High Protein",
];

export default function HomePage() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  const userName = loggedInUser?.name || "User";
  const firstLetter = userName.charAt(0).toUpperCase();

  const [search, setSearch] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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
    const normalizedSearch = search.trim().toLowerCase();

    const foodsWithScore = recommendedFoods.map((food) => {
      let score = 0;

      if (selectedFilters.length > 0) {
        selectedFilters.forEach((selectedTag) => {
          if (food.tags.includes(selectedTag)) {
            score += 10;
          }
        });
      }

      if (normalizedSearch) {
        const nameMatch = food.name.toLowerCase().includes(normalizedSearch);
        const restaurantMatch = food.restaurant
          .toLowerCase()
          .includes(normalizedSearch);
        const tagMatch = food.tags.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch)
        );

        if (nameMatch) score += 20;
        if (restaurantMatch) score += 12;
        if (tagMatch) score += 8;
      }

      return { ...food, score };
    });

    const visibleFoods = foodsWithScore.filter((food) => {
      const matchesSearch =
        !normalizedSearch ||
        food.name.toLowerCase().includes(normalizedSearch) ||
        food.restaurant.toLowerCase().includes(normalizedSearch) ||
        food.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

      const matchesFilters =
        selectedFilters.length === 0 ||
        selectedFilters.some((selectedTag) => food.tags.includes(selectedTag));

      return matchesSearch && matchesFilters;
    });

    return visibleFoods.sort((a, b) => b.score - a.score);
  }, [search, selectedFilters]);

  const filteredPlaces = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return popularPlaces;

    return popularPlaces.filter((place) =>
      place.name.toLowerCase().includes(normalizedSearch)
    );
  }, [search]);

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

            <div>
              {filteredFoods.length > 0 ? (
                filteredFoods.map((food) => <FoodCard key={food.id} {...food} />)
              ) : (
                <p className="text-sm text-gray-500">No matching foods found.</p>
              )}
            </div>
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
              {filteredPlaces.length > 0 ? (
                filteredPlaces.map((place) => (
                  <PopularCard key={place.id} {...place} />
                ))
              ) : (
                <p className="text-sm text-gray-500">No matching places found.</p>
              )}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
