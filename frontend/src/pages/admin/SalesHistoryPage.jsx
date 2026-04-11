import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Receipt, ArrowLeft, Eye, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { salesAPI } from "../../services/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

export default function SalesHistoryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      const data = await salesAPI.getByDateRange(startDate, endDate);
      setSales(data);
    } catch (error) {
      console.error("Error loading sales:", error);
      toast.error("Failed to load sales history");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      loadSales();
    }
  }, [startDate, endDate, loadSales]);

  const handleViewDetails = async (saleId) => {
    try {
      const sale = await salesAPI.getById(saleId);
      setSelectedSale(sale);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error("Error loading sale details:", error);
      toast.error("Failed to load sale details");
    }
  };

  const filteredSales = sales.filter((sale) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      sale.billNumber.toLowerCase().includes(searchLower) ||
      sale.cashier?.username?.toLowerCase().includes(searchLower) ||
      sale.paymentMethod.toLowerCase().includes(searchLower)
    );
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = filteredSales.length;
  const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  const surfaceCardClass = "rounded-xl border border-white/5 bg-[#242426]";
  const headerStats = [
    {
      label: t('sales.totalSales'),
      value: totalSales.toString(),
      tone: 'slate',
      isLoading: loading,
      helper: `${startDate} → ${endDate}`,
    },
    {
      label: t('sales.totalRevenue'),
      value: formatCurrency(totalRevenue),
      tone: 'slate',
      isLoading: loading,
      helper: t('sales.transactions'),
    },
    {
      label: t('sales.averageSale'),
      value: formatCurrency(avgSale),
      tone: 'slate',
      isLoading: loading,
      helper: t('sales.perTransaction'),
    },
    {
      label: t('sales.payment'),
      value: `${filteredSales.length ? Math.round((filteredSales.filter((sale) => sale.paymentMethod === 'cash').length / filteredSales.length) * 100) : 0}% cash`,
      tone: 'slate',
      isLoading: loading,
      helper: t('sales.transactions'),
    },
  ];

  const headerActions = [
    <Button
      key="sales-back"
      variant="outline"
      className="h-11 rounded-xl border border-white/10 bg-[#2C2C2E] text-white/90 hover:bg-white/[0.08]"
      onClick={() => navigate("/admin/dashboard")}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {t('common.back')}
    </Button>,
    <Button
      key="sales-reports"
      className="h-11 rounded-xl bg-[#0A84FF] text-white hover:brightness-110"
      onClick={() => navigate("/admin/reports")}
    >
      <Receipt className="mr-2 h-4 w-4" />
      {t('reports.title')}
    </Button>,
  ];

  return (
    <div className="space-y-6 text-white/90">
      <PageHeader
        icon={Receipt}
        title={t('sales.title')}
        subtitle={t('sales.salesHistory')}
        badge={t('dashboard.overview')}
        breadcrumbs={[
          { label: 'SDM GROCERY', href: '/admin/dashboard' },
          { label: t('sales.title') },
        ]}
        actions={headerActions}
        stats={headerStats}
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className={surfaceCardClass}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{t('sales.totalSales')}</div>
              <div className="text-3xl font-bold">{totalSales}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {startDate} to {endDate}
              </div>
            </CardContent>
          </Card>
          <Card className={surfaceCardClass}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{t('sales.totalRevenue')}</div>
              <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
              <div className="text-xs text-green-600 mt-1">
                {filteredSales.length} {t('sales.transactions')}
              </div>
            </CardContent>
          </Card>
          <Card className={surfaceCardClass}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{t('sales.averageSale')}</div>
              <div className="text-3xl font-bold">{formatCurrency(avgSale)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {t('sales.perTransaction')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card className={`${surfaceCardClass} overflow-hidden`}>
          <CardHeader className="border-b border-white/5 bg-[#242426]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-white/95">
                <Receipt className="h-5 w-5" />
                {t('sales.transactionsTitle')} ({filteredSales.length})
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                {/* Date Range */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-white/50" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-40"
                  />
                  <span className="text-sm text-white/55">{t('common.to')}</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                {/* Search */}
                <div className="relative w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/45" />
                  <Input
                    placeholder={t('sales.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="relative z-10 pl-10"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-white/55">
                {t('sales.loading')}
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-8 text-white/55">
                {t('sales.noSales')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-white/55">{t('sales.billNumber')}</TableHead>
                      <TableHead className="text-white/55">{t('sales.dateTime')}</TableHead>
                      <TableHead className="text-white/55">{t('sales.cashier')}</TableHead>
                      <TableHead className="text-right text-white/55">{t('sales.items')}</TableHead>
                      <TableHead className="text-right text-white/55">{t('sales.subtotal')}</TableHead>
                      <TableHead className="text-right text-white/55">{t('sales.discount')}</TableHead>
                      <TableHead className="text-right text-white/55">{t('sales.total')}</TableHead>
                      <TableHead className="text-white/55">{t('sales.payment')}</TableHead>
                      <TableHead className="text-right text-white/55">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                      <TableRow key={sale._id} className="border-white/5 hover:bg-white/[0.03]">
                      <TableCell className="font-mono font-medium">
                        {sale.billNumber}
                      </TableCell>
                      <TableCell>
                        {new Date(sale.saleDate).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </TableCell>
                      <TableCell>{sale.cashier?.username || t('common.na')}</TableCell>
                      <TableCell className="text-right">
                        {sale.items?.length || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(sale.subtotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        {sale.discount > 0 ? (
                          <span className="text-white">
                            -{formatCurrency(sale.discount)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(sale.total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-white/85">
                          {sale.paymentMethod === 'cash' ? '💵' : sale.paymentMethod === 'card' ? '💳' : '📱'} {sale.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/75 hover:bg-white/[0.08] hover:text-white"
                          onClick={() => handleViewDetails(sale._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sale Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1C1C1E] text-white">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
            <DialogDescription>
              Bill Number: {selectedSale?.billNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-6">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-white/55">Date & Time</div>
                  <div className="font-medium">
                    {new Date(selectedSale.saleDate).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/55">Cashier</div>
                  <div className="font-medium">
                    {selectedSale.cashier?.username || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/55">Payment Method</div>
                  <div className="font-medium">{selectedSale.paymentMethod}</div>
                </div>
                <div>
                  <div className="text-sm text-white/55">Status</div>
                  <Badge className="border border-white/10 bg-white/[0.12] text-white">
                    {selectedSale.status}
                  </Badge>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-medium mb-3">Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">
                          ₹{item.unitPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          ₹{item.totalPrice.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">₹{selectedSale.subtotal.toFixed(2)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-white">
                    <span>Discount:</span>
                    <span className="font-medium">-₹{selectedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                {selectedSale.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-medium">₹{selectedSale.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>₹{selectedSale.total.toFixed(2)}</span>
                </div>
                {selectedSale.paymentMethod === 'cash' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Amount Received:</span>
                      <span>₹{selectedSale.amountReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Change:</span>
                      <span>₹{selectedSale.change.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
