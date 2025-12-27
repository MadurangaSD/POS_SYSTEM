import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReceiptPrint from "./ReceiptPrint";
import { formatCurrency } from "../../lib/utils";
import { salesAPI } from "../../services/api";

export default function PaymentModal({ total, cart, discount, onClose, onComplete }) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const change = parseFloat(cashReceived || 0) - total;

  const handleNumPad = (value) => {
    if (value === "clear") {
      setCashReceived("");
    } else if (value === "backspace") {
      setCashReceived(cashReceived.slice(0, -1));
    } else if (value === ".") {
      if (!cashReceived.includes(".")) {
        setCashReceived(cashReceived + ".");
      }
    } else {
      setCashReceived(cashReceived + value);
    }
  };

  const handleQuickAmount = () => {
    setCashReceived(total.toString());
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === "cash" && change < 0) {
      alert("Insufficient cash received!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare sale data for backend
      const saleData = {
        items: cart.map(item => ({
          product_id: item._id,
          quantity: item.quantity,
          unit_price: item.sellingPrice
        })),
        discount: discount || 0,
        payment_method: paymentMethod,
        cash_received: paymentMethod === "cash" ? parseFloat(cashReceived || 0) : total
      };

      // Create sale in backend
      const sale = await salesAPI.create(saleData);

      // Generate receipt data from backend response
      const receipt = {
        billNo: sale.billNumber,
        date: new Date(sale.saleDate).toLocaleString(),
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.sellingPrice,
          total: item.sellingPrice * item.quantity
        })),
        subtotal: sale.subtotal,
        discount: sale.discount,
        tax: sale.tax,
        total: sale.total,
        paymentMethod: sale.paymentMethod,
        cashReceived: sale.amountReceived,
        change: sale.change,
        cashier: JSON.parse(localStorage.getItem("user") || "{}").username || "Cashier",
      };

      setReceiptData(receipt);
      setShowReceipt(true);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || "Failed to process payment. Please try again.");
      setLoading(false);
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    onComplete();
    onClose();
  };

  if (showReceipt && receiptData) {
    return <ReceiptPrint data={receiptData} onClose={handleCloseReceipt} />;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn bg-[hsl(var(--background))]">
      <Card className="w-full max-w-2xl surface animate-slideIn">
        <CardHeader className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <CardTitle className="text-2xl text-[hsl(var(--foreground))] flex items-center gap-3">
            <div className="p-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
              <svg className="w-6 h-6 text-[hsl(var(--primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            {"Complete Payment"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Total Amount */}
          <div className="bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] p-6 rounded-xl text-center">
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-1 font-medium">Total</p>
            <p className="text-5xl font-bold text-[hsl(var(--primary))]">{formatCurrency(total)}</p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                className={`h-16 text-lg font-semibold transition-all duration-200 ${
                  paymentMethod === "cash"
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--background))]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                }`}
                onClick={() => setPaymentMethod("cash")}
              >
                💵 Cash
              </Button>
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                className={`h-16 text-lg font-semibold transition-all duration-200 ${
                  paymentMethod === "card"
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--background))]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                💳 Card
              </Button>
              <Button
                variant={paymentMethod === "qr" ? "default" : "outline"}
                className={`h-16 text-lg font-semibold transition-all duration-200 ${
                  paymentMethod === "qr"
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--background))]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                }`}
                onClick={() => setPaymentMethod("qr")}
              >
                📱 QR/UPI
              </Button>
            </div>
          </div>

          {/* Cash Payment Section */}
          {paymentMethod === "cash" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))]">Amount Received</label>
                  <div className="relative mt-1">
                    <Input
                      type="text"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="h-14 text-2xl font-bold pr-24 border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                      placeholder="0.00"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute right-2 top-2 px-3 py-1 rounded-lg border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                      onClick={handleQuickAmount}
                    >
                      Exact
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[hsl(var(--foreground))]">Change</label>
                  <div
                    className={`h-14 mt-1 flex items-center justify-center text-2xl font-bold rounded-xl border ${
                      change >= 0
                        ? "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] border-[hsl(var(--border))]"
                        : "bg-[color-mix(in_srgb,hsl(var(--destructive))_10%,transparent)] text-[hsl(var(--destructive))] border-[color-mix(in_srgb,hsl(var(--destructive))_30%,transparent)]"
                    }`}
                  >
                    {formatCurrency(change >= 0 ? change : 0)}
                  </div>
                </div>
              </div>

              {/* Numeric Keypad */}
              <div>
                <p className="text-sm font-medium mb-2 text-[hsl(var(--foreground))]">Quick Entry</p>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "⌫"].map((key) => (
                    <Button
                      key={key}
                      variant="outline"
                      className="h-14 text-xl font-semibold border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all duration-200"
                      onClick={() =>
                        key === "⌫" ? handleNumPad("backspace") : handleNumPad(key.toString())
                      }
                    >
                      {key}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    className="h-14 text-sm col-span-4 border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[color-mix(in_srgb,hsl(var(--destructive))_12%,transparent)] hover:border-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))] font-semibold"
                    onClick={() => handleNumPad("clear")}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Card/QR Payment Info */}
          {(paymentMethod === "card" || paymentMethod === "qr") && (
            <div className="bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] p-6 rounded-xl text-center">
              <p className="text-lg font-medium mb-2 text-[hsl(var(--foreground))]">
                {paymentMethod === "card" ? "Swipe or Insert Card" : "Scan QR Code"}
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {paymentMethod === "card"
                  ? "Waiting for card machine confirmation..."
                  : "Customer should scan the QR code to complete payment"}
              </p>
              <div className="mt-4">
                <Badge variant="secondary" className="px-4 py-2 text-lg pill">
                  {formatCurrency(total)}
                </Badge>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm font-medium bg-[color-mix(in_srgb,hsl(var(--destructive))_10%,transparent)] border border-[color-mix(in_srgb,hsl(var(--destructive))_30%,transparent)] text-[hsl(var(--destructive))]">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 text-lg font-semibold border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              className="h-14 text-lg font-semibold bg-[hsl(var(--primary))] text-[hsl(var(--background))] hover:brightness-110"
              onClick={handleConfirmPayment}
              disabled={loading || (paymentMethod === "cash" && (!cashReceived || change < 0))}
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
