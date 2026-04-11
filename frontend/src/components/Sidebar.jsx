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
  Tags,
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
    { label: "Brands", icon: Tags, href: "/admin/brands" },
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
          className="rounded-xl border border-white/5 bg-[#2C2C2E] text-white/90 shadow-lg transition-all duration-200 hover:bg-white/10"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen border-r border-white/5 bg-[#2C2C2E] font-[Inter] text-white/90 shadow-xl transition-all duration-200 ${
          isOpen ? "w-64" : "w-0 overflow-hidden"
        } lg:w-64`}
      >
        {/* Logo Section */}
        <div className="border-b border-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-2">
              <Logo size={32} className="text-white/95" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/55">
                {t("dashboard.overview")}
              </p>
              <h2 className="text-base font-medium text-white">POS System</h2>
              <p className="text-xs text-white/55">Admin Panel</p>
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
                  "group relative flex items-center gap-3 rounded-xl border px-3.5 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "border-white/10 bg-white/[0.07] text-white"
                    : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                )}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                    active
                      ? "border-white/20 text-white"
                      : "border-white/10 text-white/75 group-hover:text-white"
                  )}
                >
                  <Icon size={20} strokeWidth={2.3} />
                </div>
                <span className="font-medium tracking-wide text-inherit">{item.label}</span>
                {active && <div className="ml-auto h-6 w-0.5 rounded-full bg-white/80" />}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="group relative flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-3 text-sm font-medium text-white/80 transition-all duration-200 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white/80">
              <LogOut size={20} strokeWidth={2.3} />
            </div>
            <span className="font-medium tracking-wide">{t("auth.logout")}</span>
          </button>
        </nav>

        {/* Bottom Section */}
        <div className="space-y-3 border-t border-white/5 p-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <p className="text-xs uppercase tracking-[0.28em] text-white/50">{t("common.status") || "Status"}</p>
            <p className="text-sm font-medium text-white/90">
              {localStorage.getItem("username") || "Admin"}
            </p>
            <p className="text-xs text-white/55 capitalize">
              {localStorage.getItem("role") || "admin"}
            </p>
          </div>

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="button-hover h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] font-medium text-white transition-all duration-200 hover:bg-white/[0.12]"
          >
            <LogOut size={18} />
            {t("auth.logout")}
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
