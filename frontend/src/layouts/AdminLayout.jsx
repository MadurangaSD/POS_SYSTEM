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
    <div className="relative flex min-h-screen bg-[#1C1C1E] font-[Inter] text-white/90">
      <div className="app-backdrop" aria-hidden="true" />
      <div className="app-noise" aria-hidden="true" />

      <Sidebar />

      <div className="relative z-10 flex min-h-screen flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#1C1C1E]/95 px-4 py-4 backdrop-blur-sm lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-white/5 bg-[#2C2C2E] p-2">
                <Logo size={42} />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/50">
                  {t('dashboard.overview')}
                </p>
                <h1 className="text-lg font-medium text-white">
                  SDM Control · Command Deck
                </h1>
                <p className="flex items-center gap-1 text-sm text-white/60">
                  <Sparkles className="h-4 w-4 text-white/70" />
                  {t('dashboard.adminDashboard')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <LanguageSelector />
              <ThemeToggle />
              <Button
                variant="outline"
                className="h-11 rounded-xl border border-white/10 bg-[#2C2C2E] text-white/90 transition-all duration-200 hover:bg-white/[0.1]"
                onClick={() => navigate("/pos")}
              >
                <Monitor className="mr-2 h-4 w-4" />
                {t('pos.title')}
              </Button>
              <Button
                className="h-11 rounded-xl border border-white/10 bg-white/[0.1] text-white transition-all duration-200 hover:bg-white/[0.16]"
                onClick={() => navigate("/admin/products")}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('products.addProduct')}
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl border border-white/10 bg-[#2C2C2E] text-white/90 transition-all duration-200 hover:bg-white/[0.1]"
                onClick={() => {
                  localStorage.clear();
                  navigate("/login", { replace: true });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('auth.logout')}
              </Button>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#2C2C2E] px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.12] text-base font-medium text-white">
                  {initials}
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/50">
                    {role}
                  </p>
                  <p className="text-sm font-medium text-white/90">{username}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-[#1C1C1E] px-4 py-8 lg:px-10">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
