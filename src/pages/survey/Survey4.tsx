import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Survey4() {
  const navigate = useNavigate();

  const savedSurvey = JSON.parse(localStorage.getItem("surveyAnswers") || "{}");
  const [selected, setSelected] = useState<string>(savedSurvey.goal || "");

  const goals = [
    "Eat Healthy",
    "Build Muscle",
    "Lose Weight",
    "Quick Meals",
    "Explore New Foods",
  ];

  const handleContinue = () => {
    const existing = JSON.parse(localStorage.getItem("surveyAnswers") || "{}");

    localStorage.setItem(
      "surveyAnswers",
      JSON.stringify({
        ...existing,
        goal: selected,
      })
    );

    navigate("/survey5");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
      <div className="w-full max-w-[390px] bg-white rounded-[28px] shadow-sm px-6 py-8">
        <h2 className="text-[24px] font-bold text-[#1f2937] mb-2">
          What is your goal?
        </h2>

        <p className="text-gray-500 text-[15px] mb-6">
          Pick the one that matters most to you.
        </p>

        <div className="flex flex-col gap-3 mb-8">
          {goals.map((goal) => (
            <button
              key={goal}
              onClick={() => setSelected(goal)}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${
                selected === goal
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {goal}
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
            onClick={() => navigate("/survey5")}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
