import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Package,
  Receipt,
  Users,
  DollarSign,
  ShoppingCart,
  Zap,
  Monitor,
  PlusCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { salesAPI, stockAPI } from "../../services/api";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    {
      title: t('dashboard.todaySales'),
      value: "Rs. 0.00",
      change: "+0%",
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: t('dashboard.totalProducts'),
      value: "0",
      change: "0",
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: t('inventory.inventoryValue'),
      value: "Rs. 0.00",
      change: "-0%",
      icon: Zap,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: t('dashboard.todaySales'),
      value: "0",
      change: "+0",
      icon: ShoppingCart,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950",
    },
  ]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const dailyReport = await salesAPI.getDailyReport(today);
        const inventoryValue = await stockAPI.getStockValue();
        const topProductsData = await salesAPI.getTopProducts(5, 30);

        setStats([
          {
            title: t('dashboard.todaySales'),
            value: `Rs. ${dailyReport.total_sales?.toFixed(2) || '0.00'}`,
            change: "+12.5%",
            icon: DollarSign,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950",
          },
          {
            title: t('dashboard.totalProducts'),
            value: inventoryValue.totalItems?.toString() || "0",
            change: "+5",
            icon: Package,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950",
          },
          {
            title: t('inventory.inventoryValue'),
            value: `Rs. ${inventoryValue.totalValue?.toFixed(2) || '0.00'}`,
            change: "-2.3%",
            icon: Zap,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-950",
          },
          {
            title: t('sales.title'),
            value: dailyReport.total_bills?.toString() || "0",
            change: `+${dailyReport.total_bills || 0}`,
            icon: ShoppingCart,
            color: "text-orange-600 dark:text-orange-400",
            bg: "bg-orange-50 dark:bg-orange-950",
          },
        ]);

        setTopProducts(topProductsData.slice(0, 5).map(p => ({
          name: p.name,
          sold: p.units_sold,
          revenue: `Rs. ${p.total_revenue?.toFixed(2) || '0.00'}`
        })));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [t]);

  const tonePalette = ["emerald", "blue", "violet", "amber"];
  const headerStats = stats.map((stat, index) => ({
    label: stat.title,
    value: stat.value,
    trend: stat.change,
    tone: tonePalette[index % tonePalette.length],
    isLoading: loading,
  }));

  const headerActions = [
    <Button
      key="pos-shortcut"
      variant="outline"
      className="h-11 rounded-xl border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
      onClick={() => navigate("/pos")}
    >
      <Monitor className="mr-2 h-4 w-4" />
      {t("pos.title")}
    </Button>,
    <Button
      key="new-product"
      className="h-11 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--background))] hover:brightness-110"
      onClick={() => navigate("/admin/products")}
    >
      <PlusCircle className="mr-2 h-4 w-4" />
      {t("dashboard.manageProducts")}
    </Button>,
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={TrendingUp}
        title={t('dashboard.title')}
        subtitle={t('dashboard.overview')}
        badge={t('dashboard.adminDashboard')}
        breadcrumbs={[
          { label: 'SDM GROCERY', href: '/admin/dashboard' },
          { label: t('dashboard.title') },
        ]}
        actions={headerActions}
        stats={headerStats}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Top Products - Larger on left */}
        <Card className="lg:col-span-2 surface">
          <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <CardTitle className="flex items-center gap-3 text-lg lg:text-xl text-[hsl(var(--foreground))]">
              <div className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
                <TrendingUp className="h-5 w-5 text-[hsl(var(--primary))]" strokeWidth={2.5} />
              </div>
              <span className="font-semibold">{t('dashboard.topProducts')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))] animate-slideIn"
                    style={{animationDelay: `${index * 50}ms`}}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="font-bold h-10 w-10 rounded-xl flex items-center justify-center text-base shrink-0 border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                        #{index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-base text-[hsl(var(--foreground))] truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">
                          {product.sold} {t('common.unitsSold')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-lg text-[hsl(var(--primary))]">
                        {product.revenue}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-block p-6 rounded-full bg-[hsl(var(--secondary))] mb-4">
                  <TrendingUp className="h-12 w-12 text-[hsl(var(--muted-foreground))] opacity-60" />
                </div>
                <p className="text-[hsl(var(--muted-foreground))] font-medium">
                  {t('common.noData')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="surface">
          <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <CardTitle className="text-lg lg:text-xl flex items-center gap-3 text-[hsl(var(--foreground))]">
              <div className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
                <Zap className="h-5 w-5 text-[hsl(var(--primary))]" strokeWidth={2.5} />
              </div>
              <span className="font-semibold">{t('dashboard.quickActions')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <Button
              variant="outline"
              className="w-full h-14 justify-start text-left font-medium border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all duration-200"
              onClick={() => navigate("/admin/products")}
            >
              <div className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] mr-3">
                <Package className="h-5 w-5 text-[hsl(var(--primary))]" strokeWidth={2.5} />
              </div>
              <span className="truncate">{t('dashboard.manageProducts')}</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 justify-start text-left font-medium border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all duration-200"
              onClick={() => navigate("/admin/sales-history")}
            >
              <div className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] mr-3">
                <Receipt className="h-5 w-5 text-[hsl(var(--primary))]" strokeWidth={2.5} />
              </div>
              <span className="truncate">{t('sales.title')}</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 justify-start text-left font-medium border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all duration-200"
              onClick={() => navigate("/admin/inventory")}
            >
              <div className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] mr-3">
                <Package className="h-5 w-5 text-[hsl(var(--primary))]" strokeWidth={2.5} />
              </div>
              <span className="truncate">{t('inventory.title')}</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 justify-start text-left font-medium border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all duration-200"
              onClick={() => navigate("/admin/reports")}
            >
              <div className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] mr-3">
                <TrendingUp className="h-5 w-5 text-[hsl(var(--primary))]" strokeWidth={2.5} />
              </div>
              <span className="truncate">{t('reports.title')}</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 justify-start text-left font-medium border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all duration-200"
              onClick={() => navigate("/admin/users")}
            >
              <div className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] mr-3">
                <Users className="h-5 w-5 text-[hsl(var(--primary))]" strokeWidth={2.5} />
              </div>
              <span className="truncate">{t('users.title')}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
