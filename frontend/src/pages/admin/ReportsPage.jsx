import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, BarChart3, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { salesAPI } from "../../services/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

export default function ReportsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Get last 7 days sales
      const today = new Date();
      const salesPromises = [];
      const dates = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);
        salesPromises.push(salesAPI.getDailyReport(dateStr));
      }

      const reports = await Promise.all(salesPromises);
      const chartData = reports.map((report, index) => ({
        date: new Date(dates[index]).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: report.totalRevenue,
        sales: report.totalSales,
      }));

      setSalesData(chartData);

      // Get top products
      const topProductsData = await salesAPI.getTopProducts(10, 30);
      setTopProducts(topProductsData);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // yellow
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
    "#6366f1", // indigo
    "#14b8a6", // teal
  ];

  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalSalesCount = salesData.reduce((sum, item) => sum + item.sales, 0);
  const avgDailySales = salesData.length > 0 ? totalRevenue / salesData.length : 0;

  const surfaceCardClass = "surface";
  const headerStats = [
    {
      label: t('reports.weekRevenue'),
      value: formatCurrency(totalRevenue),
      tone: 'emerald',
      helper: t('reports.salesTrend'),
    },
    {
      label: t('reports.totalTransactions'),
      value: totalSalesCount.toString(),
      tone: 'blue',
      helper: t('sales.transactions'),
    },
    {
      label: t('reports.avgDailySales'),
      value: formatCurrency(avgDailySales),
      tone: 'violet',
      helper: t('reports.daily'),
    },
    {
      label: t('reports.topProductsRevenue'),
      value: topProducts[0]?.productName || t('common.loading'),
      tone: 'amber',
      helper: topProducts[0] ? formatCurrency(topProducts[0].totalRevenue) : '',
    },
  ];

  const headerActions = [
    <Button
      key="reports-back"
      variant="outline"
      className="h-11 rounded-xl border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
      onClick={() => navigate("/admin/dashboard")}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {t('common.back')}
    </Button>,
    <Button
      key="reports-export"
      variant="outline"
      className="h-11 rounded-xl border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
    >
      <Download className="mr-2 h-4 w-4" />
      {t('reports.export')}
    </Button>,
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={TrendingUp}
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        badge={t('dashboard.overview')}
        breadcrumbs={[
          { label: 'SDM GROCERY', href: '/admin/dashboard' },
          { label: t('reports.title') },
        ]}
        actions={headerActions}
        stats={headerStats}
      />

      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className={surfaceCardClass}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{t('reports.weekRevenue')}</div>
                  <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className={surfaceCardClass}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{t('reports.totalTransactions')}</div>
                  <div className="text-3xl font-bold">{totalSalesCount}</div>
                </div>
                <BarChart3 className="h-10 w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className={surfaceCardClass}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{t('reports.avgDailySales')}</div>
                  <div className="text-3xl font-bold">{formatCurrency(avgDailySales)}</div>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <Card className={surfaceCardClass}>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">{t('reports.loading')}</div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Sales Trend Chart */}
            <Card className={surfaceCardClass}>
              <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <CardTitle>{t('reports.salesTrend')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name={t('reports.revenueLabel')}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="sales"
                      stroke="#10b981"
                      strokeWidth={2}
                      name={t('reports.transactionsLabel')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products Chart */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className={surfaceCardClass}>
                <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                  <CardTitle>{t('reports.topProductsRevenue')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topProducts.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="productName" type="category" width={120} />
                      <Tooltip formatter={(value) => `Rs. ${Number(value || 0).toFixed(2)}`} />
                      <Bar dataKey="totalRevenue" fill="#3b82f6" name={t('reports.revenueLabel')} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className={surfaceCardClass}>
                <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                  <CardTitle>{t('reports.productSalesDistribution')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={topProducts.slice(0, 8)}
                        dataKey="totalQuantity"
                        nameKey="productName"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={(entry) => entry.productName}
                      >
                        {topProducts.slice(0, 8).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Products Table */}
            <Card className={surfaceCardClass}>
              <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <CardTitle>{t('reports.productPerformance')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-muted-foreground">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{product.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.totalQuantity} {t('common.unitsSold')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ₹{product.totalRevenue.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('reports.revenue')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
