import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Bot, Phone, Check } from "lucide-react";

type AuthStep = "phone" | "email-password" | "otp";

export default function Login() {
  const [step, setStep] = useState<AuthStep>("phone");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
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

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid password");
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", username);
      localStorage.setItem("userPhone", phone);
      navigate("/");
    } catch (err) {
      setError("Invalid password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-mono dark" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('https://images.pexels.com/photos/163100/matrix-wallpaper-163100.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-green-600 rounded-full">
              <Bot size={28} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight uppercase">
            Challenge<span className="text-primary">_</span>Me<span className="text-primary">_</span>Chat
          </h1>
          <p className="text-muted-foreground mt-2">
            Do your best to hack this chat!!
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-black/60 backdrop-blur-md border border-green-500/30 rounded-2xl shadow-xl p-6 md:p-8">
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-6">
            <div
              className={`flex-1 h-2 rounded-full transition-colors ${
                step === "phone" || step === "otp" || step === "email-password"
                  ? "bg-green-500"
                  : "bg-gray-700"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full transition-colors ${
                step === "otp" || step === "email-password"
                  ? "bg-green-500"
                  : "bg-gray-700"
              }`}
            />
            <div
              className={`flex-1 h-2 rounded-full transition-colors ${
                step === "email-password" ? "bg-green-500" : "bg-gray-700"
              }`}
            />
          </div>

          {/* Step 1: Phone Number */}
          {step === "phone" && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-3 text-green-400/50"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 pr-4 py-2 bg-black/40 border-green-500/30 text-green-400 placeholder:text-green-700/50 focus:ring-green-500/50 rounded-lg transition"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
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
                className="w-full py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-500 transition-all duration-200 shadow-md hover:shadow-lg -translate-y-0 hover:-translate-y-1 active:translate-y-0 disabled:cursor-not-allowed"
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
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Verification Code
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  Enter the 6-digit code sent to {phone}
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-black/40 border-green-500/30 text-green-400 placeholder:text-green-700/50 focus:ring-green-500/50 rounded-lg transition text-center text-2xl tracking-widest font-mono"
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
                className="w-full py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-500 transition-all duration-200 shadow-md hover:shadow-lg -translate-y-0 hover:-translate-y-1 active:translate-y-0 disabled:cursor-not-allowed"
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
                className="w-full py-2 text-green-400 font-medium hover:text-green-300 transition"
              >
                Back
              </button>
            </form>
          )}

          {/* Step 3: Email & Password */}
          {step === "email-password" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="p-3 bg-green-900/30 border border-green-500/20 rounded-lg flex items-center gap-2 mb-4">
                <Check size={18} className="text-green-500" />
                <p className="text-sm text-green-300 font-medium">
                  Phone verified! Complete your account setup.
                </p>
              </div>

              {/* Username Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-3 text-green-400/50"
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full pl-10 pr-4 py-2 bg-black/40 border-green-500/30 text-green-400 placeholder:text-green-700/50 focus:ring-green-500/50 rounded-lg transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-100 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-3 text-green-400/50"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-black/40 border-green-500/30 text-green-400 placeholder:text-green-700/50 focus:ring-green-500/50 rounded-lg transition"
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
                className="w-full py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-500 transition-all duration-200 shadow-md hover:shadow-lg -translate-y-0 hover:-translate-y-1 active:translate-y-0 disabled:cursor-not-allowed"
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
                className="w-full py-2 text-green-400 font-medium hover:text-green-300 transition"
              >
                Start Over
              </button>
            </form>
          )}

          {/* Demo Info */}
          {step !== "email-password" && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
              <p className="text-xs font-semibold text-gray-300 mb-2">
                Demo Mode:
              </p>
              <p className="text-xs text-gray-400">
                This demo uses OTP verification via Twilio SMS. For testing, use
                any valid phone number format (e.g., +1234567890).<b>To bypass it simply input number +19999999999</b>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          © 2024 Challenge Me Chat. All rights reserved.
        </p>
      </div>
    </div>
  );
}
