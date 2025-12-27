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

  const surfaceCardClass = "surface";
  const avgStockValue = products.length ? totalInventoryValue / products.length : 0;
  const headerStats = [
    {
      label: t('dashboard.totalProducts'),
      value: products.length.toString(),
      tone: 'blue',
      isLoading: loading,
      helper: t('products.products'),
    },
    {
      label: t('dashboard.lowStockItems'),
      value: lowStockProducts.length.toString(),
      tone: 'rose',
      isLoading: loading,
      helper: lowStockProducts.length
        ? t('inventory.lowStockAlert', { count: lowStockProducts.length })
        : t('inventory.inStock'),
    },
    {
      label: t('inventory.inventoryValue'),
      value: formatCurrency(totalInventoryValue),
      tone: 'emerald',
      isLoading: loading,
      helper: t('inventory.stockValue'),
    },
    {
      label: t('inventory.stockValue'),
      value: formatCurrency(avgStockValue),
      tone: 'violet',
      isLoading: loading,
      helper: 'Avg / SKU',
    },
  ];

  const headerActions = [
    <Button
      key="inventory-back"
      variant="outline"
      className="h-11 rounded-xl border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
      onClick={() => navigate("/admin/dashboard")}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {t('common.back')}
    </Button>,
    <Button
      key="record-purchase"
      className="h-11 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--background))] hover:brightness-110"
      onClick={() => setShowPurchaseDialog(true)}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {t('inventory.recordPurchase')}
    </Button>,
  ];

  return (
    <div className="space-y-6">
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
                <Package className="h-10 w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className={surfaceCardClass}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{t('dashboard.lowStockItems')}</div>
                  <div className="text-3xl font-bold text-red-600">
                    {lowStockProducts.length}
                  </div>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-500 opacity-50" />
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
                <TrendingUp className="h-10 w-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className={`${surfaceCardClass} border-red-200 bg-red-50/80 dark:border-rose-900/40 dark:bg-rose-950/40`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                {t('inventory.lowStockAlert', { count: lowStockProducts.length })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <Badge key={product._id} variant="destructive">
                    {product.name}: {product.quantity} {t('inventory.left')}
                  </Badge>
                ))}
                {lowStockProducts.length > 5 && (
                  <Badge variant="outline">+{lowStockProducts.length - 5} {t('inventory.more')}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Table */}
        <Card className={`${surfaceCardClass} overflow-hidden`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('inventory.currentStockLevels')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('inventory.loading')}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('products.noProducts')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('products.product')}</TableHead>
                    <TableHead>{t('products.barcode')}</TableHead>
                    <TableHead className="text-right">{t('inventory.currentStock')}</TableHead>
                    <TableHead className="text-right">{t('products.reorderLevel')}</TableHead>
                    <TableHead className="text-right">{t('products.cost')}</TableHead>
                    <TableHead className="text-right">{t('inventory.stockValue')}</TableHead>
                    <TableHead>{t('products.status')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockValue = product.quantity * product.costPrice;
                    const isLowStock = product.quantity <= product.reorderLevel;
                    
                    return (
                      <TableRow key={product._id} className={isLowStock ? "bg-red-50" : ""}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {product.barcode}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={isLowStock ? "text-red-600 font-bold" : ""}>
                            {product.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {product.reorderLevel}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.costPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(stockValue)}
                        </TableCell>
                        <TableCell>
                          {isLowStock ? (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {t('inventory.lowStock')}
                            </Badge>
                          ) : product.quantity === 0 ? (
                            <Badge variant="secondary">{t('inventory.outOfStock')}</Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-500">
                              {t('inventory.inStock')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
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
        <DialogContent>
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
              <label className="text-sm font-medium">{t('inventory.quantityChange')} *</label>
              <Input
                type="number"
                value={adjustmentData.quantity}
                onChange={(e) =>
                  setAdjustmentData({ ...adjustmentData, quantity: e.target.value })
                }
                placeholder={t('inventory.quantityPlaceholder')}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('inventory.newStock')}: {selectedProduct?.quantity + parseInt(adjustmentData.quantity || 0)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">{t('inventory.reason')} *</label>
              <Select
                value={adjustmentData.reason}
                onValueChange={(value) =>
                  setAdjustmentData({ ...adjustmentData, reason: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
              <label className="text-sm font-medium">{t('inventory.notes')}</label>
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
              onClick={() => {
                setShowAdjustDialog(false);
                setSelectedProduct(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAdjustStock}>{t('inventory.adjustStock')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('inventory.recordPurchaseOrder')}</DialogTitle>
            <DialogDescription>{t('inventory.recordPurchaseDesc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t('inventory.supplier')} *</label>
                <Input
                  value={purchaseData.supplier}
                  onChange={(e) =>
                    setPurchaseData({ ...purchaseData, supplier: e.target.value })
                  }
                  placeholder={t('inventory.supplierPlaceholder')}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('inventory.invoiceNumber')} *</label>
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
                <label className="text-sm font-medium">{t('inventory.items')}</label>
                <Button size="sm" variant="outline" onClick={addItemToPurchase}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {t('inventory.addItem')}
                </Button>
              </div>

              {purchaseData.items.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border rounded-lg">
                  {t('inventory.noItems')}
                </div>
              ) : (
                <div className="space-y-2">
                  {purchaseData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start border p-3 rounded-lg">
                      <Select
                        value={item.product_id}
                        onValueChange={(value) =>
                          updatePurchaseItem(index, "product_id", value)
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder={t('inventory.selectProduct')} />
                        </SelectTrigger>
                        <SelectContent>
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
                        onClick={() => removePurchaseItem(index)}
                      >
                        <TrendingDown className="h-4 w-4 text-destructive" />
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
              onClick={() => {
                setShowPurchaseDialog(false);
                setPurchaseData({ supplier: "", invoiceNumber: "", items: [] });
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={handleRecordPurchase}>{t('inventory.recordPurchase')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
