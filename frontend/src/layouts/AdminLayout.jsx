import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSelector from "../components/LanguageSelector";
import Logo from "../components/Logo";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Monitor, Plus, Sparkles, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * AdminLayout - Main layout for admin pages with left sidebar
 * Wraps all admin pages with navigation and sidebar
 */
const AdminLayout = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";
  const role = localStorage.getItem("role") || "admin";
  const initials = username
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative flex min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="app-backdrop" aria-hidden="true" />
      <div className="app-noise" aria-hidden="true" />

      <Sidebar />

      <div className="relative z-10 flex min-h-screen flex-1 flex-col lg:ml-72">
        <header className="sticky top-0 z-20 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-4 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-[0_10px_40px_-28px_rgba(0,0,0,0.8)]">
                <Logo size={42} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[hsl(var(--muted-foreground))]">
                  {t('dashboard.overview')}
                </p>
                <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  SDM Control · Command Deck
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--primary))]" />
                  {t('dashboard.adminDashboard')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <LanguageSelector />
              <ThemeToggle />
              <Button
                variant="outline"
                className="h-11 rounded-xl border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                onClick={() => navigate("/pos")}
              >
                <Monitor className="mr-2 h-4 w-4" />
                {t('pos.title')}
              </Button>
              <Button
                className="h-11 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_15px_45px_-25px_rgba(34,211,238,0.9)] hover:brightness-110"
                onClick={() => navigate("/admin/products")}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('products.addProduct')}
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))]"
                onClick={() => {
                  localStorage.clear();
                  navigate("/login", { replace: true });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('auth.logout')}
              </Button>
              <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 shadow-[0_12px_40px_-30px_rgba(0,0,0,0.7)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,hsl(var(--primary))_80%,#0b1224_20%)] text-base font-semibold text-[hsl(var(--primary-foreground))]">
                  {initials}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[hsl(var(--muted-foreground))]">
                    {role}
                  </p>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{username}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 lg:px-10">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
