import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authAPI } from "../../services/api";
import LanguageSelector from "../../components/LanguageSelector";
import Logo from "@/components/Logo";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--background))]">
      <div className="app-backdrop" aria-hidden="true" />
      <div className="app-noise" aria-hidden="true" />

      <div className="absolute right-6 top-6 z-20">
        <LanguageSelector />
      </div>

      <Card className="relative z-10 mx-4 w-full max-w-lg animate-scaleIn surface-strong">
        <CardHeader className="space-y-4 pb-6">
          <div className="mb-2 flex items-center justify-center">
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.7)]">
              <Logo size={64} className="text-[hsl(var(--primary))]" />
            </div>
          </div>
          <CardTitle className="text-center text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
            {SHOP_NAME}
          </CardTitle>
          <CardDescription className="text-center text-base text-[hsl(var(--muted-foreground))]">
            {t('auth.enterCredentials')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-slate-200">
                {t('auth.username')}
              </label>
              <div className="relative">
                <Input
                  id="username"
                  ref={usernameRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('auth.username')}
                  className="h-12 border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-200">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password')}
                  className="h-12 border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))]"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="animate-slideIn flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
                <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-base font-semibold shadow-[0_18px_40px_-28px_rgba(34,211,238,0.9)] hover:brightness-110"
              disabled={loading}
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

          {/* Numeric Keypad for Touch Screens */}
          <div className="mt-8 border-t border-[hsl(var(--border))] pt-6">
            <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Touch Screen Keypad
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant="outline"
                  className="h-12 border-[hsl(var(--border))] bg-[hsl(var(--card))] text-xl font-bold text-[hsl(var(--foreground))] transition-all duration-200 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                  onClick={() => handleNumericInput(num.toString())}
                >
                  {num}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                className="h-12 border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm font-semibold text-[hsl(var(--foreground))] transition-all duration-200 hover:border-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))]"
                onClick={() => {
                  if (document.activeElement === usernameRef.current) {
                    setUsername(username.slice(0, -1));
                  } else {
                    setPassword(password.slice(0, -1));
                  }
                }}
              >
                ⌫
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 border-[hsl(var(--border))] bg-[hsl(var(--card))] text-xl font-bold text-[hsl(var(--foreground))] transition-all duration-200 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                onClick={() => handleNumericInput("0")}
              >
                0
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm font-semibold text-[hsl(var(--foreground))] transition-all duration-200 hover:border-[hsl(var(--muted-foreground))]"
                onClick={() => {
                  if (document.activeElement === usernameRef.current) {
                    setUsername("");
                  } else {
                    setPassword("");
                  }
                }}
              >
                Clear
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
