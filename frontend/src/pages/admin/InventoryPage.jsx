import { useState, useEffect } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ArrowLeft,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { stockAPI, productsAPI } from "../../services/api";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

export default function InventoryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    quantity: "",
    reason: "received",
    notes: "",
  });
  const [purchaseData, setPurchaseData] = useState({
    supplier: "",
    invoiceNumber: "",
    items: [],
  });
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allProducts, lowStock, inventoryValue] = await Promise.all([
        productsAPI.getAll(),
        stockAPI.getLowStock(),
        stockAPI.getStockValue(),
      ]);
      setProducts(allProducts);
      setLowStockProducts(lowStock);
      // Handle both camelCase and snake_case API responses
      const value = inventoryValue.totalValue || inventoryValue.total_value || 0;
      setTotalInventoryValue(parseFloat(value));
    } catch (error) {
      console.error("Error loading inventory:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjustDialog = (product) => {
    setSelectedProduct(product);
    setAdjustmentData({
      quantity: "",
      reason: "received",
      notes: "",
    });
    setShowAdjustDialog(true);
  };

  const handleAdjustStock = async () => {
    try {
      const quantity = parseInt(adjustmentData.quantity);
      if (isNaN(quantity) || quantity === 0) {
        toast.error("Please enter a valid quantity");
        return;
      }

      await stockAPI.adjust(
        selectedProduct._id,
        quantity,
        adjustmentData.reason,
        adjustmentData.notes
      );

      toast.success("Stock adjusted successfully");
      setShowAdjustDialog(false);
      setSelectedProduct(null);
      loadData();
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast.error(error.response?.data?.message || "Failed to adjust stock");
    }
  };

  const handleRecordPurchase = async () => {
    try {
      if (!purchaseData.supplier || !purchaseData.invoiceNumber) {
        toast.error("Please fill in supplier and invoice number");
        return;
      }

      if (purchaseData.items.length === 0) {
        toast.error("Please add at least one item");
        return;
      }

      await stockAPI.recordPurchase(
        purchaseData.supplier,
        purchaseData.items,
        purchaseData.invoiceNumber
      );

      toast.success("Purchase recorded successfully");
      setShowPurchaseDialog(false);
      setPurchaseData({ supplier: "", invoiceNumber: "", items: [] });
      loadData();
    } catch (error) {
      console.error("Error recording purchase:", error);
      toast.error(error.response?.data?.message || "Failed to record purchase");
    }
  };

  const addItemToPurchase = () => {
    setPurchaseData({
      ...purchaseData,
      items: [
        ...purchaseData.items,
        { product_id: "", quantity: 0, cost_price: 0 },
      ],
    });
  };

  const updatePurchaseItem = (index, field, value) => {
    const newItems = [...purchaseData.items];
    newItems[index][field] = value;
    setPurchaseData({ ...purchaseData, items: newItems });
  };

  const removePurchaseItem = (index) => {
    const newItems = purchaseData.items.filter((_, i) => i !== index);
    setPurchaseData({ ...purchaseData, items: newItems });
  };

  const surfaceCardClass = "rounded-xl border border-white/5 bg-[#242426]";
  const avgStockValue = products.length ? totalInventoryValue / products.length : 0;
  const headerStats = [
    {
      label: t('dashboard.totalProducts'),
      value: products.length.toString(),
      tone: 'slate',
      isLoading: loading,
      helper: t('products.products'),
    },
    {
      label: t('dashboard.lowStockItems'),
      value: lowStockProducts.length.toString(),
      tone: 'slate',
      isLoading: loading,
      helper: lowStockProducts.length
        ? t('inventory.lowStockAlert', { count: lowStockProducts.length })
        : t('inventory.inStock'),
    },
    {
      label: t('inventory.inventoryValue'),
      value: formatCurrency(totalInventoryValue),
      tone: 'slate',
      isLoading: loading,
      helper: t('inventory.stockValue'),
    },
    {
      label: t('inventory.stockValue'),
      value: formatCurrency(avgStockValue),
      tone: 'slate',
      isLoading: loading,
      helper: 'Avg / SKU',
    },
  ];

  const headerActions = [
    <Button
      key="inventory-back"
      variant="outline"
      className="h-11 rounded-xl border border-white/10 bg-[#2C2C2E] text-white/90 hover:bg-white/[0.08]"
      onClick={() => navigate("/admin/dashboard")}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {t('common.back')}
    </Button>,
    <Button
      key="record-purchase"
      className="h-11 rounded-xl bg-[#0A84FF] text-white hover:brightness-110"
      onClick={() => setShowPurchaseDialog(true)}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {t('inventory.recordPurchase')}
    </Button>,
  ];

  return (
    <div className="space-y-6 text-white/90">
      <PageHeader
        icon={Package}
        title={t('inventory.title')}
        subtitle={t('inventory.inventoryManagement')}
        badge={t('dashboard.overview')}
        breadcrumbs={[
          { label: 'SDM GROCERY', href: '/admin/dashboard' },
          { label: t('inventory.title') },
        ]}
        actions={headerActions}
        stats={headerStats}
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className={surfaceCardClass}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{t('dashboard.totalProducts')}</div>
                  <div className="text-3xl font-bold">{products.length}</div>
                </div>
                <Package className="h-10 w-10 text-white/40" />
              </div>
            </CardContent>
          </Card>
          <Card className={surfaceCardClass}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{t('dashboard.lowStockItems')}</div>
                  <div className="text-3xl font-bold text-white">
                    {lowStockProducts.length}
                  </div>
                </div>
                <AlertTriangle className="h-10 w-10 text-white/40" />
              </div>
            </CardContent>
          </Card>
          <Card className={surfaceCardClass}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{t('inventory.inventoryValue')}</div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(totalInventoryValue)}
                  </div>
                </div>
                <TrendingUp className="h-10 w-10 text-white/40" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className={`${surfaceCardClass} ring-1 ring-rose-400/35`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white/90">
                <AlertTriangle className="h-5 w-5" />
                {t('inventory.lowStockAlert', { count: lowStockProducts.length })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <Badge key={product._id} className="border border-white/10 bg-white/[0.08] text-white">
                    {product.name}: {product.quantity} {t('inventory.left')}
                  </Badge>
                ))}
                {lowStockProducts.length > 5 && (
                  <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-white/80">+{lowStockProducts.length - 5} {t('inventory.more')}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Table */}
        <Card className={`${surfaceCardClass} overflow-hidden`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/95">
              <Package className="h-5 w-5" />
              {t('inventory.currentStockLevels')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-white/55">
                {t('inventory.loading')}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-white/55">
                {t('products.noProducts')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-white/55">{t('products.product')}</TableHead>
                    <TableHead className="text-white/55">{t('products.barcode')}</TableHead>
                    <TableHead className="text-right text-white/55">{t('inventory.currentStock')}</TableHead>
                    <TableHead className="text-right text-white/55">{t('products.reorderLevel')}</TableHead>
                    <TableHead className="text-right text-white/55">{t('products.cost')}</TableHead>
                    <TableHead className="text-right text-white/55">{t('inventory.stockValue')}</TableHead>
                    <TableHead className="text-white/55">{t('products.status')}</TableHead>
                    <TableHead className="text-right text-white/55">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockValue = product.quantity * product.costPrice;
                    const isLowStock = product.quantity <= product.reorderLevel;
                    
                    return (
                      <TableRow key={product._id} className={`border-white/5 ${isLowStock ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"}`}>
                        <TableCell className="font-medium text-white/92">{product.name}</TableCell>
                        <TableCell className="font-mono text-sm text-white/70">
                          {product.barcode}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={isLowStock ? "text-white font-bold" : "text-white/85"}>
                            {product.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-white/60">
                          {product.reorderLevel}
                        </TableCell>
                        <TableCell className="text-right text-white/85">
                          {formatCurrency(product.costPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-white/95">
                          {formatCurrency(stockValue)}
                        </TableCell>
                        <TableCell>
                          {isLowStock ? (
                            <Badge className="border border-white/10 bg-white/[0.08] text-white">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {t('inventory.lowStock')}
                            </Badge>
                          ) : product.quantity === 0 ? (
                            <Badge variant="secondary" className="border border-white/10 bg-white/[0.03] text-white/70">{t('inventory.outOfStock')}</Badge>
                          ) : (
                            <Badge className="border border-white/10 bg-white/[0.12] text-white">
                              {t('inventory.inStock')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 bg-[#1C1C1E] text-white/90 hover:bg-white/[0.08]"
                            onClick={() => handleOpenAdjustDialog(product)}
                          >
                            {t('inventory.adjust')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent className="rounded-2xl border border-white/10 bg-[#1C1C1E] text-white">
          <DialogHeader>
            <DialogTitle>{t('inventory.adjustStock')}</DialogTitle>
            <DialogDescription>
              {t('inventory.productLabel')}: {selectedProduct?.name}
              <br />
              {t('inventory.currentStock')}: {selectedProduct?.quantity}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-white/85">{t('inventory.quantityChange')} *</label>
              <Input
                type="number"
                value={adjustmentData.quantity}
                onChange={(e) =>
                  setAdjustmentData({ ...adjustmentData, quantity: e.target.value })
                }
                placeholder={t('inventory.quantityPlaceholder')}
              />
              <p className="text-xs text-white/55 mt-1">
                {t('inventory.newStock')}: {selectedProduct?.quantity + parseInt(adjustmentData.quantity || 0)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-white/85">{t('inventory.reason')} *</label>
              <Select
                value={adjustmentData.reason}
                onValueChange={(value) =>
                  setAdjustmentData({ ...adjustmentData, reason: value })
                }
              >
                <SelectTrigger className="bg-[#242426]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1E]">
                  <SelectItem value="received">{t('inventory.reasonReceived')}</SelectItem>
                  <SelectItem value="sold">{t('inventory.reasonSold')}</SelectItem>
                  <SelectItem value="damaged">{t('inventory.reasonDamaged')}</SelectItem>
                  <SelectItem value="returned">{t('inventory.reasonReturned')}</SelectItem>
                  <SelectItem value="theft">{t('inventory.reasonTheft')}</SelectItem>
                  <SelectItem value="adjustment">{t('inventory.reasonAdjustment')}</SelectItem>
                  <SelectItem value="other">{t('inventory.reasonOther')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-white/85">{t('inventory.notes')}</label>
              <Input
                value={adjustmentData.notes}
                onChange={(e) =>
                  setAdjustmentData({ ...adjustmentData, notes: e.target.value })
                }
                placeholder={t('inventory.notesPlaceholder')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]"
              onClick={() => {
                setShowAdjustDialog(false);
                setSelectedProduct(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button className="bg-[#0A84FF] text-white hover:brightness-110" onClick={handleAdjustStock}>{t('inventory.adjustStock')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1C1C1E] text-white">
          <DialogHeader>
            <DialogTitle>{t('inventory.recordPurchaseOrder')}</DialogTitle>
            <DialogDescription>{t('inventory.recordPurchaseDesc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white/85">{t('inventory.supplier')} *</label>
                <Input
                  value={purchaseData.supplier}
                  onChange={(e) =>
                    setPurchaseData({ ...purchaseData, supplier: e.target.value })
                  }
                  placeholder={t('inventory.supplierPlaceholder')}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white/85">{t('inventory.invoiceNumber')} *</label>
                <Input
                  value={purchaseData.invoiceNumber}
                  onChange={(e) =>
                    setPurchaseData({ ...purchaseData, invoiceNumber: e.target.value })
                  }
                  placeholder={t('inventory.invoicePlaceholder')}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/85">{t('inventory.items')}</label>
                <Button size="sm" variant="outline" className="border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]" onClick={addItemToPurchase}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {t('inventory.addItem')}
                </Button>
              </div>

              {purchaseData.items.length === 0 ? (
                <div className="text-center py-6 text-white/55 border border-white/10 rounded-lg bg-[#242426]">
                  {t('inventory.noItems')}
                </div>
              ) : (
                <div className="space-y-2">
                  {purchaseData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start border border-white/10 bg-[#242426] p-3 rounded-lg">
                      <Select
                        value={item.product_id}
                        onValueChange={(value) =>
                          updatePurchaseItem(index, "product_id", value)
                        }
                      >
                        <SelectTrigger className="flex-1 bg-[#1C1C1E]">
                          <SelectValue placeholder={t('inventory.selectProduct')} />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1C1E]">
                          {products.map((p) => (
                            <SelectItem key={p._id} value={p._id}>
                              {p.name} ({p.barcode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder={t('inventory.qty')}
                        className="w-24"
                        value={item.quantity}
                        onChange={(e) =>
                          updatePurchaseItem(index, "quantity", parseInt(e.target.value) || 0)
                        }
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={t('inventory.cost')}
                        className="w-32"
                        value={item.cost_price}
                        onChange={(e) =>
                          updatePurchaseItem(index, "cost_price", parseFloat(e.target.value) || 0)
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:bg-white/[0.08] hover:text-white"
                        onClick={() => removePurchaseItem(index)}
                      >
                        <TrendingDown className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]"
              onClick={() => {
                setShowPurchaseDialog(false);
                setPurchaseData({ supplier: "", invoiceNumber: "", items: [] });
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button className="bg-[#0A84FF] text-white hover:brightness-110" onClick={handleRecordPurchase}>{t('inventory.recordPurchase')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
