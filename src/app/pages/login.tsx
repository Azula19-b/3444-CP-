import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!email.trim() || !password.trim()) {
      setMessage("Please fill in all fields.");
      setMessageType("error");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Invalid email or password.");
        setMessageType("error");
        return;
      }

      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
      localStorage.setItem("rememberMe", JSON.stringify(rememberMe));

      setMessage("Login successful.");
      setMessageType("success");

      setTimeout(() => {
        navigate("/survey1");
      }, 800);
    } catch (error) {
      setMessage("Unable to connect to the server.");
      setMessageType("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-[390px] bg-white rounded-[28px] shadow-sm px-6 py-8">

        <div className="flex flex-col items-center mb-7">

          <div className="w-18 h-18 rounded-[22px] bg-[#15c65b] text-white flex items-center justify-center text-2xl font-bold mb-4">
            QB
          </div>

          <h1 className="text-[34px] leading-tight font-bold text-[#1f2937] mb-1">
            QuickBytes
          </h1>

          <p className="text-gray-500 text-[16px]">
            Find food that fits you.
          </p>

        </div>

        <form onSubmit={handleLogin} noValidate className="space-y-4">

          <div>
            <label className="block text-[16px] font-semibold text-[#374151] mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="you@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[58px] rounded-[18px] border border-gray-200 px-4 text-[18px] bg-white outline-none focus:border-[#15c65b]"
            />
          </div>

          <div>
            <label className="block text-[16px] font-semibold text-[#374151] mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[58px] rounded-[18px] border border-gray-200 px-4 text-[18px] bg-white outline-none focus:border-[#15c65b]"
            />
          </div>

          <div className="flex items-center justify-between text-[14px] text-gray-500">

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="text-[#15c65b] font-medium"
            >
              Forgot password?
            </button>

          </div>

          {message && (
            <p
              className={`text-sm font-medium ${
                messageType === "success"
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full h-[58px] rounded-[18px] bg-[#10c84f] text-white text-[22px] font-semibold hover:bg-[#0fb849] transition-colors"
          >
            Login
          </button>

        </form>

        <div className="mt-6 text-center text-[16px] text-gray-500">

          Don&apos;t have an account?{" "}

          <button
            onClick={() => navigate("/signup")}
            className="text-[#15c65b] font-semibold"
          >
            Sign Up
          </button>

        </div>

      </div>
    </div>
  );
}
