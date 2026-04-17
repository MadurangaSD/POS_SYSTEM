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
import { productsAPI, categoriesAPI, brandsAPI } from "../../services/api";
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

  const objectIdPattern = /^[a-fA-F0-9]{24}$/;

  const normalizeRelationId = (value) => {
    if (!value || value === "" || value === "null") return null;

    const normalized =
      typeof value === "object" ? value?._id || value?.id || "" : String(value).trim();

    return objectIdPattern.test(normalized) ? normalized : null;
  };

  const toNumber = (value, fallback = null, integer = false) => {
    if (value === null || value === undefined || value === "") return fallback;

    const parsed = integer ? Number.parseInt(value, 10) : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const getApiErrorMessage = (error, fallback = "Request failed") => {
    const details = error.response?.data?.details;
    const message = error.response?.data?.error;

    if (Array.isArray(details) && details.length > 0) {
      return `${message || fallback}: ${details.join("; ")}`;
    }

    return message || fallback;
  };

  const getRelationId = (value) => {
    return normalizeRelationId(value);
  };

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
      const data = await categoriesAPI.getAll();
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const loadBrands = async () => {
    try {
      const data = await brandsAPI.getAll();
      setBrands(data || []);
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
          category: getRelationId(product.category),
          brand: getRelationId(product.brand),
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
          category: getRelationId(product.category) || formData.category || null,
          brand: getRelationId(product.brand) || formData.brand || null,
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
        category: getRelationId(product.category),
        brand: getRelationId(product.brand),
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
      const costPrice = toNumber(formData.costPrice);
      const sellingPrice = toNumber(formData.sellingPrice);

      if (!Number.isFinite(costPrice) || !Number.isFinite(sellingPrice)) {
        toast.error("Cost price and selling price are required");
        return;
      }

      const productData = {
        ...formData,
        barcode: formData.barcode?.trim() || null,
        category: getRelationId(formData.category),
        brand: getRelationId(formData.brand),
        costPrice,
        sellingPrice,
        wholeSalePrice: formData.wholeSalePrice ? toNumber(formData.wholeSalePrice) : undefined,
        quantity: toNumber(formData.quantity, 0, true),
        reorderLevel: toNumber(formData.reorderLevel, 10, true),
        expiryDate: formData.expiryDate || undefined,
        sku: formData.sku?.trim() || null,
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
      toast.error(getApiErrorMessage(error, "Failed to save product"));
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

  const getCategoryName = (productCategory) => {
    if (!productCategory) return t('products.uncategorized', 'Uncategorized');

    if (typeof productCategory === 'object' && productCategory.name) {
      return productCategory.name;
    }

    const matchedCategory = categories.find((cat) => cat._id === productCategory);
    return matchedCategory?.name || t('products.uncategorized', 'Uncategorized');
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const productCategoryId =
      typeof product.category === "object" ? product.category?._id : product.category;

    const matchesCategory =
      categoryFilter === "all" || String(productCategoryId || "") === String(categoryFilter);

    if (!normalizedQuery) return matchesCategory;

    const categoryName = getCategoryName(product.category).toLowerCase();
    const matchesSearch =
      String(product.name || "").toLowerCase().includes(normalizedQuery) ||
      String(product.barcode || "").toLowerCase().includes(normalizedQuery) ||
      String(product.sku || "").toLowerCase().includes(normalizedQuery) ||
      String(product.supplier || "").toLowerCase().includes(normalizedQuery) ||
      categoryName.includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });

  const surfaceCardClass = "rounded-xl border border-white/5 bg-[#242426]";
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
      tone: 'slate',
      isLoading: loading,
      helper: t('products.subtitle'),
    },
    {
      label: t('inventory.lowStock'),
      value: lowStockCount.toString(),
      tone: 'slate',
      isLoading: loading,
      helper: lowStockCount ? t('inventory.lowStockAlert', { count: lowStockCount }) : t('inventory.inStock'),
    },
    {
      label: t('products.category'),
      value: categoryCount.toString(),
      tone: 'slate',
      isLoading: loading,
      helper: t('products.allCategories'),
    },
    {
      label: t('inventory.inventoryValue'),
      value: formatCurrency(totalInventoryValue),
      tone: 'slate',
      isLoading: loading,
      helper: 'Across catalog',
    },
  ];

  const headerActions = [
    <Button
      key="products-back"
      variant="outline"
      className="h-11 rounded-xl border border-white/10 bg-[#2C2C2E] text-white/90 transition-all duration-200 hover:bg-white/[0.08]"
      onClick={() => navigate("/admin/dashboard")}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {t('common.back')}
    </Button>,
    <Button
      key="products-add"
      className="h-11 rounded-xl border border-white/10 bg-white/[0.1] text-white transition-all duration-200 hover:bg-white/[0.16]"
      onClick={() => handleOpenDialog()}
    >
      <Plus className="mr-2 h-4 w-4" />
      {t('products.addProduct')}
    </Button>,
  ];

  return (
    <div className="space-y-6 text-white/90">
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

      <div className="space-y-6 rounded-xl bg-[#1C1C1E]">
        <Card className={`${surfaceCardClass} overflow-hidden`}>
          <CardHeader className="border-b border-white/5 bg-[#242426]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-white/95">
                <Package className="h-5 w-5" />
                {t('products.products')} ({filteredProducts.length})
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {/* Search */}
                <div className="relative w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                  <Input
                    placeholder={t('products.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="relative z-10 h-10 rounded-xl border-white/10 bg-[#1C1C1E] pl-10 text-white placeholder:text-white/35 focus-visible:ring-[#0A84FF]"
                  />
                </div>
                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-10 w-40 rounded-xl border-white/10 bg-[#1C1C1E] text-white/90">
                    <SelectValue placeholder={t('products.category')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 bg-[#2C2C2E] text-white/90">
                    <SelectItem value="all">{t('products.allCategories')}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-[#242426] p-0">
            {loading ? (
              <div className="py-8 text-center text-white/55">
                {t('common.loading')}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-white/55">
                {t('products.noProducts')}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-[#242426]">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="w-12 text-white/55"></TableHead>
                    <TableHead className="text-white/55">{t('products.name')}</TableHead>
                    <TableHead className="text-white/55">{t('products.barcode')}</TableHead>
                    <TableHead className="text-white/55">{t('products.category')}</TableHead>
                    <TableHead className="text-right text-white/55">{t('products.cost')}</TableHead>
                    <TableHead className="text-right text-white/55">{t('products.sellingPrice')}</TableHead>
                    <TableHead className="text-right text-white/55">{t('products.stock')}</TableHead>
                    <TableHead className="text-white/55">{t('products.status')}</TableHead>
                    <TableHead className="text-right text-white/55">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id} className="border-white/5 hover:bg-white/[0.03]">
                      <TableCell>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg border border-white/10 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect fill="%23f0f0f0" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="16" fill="%23999"%3E%3F%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                            <Package className="h-5 w-5 text-white/45" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-white/92">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm text-white/70">
                        {product.barcode}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-white/80">
                          {getCategoryName(product.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-white/85">
                        {formatCurrency(product.costPrice)}
                      </TableCell>
                      <TableCell className="text-right text-white/95">
                        {formatCurrency(product.sellingPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            product.quantity <= product.reorderLevel
                              ? "font-semibold text-white"
                              : "text-white/85"
                          }
                        >
                          {product.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        {product.isActive ? (
                          <Badge variant="default" className="border border-white/10 bg-white/[0.14] text-white">
                            {t('products.active')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="border border-white/10 bg-white/[0.03] text-white/70">{t('products.inactive')}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/75 hover:bg-white/[0.08] hover:text-white"
                            onClick={() => handleOpenDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/75 hover:bg-white/[0.08] hover:text-white"
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
                            className="text-white/75 hover:bg-white/[0.08] hover:text-white"
                            onClick={() => {
                              setDeletingProduct(product);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#1C1C1E] text-white">
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
              <label className="text-sm font-medium text-white/85">{t('products.productName')} *</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t('products.productNamePlaceholder')}
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-white/85">{t('products.barcode')} *</label>
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
                  className="border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]"
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
              <p className="mt-1 text-xs text-white/55">
                {t('products.lookupHelp')}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-white/85">{t('products.category')} *</label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value || null })
                }
              >
                <SelectTrigger className="bg-[#242426]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1E]">
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-white/85">Brand</label>
              <Select
                value={formData.brand || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, brand: value || null })
                }
              >
                <SelectTrigger className="bg-[#242426]">
                  <SelectValue placeholder="Select a brand (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1E]">
                  {brands.map((brand) => (
                    <SelectItem key={brand._id} value={brand._id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-white/85">{t('products.costPrice')} *</label>
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
              <label className="text-sm font-medium text-white/85">{t('products.sellingPrice')} *</label>
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
              <label className="text-sm font-medium text-white/85">{t('products.wholesalePrice')}</label>
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
              <label className="text-sm font-medium text-white/85">{t('products.initialStock')} *</label>
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
              <label className="text-sm font-medium text-white/85">{t('products.reorderLevel')} *</label>
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
              <label className="text-sm font-medium text-white/85">{t('products.supplier')}</label>
              <Input
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                placeholder={t('products.supplierPlaceholder')}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white/85">{t('products.sku')}</label>
              <Input
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder={t('products.skuPlaceholder')}
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-white/85">{t('products.imageUrl')}</label>
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
              <label className="text-sm font-medium text-white/85">{t('products.expiryDate')}</label>
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
            <Button variant="outline" className="border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]" onClick={handleCloseDialog}>
              {t('common.cancel')}
            </Button>
            <Button className="bg-[#0A84FF] text-white hover:brightness-110" onClick={handleSaveProduct}>
              {editingProduct ? t('products.updateProduct') : t('products.addProduct')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl border border-white/10 bg-[#1C1C1E] text-white">
          <DialogHeader>
            <DialogTitle>{t('products.deleteProduct')}</DialogTitle>
            <DialogDescription>
              {t('products.deleteConfirmation', { name: deletingProduct?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletingProduct(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button className="bg-[#0A84FF] text-white hover:brightness-110" onClick={handleDeleteProduct}>
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
