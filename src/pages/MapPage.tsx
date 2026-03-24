import { Navigation, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import { BottomNav } from "../app/components/BottomNav";

type ApiFood = {
  id: number;
  name: string;
  rating: number | null;
  restaurant_name: string;
};

type ApiRestaurant = {
  id: number;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
};

type MapLocation = {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  foodCount: number;
  averageRating: number | null;
  sampleFoods: string[];
};

const CAMPUS_CENTER: [number, number] = [33.2107, -97.1498];

const fallbackCoordinates = [
  { latitude: 33.2118, longitude: -97.1512 },
  { latitude: 33.2126, longitude: -97.1493 },
  { latitude: 33.2101, longitude: -97.1487 },
  { latitude: 33.2096, longitude: -97.1509 },
  { latitude: 33.2089, longitude: -97.1489 },
  { latitude: 33.2113, longitude: -97.1478 },
  { latitude: 33.2098, longitude: -97.1518 },
];

const markerIcon = divIcon({
  className: "campus-map-marker-wrapper",
  html: '<div class="campus-map-marker"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -10],
});

function formatCoordinate(value: number) {
  return value.toFixed(4);
}

function getFallbackCoordinate(index: number) {
  return fallbackCoordinates[index % fallbackCoordinates.length];
}

function MapViewport({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
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
    return restaurants.map((restaurant, index) => {
      const fallback = getFallbackCoordinate(index);
      const latitude = restaurant.latitude ?? fallback.latitude;
      const longitude = restaurant.longitude ?? fallback.longitude;

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
        latitude,
        longitude,
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

  const mapCenter: [number, number] = selectedLocation
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : CAMPUS_CENTER;

  return (
    <div className="min-h-screen bg-[#dbe7de] flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#edf3ee] overflow-hidden relative rounded-3xl shadow-2xl">
        <div className="px-5 pt-10 pb-24">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">
              Satellite Map
            </p>
            <h1 className="text-[30px] font-bold text-gray-900 mt-2">
              UNT Campus Food Map
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Browse real satellite imagery and tap a marker for dining location details.
            </p>
          </div>

          <div className="rounded-[30px] bg-white p-4 shadow-sm">
            <div className="relative overflow-hidden rounded-[26px] border border-[#cfd9d2]">
              <div className="absolute left-4 top-4 z-[500] rounded-2xl bg-white/95 px-3 py-2 shadow">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Navigation className="w-4 h-4 text-green-700" />
                  UNT Dining Satellite View
                </div>
              </div>

              <MapContainer
                center={mapCenter}
                zoom={16}
                scrollWheelZoom
                className="h-[420px] w-full"
              >
                <MapViewport center={mapCenter} />
                <TileLayer
                  attribution='Tiles &copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <TileLayer
                  attribution='Labels &copy; Esri'
                  url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                />

                {locations.map((location) => (
                  <Marker
                    key={location.id}
                    position={[location.latitude, location.longitude]}
                    icon={markerIcon}
                    eventHandlers={{
                      click: () => setSelectedLocationId(location.id),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[180px]">
                        <div className="font-semibold text-gray-900">{location.name}</div>
                        <div className="mt-1 text-xs text-gray-600">{location.location}</div>
                        <div className="mt-2 text-xs text-gray-600">
                          {location.foodCount} food option{location.foodCount === 1 ? "" : "s"}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {loading ? (
            <div className="mt-5 rounded-[28px] bg-white p-5 shadow-sm text-sm text-gray-500">
              Loading campus food markers...
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-[28px] bg-white p-5 shadow-sm text-sm text-red-500">
              {error}
            </div>
          ) : null}

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

              <div className="mt-3 rounded-2xl bg-[#f6faf6] p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  General Info
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {selectedLocation.name} is pinned on the live satellite map using the
                  stored restaurant coordinates. You can zoom, pan, and click other markers
                  to compare food locations across campus.
                </p>
              </div>

              <div className="mt-4">
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
