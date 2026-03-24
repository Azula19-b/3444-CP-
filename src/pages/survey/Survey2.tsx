import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Survey2() {
  const navigate = useNavigate();

  const savedSurvey = JSON.parse(localStorage.getItem("surveyAnswers") || "{}");
  const [selected, setSelected] = useState<string[]>(
    savedSurvey.foodPreferences || []
  );

  const options = [
    "Halal",
    "Vegan",
    "Vegetarian",
    "Healthy",
    "High Protein",
    "Gluten Free",
  ];

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((x) => x !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const handleContinue = () => {
    const existing = JSON.parse(localStorage.getItem("surveyAnswers") || "{}");

    localStorage.setItem(
      "surveyAnswers",
      JSON.stringify({
        ...existing,
        foodPreferences: selected,
      })
    );

    navigate("/survey3");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
      <div className="w-full max-w-[390px] bg-white rounded-[28px] shadow-sm px-6 py-8">
        <h2 className="text-[24px] font-bold text-[#1f2937] mb-2">
          What kind of food do you like?
        </h2>

        <p className="text-gray-500 text-[15px] mb-6">
          You can choose more than one.
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => toggle(option)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                selected.includes(option)
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleContinue}
            className="w-full h-[54px] rounded-[18px] bg-[#10c84f] text-white text-[18px] font-semibold hover:bg-[#0fb849] transition-colors"
          >
            Continue
          </button>

          <button
            onClick={() => navigate("/survey3")}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
