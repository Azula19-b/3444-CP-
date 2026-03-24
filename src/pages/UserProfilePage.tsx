import {
  Bell,
  ChevronRight,
  CircleHelp,
  Heart,
  Leaf,
  LogOut,
  User,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "../app/components/BottomNav";

const menuItems = [
  { icon: User, label: "Edit Profile" },
  { icon: Heart, label: "Saved Favorites" },
  { icon: Leaf, label: "Dietary Preferences" },
  { icon: Bell, label: "Notifications" },
  { icon: CircleHelp, label: "Help / FAQ" },
];

export default function UserProfilePage() {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  const surveyAnswers = JSON.parse(localStorage.getItem("surveyAnswers") || "{}");

  const preferenceTags = useMemo(() => {
    const selections = [
      surveyAnswers.dietaryRestriction,
      surveyAnswers.goal,
      ...(Array.isArray(surveyAnswers.foodPreferences)
        ? surveyAnswers.foodPreferences
        : []),
    ]
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);

    if (selections.length === 0) {
      return ["Healthy Choices", "Campus Dining"];
    }

    return selections;
  }, [
    surveyAnswers.dietaryRestriction,
    surveyAnswers.goal,
    surveyAnswers.foodPreferences,
  ]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("rememberMe");
    navigate("/");
  };

  const initials = (loggedInUser?.name || "QuickBytes")
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f4f6f5] flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] min-h-[844px] bg-[#f4f6f5] overflow-hidden relative rounded-3xl shadow-2xl">
        <div className="px-5 pt-10 pb-24">
          <div className="text-center text-[22px] font-semibold text-[#2ecc71] mb-5">
            QuickBytes
          </div>

          <div className="bg-white rounded-[28px] p-7 shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                {loggedInUser?.name || "Jordan Davis"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {loggedInUser?.email || "jordan.davis@email.com"}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Dietary Preferences
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {preferenceTags.map((preference) => (
                  <div
                    key={preference}
                    className="bg-[#f4f6f5] px-3 py-3 rounded-xl text-center text-sm text-gray-700"
                  >
                    {preference}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <h3 className="font-semibold text-gray-900 mb-3">Settings</h3>

              <div className="space-y-1">
                {menuItems.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    className="w-full flex items-center rounded-xl px-3 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-[#2ecc71] mr-3" />
                    <span className="text-sm text-gray-700">{label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full mt-7 rounded-2xl bg-[#2ecc71] hover:bg-[#27ae60] text-white font-semibold py-3.5 flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
