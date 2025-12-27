import { useState, useEffect, useRef, useCallback } from "react";
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

  // Auto-focus barcode input always
  useEffect(() => {
    const focusBarcode = () => {
      if (!showPayment && barcodeRef.current) {
        barcodeRef.current.focus();
      }
    };
    focusBarcode();
    document.addEventListener("click", focusBarcode);
    return () => document.removeEventListener("click", focusBarcode);
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
      if (e.key === "F1") {
        e.preventDefault();
        handleNewBill();
      } else if (e.key === "F2") {
        e.preventDefault();
        if (cart.length > 0) setShowPayment(true);
      } else if (e.key === "F3") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        if (cart.length > 0) handleQuantityChange(cart[0].id, cart[0].quantity + 1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (showPayment) setShowPayment(false);
        else if (cart.length > 0 && window.confirm("Cancel current bill?")) {
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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-[hsl(var(--background))] relative overflow-hidden">
      {/* Background layers */}
      <div className="app-backdrop"></div>
      <div className="app-noise"></div>
      
      {/* Header */}
      <div className="relative z-10 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] shadow-[0_18px_50px_-35px_rgba(0,0,0,0.6)] px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center justify-center p-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] shadow-[0_18px_40px_-30px_rgba(0,0,0,0.7)]">
              <svg className="w-7 h-7 text-[hsl(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-semibold text-[hsl(var(--foreground))]">{t('pos.title')}</h1>
              <p className="text-xs lg:text-sm text-[hsl(var(--muted-foreground))]">
                {t('pos.cashier')}: <span className="font-semibold text-[hsl(var(--primary))]">{localStorage.getItem("username") || t('common.unknown')}</span>
              </p>
            </div>
          </div>
          <div className="hidden lg:flex gap-2 flex-wrap">
            <Badge variant="outline" className="px-3 py-1.5 font-medium border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"><kbd className="px-1 rounded bg-[hsl(var(--card))]">F1</kbd> {t('pos.newBill')}</Badge>
            <Badge variant="outline" className="px-3 py-1.5 font-medium border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"><kbd className="px-1 rounded bg-[hsl(var(--card))]">F2</kbd> {t('pos.payment')}</Badge>
            <Badge variant="outline" className="px-3 py-1.5 font-medium border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"><kbd className="px-1 rounded bg-[hsl(var(--card))]">F3</kbd> {t('pos.search')}</Badge>
            <Badge variant="outline" className="px-3 py-1.5 font-medium border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"><kbd className="px-1 rounded bg-[hsl(var(--card))]">ESC</kbd> {t('common.cancel')}</Badge>
          </div>
        </div>
      </div>

      {/* Main Layout - Responsive */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 p-3 lg:p-4 overflow-hidden">
        
        {/* LEFT PANEL - Barcode & Product Search */}
        <Card className="lg:col-span-3 flex flex-col surface animate-slideInFromLeft">
          <CardHeader className="pb-3 border-b border-[hsl(var(--border))]">
            <CardTitle className="text-base lg:text-lg flex items-center gap-2 text-[hsl(var(--foreground))]">
              <Search className="w-5 h-5 text-[hsl(var(--primary))]" />
              {t('pos.productSearch')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-3 overflow-hidden pt-4">
            {/* Barcode Input */}
            <form onSubmit={handleBarcodeSubmit} className="space-y-2">
              <label className="text-xs lg:text-sm font-semibold flex items-center gap-2 text-[hsl(var(--foreground))]">
                <Barcode className="h-4 w-4 text-[hsl(var(--primary))]" />
                {t('pos.barcodeScanner')}
              </label>
              <Input
                ref={barcodeRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder={t('pos.barcodePlaceholder')}
                className="h-11 lg:h-12 text-base lg:text-lg font-mono"
              />
            </form>

            {/* Search Bar */}
            <div className="space-y-2">
              <label className="text-xs lg:text-sm font-semibold flex items-center gap-2 text-[hsl(var(--foreground))]">
                <Search className="h-4 w-4 text-[hsl(var(--primary))]" />
                {t('pos.searchProduct')}
              </label>
              <Input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('pos.searchPlaceholder')}
                className="h-11 lg:h-12"
              />
            </div>

            {/* Product Quick List */}
            <div className="flex-1 overflow-y-auto">
              <p className="text-xs lg:text-sm font-semibold mb-3 text-[hsl(var(--foreground))]">{t('pos.quickSelect')}</p>
              {loading ? (
                <div className="text-center text-[hsl(var(--muted-foreground))] py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]"></div>
                  <p className="mt-2">{t('common.loading')}</p>
                </div>
              ) : error ? (
                <div className="text-center text-[hsl(var(--destructive))] py-4 text-sm bg-[color-mix(in_srgb,hsl(var(--destructive))_10%,transparent)] rounded-lg p-3 border border-[color-mix(in_srgb,hsl(var(--destructive))_30%,transparent)]">
                  {error}
                </div>
              ) : (
                <div className="space-y-2">
                  {(searchQuery ? filteredProducts : products.slice(0, 8)).map((product, index) => (
                    <Button
                      key={product._id}
                      variant="outline"
                      className="w-full justify-start h-auto py-3 px-3 border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all duration-200 animate-slideIn"
                      style={{animationDelay: `${index * 30}ms`}}
                      onClick={() => addToCart(product)}
                    >
                      <div className="text-left w-full">
                        <div className="font-semibold text-sm">{product.name}</div>
                        <div className="text-xs flex justify-between mt-1 opacity-80">
                          <span className="font-medium text-[hsl(var(--primary))]">Rs. {product.sellingPrice}</span>
                          <span className="font-medium text-[hsl(var(--muted-foreground))]">
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
        <Card className="lg:col-span-6 flex flex-col surface animate-slideIn">
          <CardHeader className="pb-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <CardTitle className="text-base lg:text-lg flex items-center justify-between text-[hsl(var(--foreground))]">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[hsl(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {t('pos.currentBill')}
              </span>
              <Badge variant="secondary" className="font-semibold pill px-3 py-1">{cart.length} {cart.length === 1 ? 'item' : 'items'}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-3 overflow-hidden p-0 pt-4">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))] p-8">
                  <div className="text-center">
                    <div className="mb-4 p-6 rounded-full bg-[hsl(var(--secondary))] inline-block">
                      <svg className="h-16 w-16 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium mb-1 text-[hsl(var(--foreground))]">Empty Cart</p>
                    <p className="text-sm">{t('pos.emptyCartHelp')}</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[hsl(var(--border))]">
                  {cart.map((item, index) => (
                    <div key={item._id} className="p-4 hover:bg-[hsl(var(--secondary))] transition-colors animate-slideIn rounded-lg" style={{animationDelay: `${index * 50}ms`}}>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm lg:text-base truncate text-[hsl(var(--foreground))]">{item.name}</div>
                          <div className="text-xs text-[hsl(var(--muted-foreground))] font-mono mt-0.5">{item.barcode}</div>
                          <div className="text-sm font-medium text-[hsl(var(--primary))] mt-1">Rs. {item.sellingPrice}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 rounded-lg border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))]"
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
                            className="w-14 h-8 text-center border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] rounded-lg font-semibold focus:border-[hsl(var(--primary))] focus:outline-none"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 rounded-lg border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right shrink-0 min-w-20">
                          <div className="font-bold text-base lg:text-lg text-[hsl(var(--primary))]">
                            Rs. {(item.sellingPrice * item.quantity).toFixed(2)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-[hsl(var(--destructive))] hover:bg-[color-mix(in_srgb,hsl(var(--destructive))_12%,transparent)] hover:text-[hsl(var(--destructive))] rounded-lg shrink-0"
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
            <div className="border-t border-[hsl(var(--border))] p-4 bg-[hsl(var(--card))] space-y-3 px-4">
              <div className="flex justify-between text-base lg:text-lg text-[hsl(var(--foreground))]">
                <span className="font-medium">{t('pos.subtotal')}:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-[hsl(var(--foreground))]">{t('pos.discount')}:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 h-9 text-right font-semibold border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary))]"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex justify-between text-base lg:text-lg text-[hsl(var(--foreground))]">
                <span className="font-medium">{t('pos.tax', { percent: 0 })}:</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-2xl lg:text-3xl font-bold border-t border-[hsl(var(--border))] pt-3 text-[hsl(var(--primary))]">
                <span>{t('pos.total').toUpperCase()}:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT PANEL - Payment Actions */}
        <Card className="lg:col-span-3 flex flex-col surface animate-slideInFromRight">
          <CardHeader className="pb-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <CardTitle className="text-base lg:text-lg flex items-center gap-2 text-[hsl(var(--foreground))]">
              <svg className="w-5 h-5 text-[hsl(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {t('pos.payment')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-3 pt-4">
            <Button
              size="lg"
              className="w-full h-14 lg:h-16 text-lg lg:text-xl font-bold bg-[hsl(var(--primary))] text-[hsl(var(--background))] hover:brightness-110 transition-all duration-200"
              disabled={cart.length === 0}
              onClick={() => setShowPayment(true)}
            >
              {t('pos.proceedToPayment')}
            </Button>

            <div className="space-y-2">
              <p className="text-xs lg:text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{t('pos.quickPayment')}</p>
              <Button
                variant="outline"
                className="w-full h-12 lg:h-14 text-base lg:text-lg font-medium border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all duration-200"
                disabled={cart.length === 0}
                onClick={() => setShowPayment(true)}
              >
                <span className="text-2xl mr-2">💵</span> {t('pos.cash')}
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 lg:h-14 text-base lg:text-lg font-medium border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all duration-200"
                disabled={cart.length === 0}
                onClick={() => setShowPayment(true)}
              >
                <span className="text-2xl mr-2">💳</span> {t('pos.card')}
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 lg:h-14 text-base lg:text-lg font-medium border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all duration-200"
                disabled={cart.length === 0}
                onClick={() => setShowPayment(true)}
              >
                <span className="text-2xl mr-2">📱</span> {t('pos.qrUpi')}
              </Button>
            </div>

            <div className="flex-1" />

            <div className="space-y-2 pt-2 border-t border-[hsl(var(--border))]">
              <Button
                variant="outline"
                className="w-full h-11 lg:h-12 font-semibold border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                disabled={cart.length === 0}
              >
                <span className="text-xl mr-2">⏸️</span> {t('pos.holdBill')}
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 lg:h-12 font-semibold border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[color-mix(in_srgb,hsl(var(--destructive))_12%,transparent)] hover:border-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))]"
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
