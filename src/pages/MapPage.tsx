import { Compass, MapPin, Navigation, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "../app/components/BottomNav";

type ApiFood = {
  id: number;
  name: string;
  category: string | null;
  price: number | null;
  rating: number | null;
  restaurant_name: string;
  restaurant_location: string | null;
};

type ApiRestaurant = {
  id: number;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
};

type MarkerPoint = {
  left: string;
  top: string;
};

type MapLocation = {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  marker: MarkerPoint;
  foodCount: number;
  averageRating: number | null;
  sampleFoods: string[];
};

const CAMPUS_CENTER = {
  latitude: 33.2107,
  longitude: -97.1498,
};

const fallbackCoordinates = [
  { latitude: 33.2118, longitude: -97.1512 },
  { latitude: 33.2126, longitude: -97.1493 },
  { latitude: 33.2101, longitude: -97.1487 },
  { latitude: 33.2096, longitude: -97.1509 },
  { latitude: 33.2089, longitude: -97.1489 },
  { latitude: 33.2113, longitude: -97.1478 },
  { latitude: 33.2098, longitude: -97.1518 },
];

function formatCoordinate(value: number) {
  return value.toFixed(4);
}

function getFallbackCoordinate(index: number) {
  return fallbackCoordinates[index % fallbackCoordinates.length];
}

function normalizeCoordinate(
  value: number,
  min: number,
  max: number,
  outputMin: number,
  outputMax: number
) {
  if (min === max) {
    return (outputMin + outputMax) / 2;
  }

  const normalized = (value - min) / (max - min);
  return outputMin + normalized * (outputMax - outputMin);
}

export default function MapPage() {
  const [foods, setFoods] = useState<ApiFood[]>([]);
  const [restaurants, setRestaurants] = useState<ApiRestaurant[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    Promise.all([
      fetch("/api/foods").then((res) => {
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
        setError("Unable to load campus food locations right now.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const locations = useMemo<MapLocation[]>(() => {
    const locationsWithCoordinates = restaurants.map((restaurant, index) => {
      const fallback = getFallbackCoordinate(index);

      return {
        ...restaurant,
        latitude: restaurant.latitude ?? fallback.latitude,
        longitude: restaurant.longitude ?? fallback.longitude,
      };
    });

    const latitudes = locationsWithCoordinates.map((restaurant) => restaurant.latitude);
    const longitudes = locationsWithCoordinates.map((restaurant) => restaurant.longitude);

    const minLatitude = Math.min(...latitudes, CAMPUS_CENTER.latitude - 0.003);
    const maxLatitude = Math.max(...latitudes, CAMPUS_CENTER.latitude + 0.003);
    const minLongitude = Math.min(...longitudes, CAMPUS_CENTER.longitude - 0.003);
    const maxLongitude = Math.max(...longitudes, CAMPUS_CENTER.longitude + 0.003);

    return locationsWithCoordinates.map((restaurant) => {
      const restaurantFoods = foods.filter(
        (food) => food.restaurant_name === restaurant.name
      );

      const ratings = restaurantFoods
        .map((food) => food.rating)
        .filter((rating): rating is number => rating != null);

      const averageRating =
        ratings.length > 0
          ? Number(
              (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
            )
          : null;

      return {
        id: restaurant.id,
        name: restaurant.name,
        location: restaurant.location || "UNT Campus",
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        marker: {
          left: `${normalizeCoordinate(
            restaurant.longitude,
            minLongitude,
            maxLongitude,
            16,
            84
          )}%`,
          top: `${normalizeCoordinate(
            restaurant.latitude,
            minLatitude,
            maxLatitude,
            76,
            18
          )}%`,
        },
        foodCount: restaurantFoods.length,
        averageRating,
        sampleFoods: restaurantFoods.slice(0, 3).map((food) => food.name),
      };
    });
  }, [foods, restaurants]);

  useEffect(() => {
    if (locations.length > 0 && selectedLocationId == null) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, selectedLocationId]);

  const selectedLocation =
    locations.find((location) => location.id === selectedLocationId) || null;

  return (
    <div className="min-h-screen bg-[#dfece2] flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#e9f2eb] overflow-hidden relative rounded-3xl shadow-2xl">
        <div className="px-5 pt-10 pb-24">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">
                Campus Map
              </p>
              <h1 className="text-[30px] font-bold text-gray-900 mt-2">
                Food Around UNT
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Markers use restaurant coordinates and open location details when tapped.
              </p>
            </div>

            <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
              <Compass className="w-5 h-5 text-green-700" />
            </div>
          </div>

          <div className="rounded-[30px] bg-white p-4 shadow-sm">
            <div className="relative h-[400px] overflow-hidden rounded-[26px] border border-[#c9d8cb] bg-[#e6efe7]">
              <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(74,117,92,0.08)_25%,rgba(74,117,92,0.08)_26%,transparent_27%,transparent_74%,rgba(74,117,92,0.08)_75%,rgba(74,117,92,0.08)_76%,transparent_77%),linear-gradient(90deg,transparent_24%,rgba(74,117,92,0.08)_25%,rgba(74,117,92,0.08)_26%,transparent_27%,transparent_74%,rgba(74,117,92,0.08)_75%,rgba(74,117,92,0.08)_76%,transparent_77%)] bg-[length:72px_72px]" />

              <div className="absolute left-[8%] top-[12%] h-24 w-24 rounded-[28px] border border-[#c5d5c8] bg-[#d6e5d7]" />
              <div className="absolute left-[34%] top-[16%] h-20 w-32 rounded-[24px] border border-[#c5d5c8] bg-[#d6e5d7]" />
              <div className="absolute left-[70%] top-[12%] h-16 w-14 rounded-[20px] border border-[#c5d5c8] bg-[#d6e5d7]" />
              <div className="absolute left-[12%] top-[54%] h-20 w-28 rounded-[26px] border border-[#c5d5c8] bg-[#d6e5d7]" />
              <div className="absolute left-[54%] top-[56%] h-24 w-24 rounded-[26px] border border-[#c5d5c8] bg-[#d6e5d7]" />

              <div className="absolute left-[6%] top-[38%] h-5 w-[88%] rotate-[-5deg] rounded-full bg-[#c7d3c8]" />
              <div className="absolute left-[12%] top-[68%] h-4 w-[74%] rotate-[14deg] rounded-full bg-[#c7d3c8]" />
              <div className="absolute left-[46%] top-[8%] h-[82%] w-4 rounded-full bg-[#c7d3c8]" />

              <div className="absolute left-4 top-4 rounded-2xl bg-white/90 px-3 py-2 shadow">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Navigation className="w-4 h-4 text-green-700" />
                  UNT Dining Coordinates
                </div>
              </div>

              <div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 px-3 py-2 shadow text-[11px] text-gray-600">
                <div>Lat {formatCoordinate(CAMPUS_CENTER.latitude)}</div>
                <div>Lng {formatCoordinate(CAMPUS_CENTER.longitude)}</div>
              </div>

              <div className="absolute right-4 top-16 space-y-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                <div className="rounded-full bg-white/80 px-2 py-1 shadow">Union Dr</div>
                <div className="rounded-full bg-white/80 px-2 py-1 shadow">Library Mall</div>
                <div className="rounded-full bg-white/80 px-2 py-1 shadow">Stadium Walk</div>
              </div>

              {!loading &&
                !error &&
                locations.map((location) => {
                  const isActive = selectedLocationId === location.id;

                  return (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => setSelectedLocationId(location.id)}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: location.marker.left, top: location.marker.top }}
                    >
                      <div
                        className={`relative flex flex-col items-center transition-transform ${
                          isActive ? "scale-110" : "scale-100"
                        }`}
                      >
                        <div
                          className={`rounded-full p-2.5 shadow-lg ${
                            isActive
                              ? "bg-[#1f8d57] text-white"
                              : "bg-white text-[#1f8d57]"
                          }`}
                        >
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div
                          className={`mt-2 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow ${
                            isActive
                              ? "bg-[#1f8d57] text-white"
                              : "bg-white/95 text-gray-700"
                          }`}
                        >
                          {location.name}
                        </div>
                      </div>
                    </button>
                  );
                })}

              {loading ? (
                <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-white/92 p-4 text-sm text-gray-500 shadow">
                  Loading campus food markers...
                </div>
              ) : null}

              {error ? (
                <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-white/92 p-4 text-sm text-red-500 shadow">
                  {error}
                </div>
              ) : null}
            </div>
          </div>

          {selectedLocation && !loading && !error ? (
            <div className="mt-5 rounded-[28px] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedLocation.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedLocation.location}
                  </p>
                </div>

                <div className="rounded-2xl bg-green-50 px-3 py-2 text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-green-700">
                    Avg Rating
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-900">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {selectedLocation.averageRating ?? "N/A"}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#f6faf6] p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Latitude
                  </div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">
                    {formatCoordinate(selectedLocation.latitude)}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f6faf6] p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Longitude
                  </div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">
                    {formatCoordinate(selectedLocation.longitude)}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#f6faf6] p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Food Count
                  </div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">
                    {selectedLocation.foodCount}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#f6faf6] p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Marker Status
                  </div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">
                    Active on Map
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  General Info
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {selectedLocation.name} is plotted using stored restaurant coordinates.
                  Select another marker to compare nearby dining spots and see which
                  location best matches what you want to eat.
                </p>
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Featured Foods
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedLocation.sampleFoods.length > 0 ? (
                    selectedLocation.sampleFoods.map((foodName) => (
                      <span
                        key={foodName}
                        className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"
                      >
                        {foodName}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      No food items are saved for this location yet.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
