import { Home, Search, MapPin, Heart, User } from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "Home" },
  { icon: Search, label: "Search" },
  { icon: MapPin, label: "Map" },
  { icon: Heart, label: "Favorites" },
  { icon: User, label: "Profile" },
];

export function BottomNav() {
  const [activeTab, setActiveTab] = useState("Home");

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 safe-area-bottom">
      <div className="max-w-[390px] mx-auto flex items-center justify-around">
        {navItems.map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => setActiveTab(label)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              activeTab === label 
                ? 'text-green-500' 
                : 'text-gray-400'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
