import { useState, useEffect } from "react";
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
import { Search, Plus, Edit, Trash2, Package, ArrowLeft, Printer, Scan } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { productsAPI } from "../../services/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../lib/utils";
import BarcodePrintDialog from "../../components/BarcodePrintDialog";
import PageHeader from "@/components/PageHeader";

export default function ProductsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [printingProduct, setPrintingProduct] = useState(null);
    const [lookingUpBarcode, setLookingUpBarcode] = useState(false);
    const [barcodeInput, setBarcodeInput] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category: "",
    brand: "",
    imageUrl: "",
    costPrice: "",
    sellingPrice: "",
    wholeSalePrice: "",
    quantity: "",
    reorderLevel: "",
    supplier: "",
    sku: "",
    expiryDate: "",
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll(searchQuery, categoryFilter === "all" ? "" : categoryFilter);
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productsAPI.get("/api/categories");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const loadBrands = async () => {
    try {
      const response = await productsAPI.get("/api/brands");
      setBrands(response.data || []);
    } catch (error) {
      console.error("Error loading brands:", error);
      toast.error("Failed to load brands");
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter]);

  const handleBarcodeInput = (value) => {
    setBarcodeInput(value);
    setFormData({ ...formData, barcode: value });
  };

  const handleBarcodeLookup = async () => {
    if (!barcodeInput || barcodeInput.trim().length < 8) {
      toast.error("Please enter a valid barcode (at least 8 digits)");
      return;
    }

    try {
      setLookingUpBarcode(true);
      const result = await productsAPI.lookupByBarcode(barcodeInput.trim());

      if (result.existsInDatabase) {
        toast.info("Product already exists in your database");
        const product = result.product;
        setFormData({
          name: product.name,
          barcode: product.barcode,
          category: product.category,
          imageUrl: product.imageUrl || "",
          costPrice: product.costPrice.toString(),
          sellingPrice: product.sellingPrice.toString(),
          wholeSalePrice: product.wholeSalePrice?.toString() || "",
          quantity: product.quantity.toString(),
          reorderLevel: product.reorderLevel.toString(),
          supplier: product.supplier || "",
          sku: product.sku || "",
          expiryDate: product.expiryDate
            ? new Date(product.expiryDate).toISOString().split("T")[0]
            : "",
        });
      } else if (result.found) {
        toast.success(`Product found via ${result.product.source}!`);
        const product = result.product;
        
        setFormData({
          name: product.name || formData.name,
          barcode: product.barcode || formData.barcode,
          category: product.category || formData.category,
          imageUrl: product.image || formData.imageUrl,
          costPrice: formData.costPrice,
          sellingPrice: formData.sellingPrice,
          wholeSalePrice: formData.wholeSalePrice,
          quantity: formData.quantity || "0",
          reorderLevel: formData.reorderLevel || "10",
          supplier: product.brand || formData.supplier,
          sku: formData.sku,
          expiryDate: formData.expiryDate,
        });
        
        toast.info("Please set your cost and selling prices");
      }
    } catch (error) {
      console.error("Barcode lookup error:", error);
      if (error.response?.status === 404) {
        toast.warning("Product not found in barcode databases. You can add it manually.");
      } else {
        toast.error("Failed to lookup barcode");
      }
    } finally {
      setLookingUpBarcode(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        barcode: product.barcode,
        category: product.category,
        imageUrl: product.imageUrl || "",
        costPrice: product.costPrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        wholeSalePrice: product.wholeSalePrice?.toString() || "",
        quantity: product.quantity.toString(),
        reorderLevel: product.reorderLevel.toString(),
        supplier: product.supplier || "",
        sku: product.sku || "",
        expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        barcode: "",
        category: "",
        brand: "",
        imageUrl: "",
        costPrice: "",
        sellingPrice: "",
        wholeSalePrice: "",
        quantity: "",
        reorderLevel: "",
        supplier: "",
        sku: "",
        expiryDate: "",
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        ...formData,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        wholeSalePrice: formData.wholeSalePrice ? parseFloat(formData.wholeSalePrice) : undefined,
        quantity: parseInt(formData.quantity),
        reorderLevel: parseInt(formData.reorderLevel),
        expiryDate: formData.expiryDate || undefined,
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct._id, productData);
        toast.success("Product updated successfully");
      } else {
        await productsAPI.create(productData);
        toast.success("Product created successfully");
      }

      handleCloseDialog();
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.message || "Failed to save product");
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await productsAPI.delete(deletingProduct._id);
      toast.success("Product deleted successfully");
      setShowDeleteDialog(false);
      setDeletingProduct(null);
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const filteredProducts = products;
  const surfaceCardClass = "surface";
  const lowStockCount = products.filter((product) => product.quantity <= product.reorderLevel).length;
  const categoryCount = new Set(products.map((product) => product.category)).size;
  const totalInventoryValue = products.reduce(
    (sum, product) => sum + (product.quantity || 0) * (product.costPrice || 0),
    0
  );
  const headerStats = [
    {
      label: t('products.products'),
      value: products.length.toString(),
      tone: 'blue',
      isLoading: loading,
      helper: t('products.subtitle'),
    },
    {
      label: t('inventory.lowStock'),
      value: lowStockCount.toString(),
      tone: 'rose',
      isLoading: loading,
      helper: lowStockCount ? t('inventory.lowStockAlert', { count: lowStockCount }) : t('inventory.inStock'),
    },
    {
      label: t('products.category'),
      value: categoryCount.toString(),
      tone: 'violet',
      isLoading: loading,
      helper: t('products.allCategories'),
    },
    {
      label: t('inventory.inventoryValue'),
      value: formatCurrency(totalInventoryValue),
      tone: 'emerald',
      isLoading: loading,
      helper: 'Across catalog',
    },
  ];

  const headerActions = [
    <Button
      key="products-back"
      variant="outline"
      className="h-11 rounded-xl border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
      onClick={() => navigate("/admin/dashboard")}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {t('common.back')}
    </Button>,
    <Button
      key="products-add"
      className="h-11 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--background))] hover:brightness-110"
      onClick={() => handleOpenDialog()}
    >
      <Plus className="mr-2 h-4 w-4" />
      {t('products.addProduct')}
    </Button>,
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        badge={t('dashboard.overview')}
        breadcrumbs={[
          { label: 'SDM GROCERY', href: '/admin/dashboard' },
          { label: t('products.title') },
        ]}
        actions={headerActions}
        stats={headerStats}
      />

      <div className="space-y-6">
        <Card className={`${surfaceCardClass} overflow-hidden`}>
          <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t('products.products')} ({products.length})
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {/* Search */}
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    placeholder={t('products.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('products.category')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('products.allCategories')}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('products.noProducts')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>{t('products.name')}</TableHead>
                    <TableHead>{t('products.barcode')}</TableHead>
                    <TableHead>{t('products.category')}</TableHead>
                    <TableHead className="text-right">{t('products.cost')}</TableHead>
                    <TableHead className="text-right">{t('products.sellingPrice')}</TableHead>
                    <TableHead className="text-right">{t('products.stock')}</TableHead>
                    <TableHead>{t('products.status')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect fill="%23f0f0f0" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="16" fill="%23999"%3E%3F%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] flex items-center justify-center">
                            <Package className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {product.barcode}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category?.name || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.costPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.sellingPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            product.quantity <= product.reorderLevel
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {product.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        {product.isActive ? (
                          <Badge variant="default" className="bg-green-500">
                            {t('products.active')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{t('products.inactive')}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPrintingProduct(product);
                              setShowBarcodeDialog(true);
                            }}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingProduct(product);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? t('products.editProduct') : t('products.addNewProduct')}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? t('products.updateProductDesc')
                : t('products.addProductDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <label className="text-sm font-medium">{t('products.productName')} *</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t('products.productNamePlaceholder')}
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">{t('products.barcode')} *</label>
              <div className="flex gap-2">
                <Input
                  value={formData.barcode}
                  onChange={(e) => handleBarcodeInput(e.target.value)}
                  placeholder={t('products.barcodePlaceholder')}
                  disabled={lookingUpBarcode}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBarcodeLookup}
                  disabled={lookingUpBarcode || !formData.barcode}
                >
                  {lookingUpBarcode ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      {t('products.lookingUp')}
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4 mr-2" />
                      {t('products.lookup')}
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('products.lookupHelp')}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">{t('products.category')} *</label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Brand</label>
              <Select
                value={formData.brand}
                onValueChange={(value) =>
                  setFormData({ ...formData, brand: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a brand (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand._id} value={brand._id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">{t('products.costPrice')} *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: e.target.value })
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t('products.sellingPrice')} *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) =>
                  setFormData({ ...formData, sellingPrice: e.target.value })
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t('products.wholesalePrice')}</label>
              <Input
                type="number"
                step="0.01"
                value={formData.wholeSalePrice}
                onChange={(e) =>
                  setFormData({ ...formData, wholeSalePrice: e.target.value })
                }
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t('products.initialStock')} *</label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t('products.reorderLevel')} *</label>
              <Input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) =>
                  setFormData({ ...formData, reorderLevel: e.target.value })
                }
                placeholder="10"
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t('products.supplier')}</label>
              <Input
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                placeholder={t('products.supplierPlaceholder')}
              />
            </div>

            <div>
              <label className="text-sm font-medium">{t('products.sku')}</label>
              <Input
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder={t('products.skuPlaceholder')}
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">{t('products.imageUrl')}</label>
              <Input
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://..."
              />
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Product"
                    className="h-32 w-32 object-cover rounded border"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">{t('products.expiryDate')}</label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveProduct}>
              {editingProduct ? t('products.updateProduct') : t('products.addProduct')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('products.deleteProduct')}</DialogTitle>
            <DialogDescription>
              {t('products.deleteConfirmation', { name: deletingProduct?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletingProduct(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Print Dialog */}
      <BarcodePrintDialog
        product={printingProduct}
        open={showBarcodeDialog}
        onClose={() => {
          setShowBarcodeDialog(false);
          setPrintingProduct(null);
        }}
      />
    </div>
  );
}
