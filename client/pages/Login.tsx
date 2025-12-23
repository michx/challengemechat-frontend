import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Sparkles, Phone, Check } from "lucide-react";

type AuthStep = "phone" | "email-password" | "otp";

export default function Login() {
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const validatePhone = (phoneNumber: string): boolean => {
    // Basic validation for phone numbers
    const phoneRegex = /^\+?1?\d{9,15}$/;
    return phoneRegex.test(phoneNumber.replace(/\s|-|\(|\)/g, ""));
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone) {
      setError("Please enter your phone number");
      return;
    }

    if (!validatePhone(phone)) {
      setError(
        "Please enter a valid phone number (e.g., +1234567890 or 1234567890)",
      );
      return;
    }
    // Development Bypass: Skip OTP for specific test number
    if (phone === "+19999999999") {
      setStep("email-password");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        mode: 'same-origin',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      setOtpSent(true);
      setStep("otp");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }


    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });

      if (!response.ok) {
        throw new Error("Invalid or expired OTP");
      }

      setStep("email-password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userPhone", phone);
      setIsLoading(false);
      navigate("/");
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Sparkles size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Chat Hub</h1>
          <p className="text-gray-600 mt-2">
            Access your conversations with multiple AI models
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            <div
              className={`flex-1 h-2 rounded-full transition-colors ${
                step === "phone" || step === "otp" || step === "email-password"
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full transition-colors ${
                step === "otp" || step === "email-password"
                  ? "bg-blue-600"
                  : "bg-gray-300"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full transition-colors ${
                step === "email-password" ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          </div>

          {/* Step 1: Phone Number */}
          {step === "phone" && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We'll send a verification code to this number
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-200 shadow-md hover:shadow-lg -translate-y-0 hover:-translate-y-1 active:translate-y-0 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </span>
                ) : (
                  "Send Verification Code"
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Verification Code
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Enter the 6-digit code sent to {phone}
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-center text-2xl letter-spacing tracking-widest font-mono"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-200 shadow-md hover:shadow-lg -translate-y-0 hover:-translate-y-1 active:translate-y-0 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </span>
                ) : (
                  "Verify Code"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                }}
                className="w-full py-2 text-blue-600 font-medium hover:text-blue-700 transition"
              >
                Back
              </button>
            </form>
          )}

          {/* Step 3: Email & Password */}
          {step === "email-password" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mb-4">
                <Check size={18} className="text-green-600" />
                <p className="text-sm text-green-700 font-medium">
                  Phone verified! Complete your account setup.
                </p>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-200 shadow-md hover:shadow-lg -translate-y-0 hover:-translate-y-1 active:translate-y-0 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Completing setup...
                  </span>
                ) : (
                  "Complete Login"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setPhone("");
                  setOtp("");
                  setOtpSent(false);
                  setError("");
                }}
                className="w-full py-2 text-blue-600 font-medium hover:text-blue-700 transition"
              >
                Start Over
              </button>
            </form>
          )}

          {/* Demo Info */}
          {step !== "email-password" && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Demo Mode:
              </p>
              <p className="text-xs text-gray-600">
                This demo uses OTP verification via Twilio SMS. For testing, use
                any valid phone number format (e.g., +1234567890).
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 AI Chat Hub. All rights reserved.
        </p>
      </div>
    </div>
  );
}
