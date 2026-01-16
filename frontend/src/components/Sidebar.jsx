import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Menu,
  X,
  LayoutDashboard,
  Monitor,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  BarChart3,
  LogOut,
  Tag,
  Tag2,
} from "lucide-react";
import { Button } from "./ui/button";
import Logo from "./Logo";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: t("dashboard.title"), icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: t("products.title"), icon: Package, href: "/admin/products" },
    { label: "Categories", icon: Tag, href: "/admin/categories" },
    { label: "Brands", icon: Tag2, href: "/admin/brands" },
    { label: t("inventory.title"), icon: Boxes, href: "/admin/inventory" },
    { label: t("sales.salesHistory"), icon: ShoppingCart, href: "/admin/sales-history" },
    { label: t("users.title"), icon: Users, href: "/admin/users" },
    { label: t("reports.title"), icon: BarChart3, href: "/admin/reports" },
    { label: t("pos.title"), icon: Monitor, href: "/pos" },
  ];

  const isActive = (href) => location.pathname.startsWith(href);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-[0_12px_30px_-20px_rgba(0,0,0,0.8)]"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] shadow-[0_20px_80px_-40px_rgba(0,0,0,0.8)] transition-all duration-250 ${
          isOpen ? "w-72" : "w-0 overflow-hidden"
        } lg:w-72`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent))] p-2">
              <Logo size={32} className="text-[hsl(var(--sidebar-foreground))]" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[hsl(var(--muted-foreground))]">
                {t("dashboard.overview")}
              </p>
              <h2 className="text-lg font-semibold">POS System</h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                className={cn(
                  "group relative flex items-center gap-4 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "border-[hsl(var(--primary))] bg-[color-mix(in_srgb,hsl(var(--primary))_12%,hsl(var(--sidebar))_88%)] text-[hsl(var(--sidebar-foreground))] shadow-[0_18px_40px_-30px_rgba(34,211,238,0.7)]"
                    : "border-transparent text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--sidebar-border))] hover:bg-[hsl(var(--sidebar-accent))]"
                )}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                    active
                      ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                      : "border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-foreground))] group-hover:text-[hsl(var(--primary))]"
                  )}
                >
                  <Icon size={20} strokeWidth={2.3} />
                </div>
                <span className="font-medium tracking-wide">{item.label}</span>
                {active && <div className="ml-auto h-6 w-0.75 rounded-full bg-[hsl(var(--primary))]" />}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="group relative flex w-full items-center gap-4 rounded-xl border border-transparent bg-[color-mix(in_srgb,hsl(var(--destructive))_10%,hsl(var(--sidebar))_90%)] px-4 py-3 text-sm font-semibold text-[hsl(var(--destructive))] transition-all duration-200 hover:border-[hsl(var(--destructive))] hover:bg-[color-mix(in_srgb,hsl(var(--destructive))_16%,hsl(var(--sidebar))_84%)] hover:shadow-[0_18px_40px_-28px_rgba(248,113,113,0.6)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[hsl(var(--destructive))] text-[hsl(var(--destructive))]">
              <LogOut size={20} strokeWidth={2.3} />
            </div>
            <span className="font-semibold tracking-wide">{t("auth.logout")}</span>
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="space-y-3 border-t border-[hsl(var(--sidebar-border))] p-4">
          <div className="rounded-xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent))] p-3">
            <p className="text-xs uppercase tracking-[0.32em] text-[hsl(var(--muted-foreground))]">{t("common.status") || "Status"}</p>
            <p className="text-sm font-semibold text-[hsl(var(--sidebar-foreground))]">
              {localStorage.getItem("username") || "Admin"}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">
              {localStorage.getItem("role") || "admin"}
            </p>
          </div>

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="button-hover w-full h-11 rounded-xl font-semibold bg-[hsl(var(--destructive))] text-white shadow-[0_18px_40px_-28px_rgba(248,113,113,0.6)] hover:brightness-110"
          >
            <LogOut size={18} />
            {t("auth.logout")}
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[hsl(var(--background))] lg:hidden z-30 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
