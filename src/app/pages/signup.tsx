import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setMessage("Please fill in all fields.");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Signup failed.");
        setMessageType("error");
        return;
      }

      setMessage("Sign up successful.");
      setMessageType("success");

      setTimeout(() => {
        navigate("/");
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

          <h1 className="text-[30px] leading-tight font-bold text-[#1f2937] mb-1 text-center">
            Create Account
          </h1>

          <p className="text-gray-500 text-[16px] text-center">
            Join QuickBytes today.
          </p>

        </div>

        <form onSubmit={handleSignup} noValidate className="space-y-4">

          <div>
            <label className="block text-[16px] font-semibold text-[#374151] mb-2">
              Name
            </label>

            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-[58px] rounded-[18px] border border-gray-200 px-4 text-[18px] bg-white outline-none focus:border-[#15c65b]"
            />
          </div>

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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[58px] rounded-[18px] border border-gray-200 px-4 text-[18px] bg-white outline-none focus:border-[#15c65b]"
            />
          </div>

          <div>
            <label className="block text-[16px] font-semibold text-[#374151] mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-[58px] rounded-[18px] border border-gray-200 px-4 text-[18px] bg-white outline-none focus:border-[#15c65b]"
            />
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
            Sign Up
          </button>

        </form>

        <div className="mt-6 text-center text-[16px] text-gray-500">

          Already have an account?{" "}

          <button
            onClick={() => navigate("/")}
            className="text-[#15c65b] font-semibold"
          >
            Login
          </button>

        </div>

      </div>
    </div>
  );
}
