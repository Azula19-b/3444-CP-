import { useNavigate } from "react-router-dom";

export default function Survey1() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
      <div className="w-full max-w-[390px] bg-white rounded-[28px] shadow-sm px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-18 h-18 rounded-[22px] bg-[#15c65b] text-white flex items-center justify-center text-2xl font-bold mb-4">
            QB
          </div>

          <h1 className="text-[30px] font-bold text-[#1f2937] mb-2">
            Welcome to QuickBytes
          </h1>

          <p className="text-gray-500 text-[16px] mb-8">
            Let&apos;s personalize your food recommendations.
            This will only take a few seconds.
          </p>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => navigate("/survey2")}
              className="w-full h-[54px] rounded-[18px] bg-[#10c84f] text-white text-[18px] font-semibold hover:bg-[#0fb849] transition-colors"
            >
              Start
            </button>

            <button
              onClick={() => navigate("/home")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
