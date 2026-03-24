import { Heart, Home, MapPin, Search, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: MapPin, label: "Map", path: "/map" },
  { icon: Heart, label: "Favorites" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 safe-area-bottom">
      <div className="max-w-[390px] mx-auto flex items-center justify-around">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = path ? location.pathname === path : false;

          return (
            <button
              key={label}
              onClick={() => {
                if (path) {
                  navigate(path);
                }
              }}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                isActive ? "text-green-500" : "text-gray-400"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
