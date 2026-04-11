import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, X, Search, Barcode } from "lucide-react";
import PaymentModal from "./PaymentModal";
import { productsAPI } from "../../services/api";

export default function POSCheckoutPage() {
  const { t } = useTranslation();
  const [barcode, setBarcode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const barcodeRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load products from backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await productsAPI.getAll();
        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Failed to load products. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Auto-focus barcode input when POS is ready, without stealing focus from other inputs
  useEffect(() => {
    if (!showPayment && barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, [showPayment]);

  // Cart management functions
  const handleNewBill = useCallback(() => {
    setCart([]);
    setDiscount(0);
    setBarcode("");
    setSearchQuery("");
  }, []);

  const handleQuantityChange = useCallback((id, newQty) => {
    if (newQty < 1) return;
    setCart(prev => prev.map((item) => (item._id === id ? { ...item, quantity: newQty } : item)));
  }, []);

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item._id === product._id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      const tagName = document.activeElement?.tagName;
      const isTypingInField = tagName === "INPUT" || tagName === "TEXTAREA";

      if (e.key === "F1") {
        e.preventDefault();
        handleNewBill();
      } else if (e.key === "F2") {
        e.preventDefault();
        if (cart.length > 0) setShowPayment(true);
      } else if (e.key === "F3") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        if (cart.length > 0) handleQuantityChange(cart[0]._id, cart[0].quantity + 1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (showPayment) setShowPayment(false);
        else if (!isTypingInField && cart.length > 0 && window.confirm("Cancel current bill?")) {
          handleNewBill();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [cart, showPayment, handleNewBill, handleQuantityChange]);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setBarcode("");
    } else {
      alert("Product not found!");
      setBarcode("");
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const tax = subtotal * 0.0; // 0% tax - adjust as needed
  const grandTotal = subtotal + tax - discount;

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return products;

    return products.filter((product) =>
      String(product.name || "").toLowerCase().includes(normalizedQuery)
    );
  }, [products, searchQuery]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#1C1C1E] font-[Inter] text-white/90">
      {/* Background layers */}
      <div className="app-backdrop"></div>
      <div className="app-noise"></div>
      
      {/* Header */}
      <div className="relative z-10 border-b border-white/5 bg-[#2C2C2E] px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="hidden items-center justify-center rounded-xl border border-white/5 bg-white/[0.04] p-3 md:flex">
              <svg className="h-7 w-7 text-white/85" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white lg:text-2xl">{t('pos.title')}</h1>
              <p className="text-xs text-white/60 lg:text-sm">
                {t('pos.cashier')}: <span className="font-semibold text-white/90">{localStorage.getItem("username") || t('common.unknown')}</span>
              </p>
            </div>
          </div>
          <div className="hidden lg:flex gap-2 flex-wrap">
            <Badge variant="outline" className="border-white/10 bg-white/[0.04] px-3 py-1.5 font-medium text-white/85"><kbd className="rounded bg-black/20 px-1">F1</kbd> {t('pos.newBill')}</Badge>
            <Badge variant="outline" className="border-white/10 bg-white/[0.04] px-3 py-1.5 font-medium text-white/85"><kbd className="rounded bg-black/20 px-1">F2</kbd> {t('pos.payment')}</Badge>
            <Badge variant="outline" className="border-white/10 bg-white/[0.04] px-3 py-1.5 font-medium text-white/85"><kbd className="rounded bg-black/20 px-1">F3</kbd> {t('pos.search')}</Badge>
            <Badge variant="outline" className="border-white/10 bg-white/[0.04] px-3 py-1.5 font-medium text-white/85"><kbd className="rounded bg-black/20 px-1">ESC</kbd> {t('common.cancel')}</Badge>
          </div>
        </div>
      </div>

      {/* Main Layout - Responsive */}
      <div className="relative z-10 grid flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-12 lg:gap-3 lg:p-3">
        
        {/* LEFT PANEL - Barcode & Product Search */}
        <Card className="animate-slideInFromLeft flex flex-col rounded-xl border border-white/5 bg-[#2C2C2E] lg:col-span-3">
          <CardHeader className="border-b border-white/5 pb-2.5">
            <CardTitle className="flex items-center gap-2 text-base text-white/90 lg:text-base">
              <Search className="h-5 w-5 text-white/80" />
              {t('pos.productSearch')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col space-y-2.5 overflow-hidden pt-3">
            {/* Barcode Input */}
            <form onSubmit={handleBarcodeSubmit} className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-white/85 lg:text-sm">
                <Barcode className="h-4 w-4 text-white/75" />
                {t('pos.barcodeScanner')}
              </label>
              <Input
                ref={barcodeRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder={t('pos.barcodePlaceholder')}
                className="h-10 rounded-xl border-white/10 bg-[#1C1C1E] font-mono text-base text-white placeholder:text-white/35 focus-visible:ring-[#0A84FF] lg:h-11 lg:text-lg"
              />
            </form>

            {/* Search Bar */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-white/85 lg:text-sm">
                <Search className="pointer-events-none h-4 w-4 text-white/75" />
                {t('pos.searchProduct')}
              </label>
              <Input
                ref={searchInputRef}
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('pos.searchPlaceholder')}
                className="relative z-10 h-10 rounded-xl border-white/10 bg-[#1C1C1E] text-white placeholder:text-white/35 focus-visible:ring-[#0A84FF] lg:h-11"
              />
            </div>

            {/* Product Quick List */}
            <div className="flex-1 overflow-y-auto">
              <p className="mb-2 text-xs font-semibold text-white/85 lg:text-sm">{t('pos.quickSelect')}</p>
              {loading ? (
                <div className="py-8 text-center text-white/55">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#0A84FF]"></div>
                  <p className="mt-2">{t('common.loading')}</p>
                </div>
              ) : error ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 py-4 text-center text-sm text-white/80">
                  {error}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {(searchQuery ? filteredProducts : products.slice(0, 8)).map((product, index) => (
                    <Button
                      key={product._id}
                      variant="outline"
                      className="animate-slideIn h-auto w-full justify-start rounded-xl border border-white/10 bg-[#1C1C1E] px-3 py-2.5 text-white/90 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06]"
                      style={{animationDelay: `${index * 30}ms`}}
                      onClick={() => addToCart(product)}
                    >
                      <div className="text-left w-full">
                        <div className="text-sm font-medium leading-tight">{product.name}</div>
                        <div className="mt-1 flex justify-between text-xs opacity-90">
                          <span className="font-semibold text-white">Rs. {product.sellingPrice}</span>
                          <span className="font-medium text-white/55">
                            {t('inventory.stock')}: {product.quantity}
                          </span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* MIDDLE PANEL - Cart / Current Bill */}
        <Card className="animate-slideIn flex flex-col rounded-xl border border-white/5 bg-[#2C2C2E] lg:col-span-6">
          <CardHeader className="border-b border-white/5 bg-transparent pb-2.5">
            <CardTitle className="flex items-center justify-between text-base text-white/95 lg:text-base">
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {t('pos.currentBill')}
              </span>
              <Badge variant="secondary" className="pill border border-white/10 bg-white/[0.06] px-3 py-1 font-medium text-white/90">{cart.length} {cart.length === 1 ? 'item' : 'items'}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col space-y-2 overflow-hidden p-0 pt-2.5">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-3.5">
              {cart.length === 0 ? (
                <div className="flex h-full items-center justify-center p-8 text-white/55">
                  <div className="text-center">
                    <div className="mb-4 inline-block rounded-full border border-white/5 bg-white/[0.03] p-6">
                      <svg className="h-16 w-16 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="mb-1 text-lg font-medium text-white/90">Empty Cart</p>
                    <p className="text-sm">{t('pos.emptyCartHelp')}</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/5 rounded-xl border border-white/5 bg-[#1C1C1E]">
                  {cart.map((item, index) => (
                    <div key={item._id} className="animate-slideIn px-3 py-2.5 transition-colors hover:bg-white/[0.04]" style={{animationDelay: `${index * 50}ms`}}>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-sm font-medium text-white lg:text-[15px]">{item.name}</div>
                          <div className="mt-0.5 font-mono text-xs text-white/45">{item.barcode}</div>
                          <div className="mt-1 text-sm font-semibold text-white/90">Rs. {item.sellingPrice}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 rounded-lg border border-white/10 bg-white/[0.03] p-0 text-white/90 hover:bg-white/[0.08]"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(item._id, parseInt(e.target.value) || 1)
                            }
                            className="h-8 w-14 rounded-lg border border-white/10 bg-white/[0.03] text-center font-semibold text-white focus:border-[#0A84FF] focus:outline-none"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 rounded-lg border border-white/10 bg-white/[0.03] p-0 text-white/90 hover:bg-white/[0.08]"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right shrink-0 min-w-20">
                          <div className="text-base font-bold text-white lg:text-lg">
                            Rs. {(item.sellingPrice * item.quantity).toFixed(2)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 rounded-lg p-0 text-white/55 hover:bg-white/[0.08] hover:text-white"
                          onClick={() => removeFromCart(item._id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bill Summary */}
            <div className="space-y-2 border-t border-white/5 bg-[#2C2C2E] px-4 py-3.5">
              <div className="flex justify-between text-base text-white/85 lg:text-lg">
                <span className="font-medium">{t('pos.subtotal')}:</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-white/85">{t('pos.discount')}:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="h-9 w-24 border-white/10 bg-[#1C1C1E] text-right font-semibold text-white focus-visible:ring-[#0A84FF]"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex justify-between text-base text-white/85 lg:text-lg">
                <span className="font-medium">{t('pos.tax', { percent: 0 })}:</span>
                <span className="font-bold">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-2xl font-bold text-white lg:text-3xl">
                <span>{t('pos.total').toUpperCase()}:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT PANEL - Payment Actions */}
        <Card className="animate-slideInFromRight flex flex-col rounded-xl border border-white/5 bg-[#2C2C2E] lg:col-span-3">
          <CardHeader className="border-b border-white/5 bg-transparent pb-2.5">
            <CardTitle className="flex items-center gap-2 text-base text-white/95 lg:text-base">
              <svg className="h-5 w-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {t('pos.payment')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col space-y-2.5 pt-3">
            <Button
              size="lg"
              className="h-12 w-full rounded-xl bg-[#0A84FF] text-lg font-bold text-white transition-all duration-200 hover:brightness-110 lg:h-14 lg:text-xl"
              disabled={cart.length === 0}
              onClick={() => setShowPayment(true)}
            >
              {t('pos.proceedToPayment')}
            </Button>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/55 lg:text-sm">{t('pos.quickPayment')}</p>
              <Button
                variant="outline"
                className="h-11 w-full rounded-xl border border-white/10 bg-[#1C1C1E] text-base font-medium text-white/90 transition-all duration-200 hover:bg-white/[0.08] lg:h-12 lg:text-lg"
                disabled={cart.length === 0}
                onClick={() => setShowPayment(true)}
              >
                <span className="text-2xl mr-2">💵</span> {t('pos.cash')}
              </Button>
              <Button
                variant="outline"
                className="h-11 w-full rounded-xl border border-white/10 bg-[#1C1C1E] text-base font-medium text-white/90 transition-all duration-200 hover:bg-white/[0.08] lg:h-12 lg:text-lg"
                disabled={cart.length === 0}
                onClick={() => setShowPayment(true)}
              >
                <span className="text-2xl mr-2">💳</span> {t('pos.card')}
              </Button>
              <Button
                variant="outline"
                className="h-11 w-full rounded-xl border border-white/10 bg-[#1C1C1E] text-base font-medium text-white/90 transition-all duration-200 hover:bg-white/[0.08] lg:h-12 lg:text-lg"
                disabled={cart.length === 0}
                onClick={() => setShowPayment(true)}
              >
                <span className="text-2xl mr-2">📱</span> {t('pos.qrUpi')}
              </Button>
            </div>

            <div className="flex-1" />

            <div className="space-y-2 border-t border-white/5 pt-2">
              <Button
                variant="outline"
                className="h-10 w-full rounded-xl border border-white/10 bg-[#1C1C1E] font-semibold text-white/90 hover:bg-white/[0.08] lg:h-11"
                disabled={cart.length === 0}
              >
                <span className="text-xl mr-2">⏸️</span> {t('pos.holdBill')}
              </Button>
              <Button
                variant="outline"
                className="h-10 w-full rounded-xl border border-white/10 bg-[#1C1C1E] font-semibold text-white/90 hover:bg-white/[0.08] lg:h-11"
                onClick={handleNewBill}
                disabled={cart.length === 0}
              >
                <span className="text-xl mr-2">🗑️</span> {t('pos.clearBill')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={grandTotal}
          cart={cart}
          discount={discount}
          onClose={() => setShowPayment(false)}
          onComplete={handleNewBill}
        />
      )}
    </div>
  );
}
