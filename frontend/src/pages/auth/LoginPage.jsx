import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authAPI } from "../../services/api";
import LanguageSelector from "../../components/LanguageSelector";
import { SHOP_NAME } from "@/config/brand";

export default function LoginPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef(null);
  const navigate = useNavigate();

  // Auto-focus on username field
  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.login(username, password);
      
      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("username", data.user.username);

      // Navigate based on role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/pos");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Backend returns { error: "Invalid credentials" }; fall back to i18n string
      const errMsg = error.response?.data?.error || error.response?.data?.message || t('auth.invalidCredentials');
      setError(errMsg);
      setLoading(false);
    }
  };

  // Numeric keypad support for touch screens
  const handleNumericInput = (num) => {
    if (document.activeElement === usernameRef.current) {
      setUsername(username + num);
    } else {
      setPassword(password + num);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#121212]">
      {/* Subtle animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-900/10 blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-slate-900/10 blur-3xl opacity-20"></div>
      </div>

      {/* Language Selector */}
      <div className="absolute right-6 top-6 z-20">
        <LanguageSelector />
      </div>

      {/* Main Container - Premium Glassmorphism */}
      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="rounded-4xl border border-[#2a2a2a] bg-[#1a1a1a]/95 backdrop-blur-xl shadow-2xl">
          {/* Header Section */}
          <div className="space-y-6 border-b border-[#252525] px-8 py-12">
            {/* Minimal Logo Branding */}
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full border border-[#2a2a2a] bg-[#242426] flex items-center justify-center shadow-lg">
                <div className="h-12 w-12 rounded-full border-2 border-[#0A84FF] flex items-center justify-center">
                  <span className="text-xl font-bold text-[#0A84FF]">P</span>
                </div>
              </div>
            </div>

            {/* Title and Subtitle */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-white">
                Sign In
              </h1>
              <p className="text-sm text-gray-400 font-medium">
                Welcome to {SHOP_NAME}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 py-10">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-3">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-300">
                  {t('auth.username')}
                </label>
                <Input
                  id="username"
                  ref={usernameRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('auth.username')}
                  className="h-14 w-full rounded-2xl border border-[#2a2a2a] bg-[#202020] text-white placeholder:text-gray-500 focus:border-[#0A84FF] focus:ring-0 focus:outline-none transition-colors duration-200 px-5 text-base font-medium"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-300">
                  {t('auth.password')}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password')}
                  className="h-14 w-full rounded-2xl border border-[#2a2a2a] bg-[#202020] text-white placeholder:text-gray-500 focus:border-[#0A84FF] focus:ring-0 focus:outline-none transition-colors duration-200 px-5 text-base font-medium"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="animate-slideIn flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <svg className="h-5 w-5 shrink-0 mt-0.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-red-400">{error}</span>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-2xl bg-[#0A84FF] text-white text-base font-semibold shadow-lg hover:bg-[#0970CC] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('common.loading')}
                  </span>
                ) : (
                  t('auth.login')
                )}
              </Button>
            </form>
          </div>

          {/* Numeric Keypad Section */}
          <div className="space-y-4 border-t border-[#252525] px-8 py-8">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-500">
              Touch Screen Keypad
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  type="button"
                  onClick={() => handleNumericInput(num.toString())}
                  className="h-12 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] text-lg font-bold text-white hover:border-[#0A84FF] hover:text-[#0A84FF] transition-all duration-150"
                >
                  {num}
                </Button>
              ))}
              <Button
                type="button"
                onClick={() => {
                  if (document.activeElement === usernameRef.current) {
                    setUsername(username.slice(0, -1));
                  } else {
                    setPassword(password.slice(0, -1));
                  }
                }}
                className="h-12 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] text-sm font-semibold text-gray-400 hover:border-red-500/50 hover:text-red-400 transition-all duration-150"
              >
                ⌫
              </Button>
              <Button
                type="button"
                onClick={() => handleNumericInput("0")}
                className="h-12 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] text-lg font-bold text-white hover:border-[#0A84FF] hover:text-[#0A84FF] transition-all duration-150"
              >
                0
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (document.activeElement === usernameRef.current) {
                    setUsername("");
                  } else {
                    setPassword("");
                  }
                }}
                className="col-span-2 h-12 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] text-sm font-semibold text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-all duration-150"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 {SHOP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
