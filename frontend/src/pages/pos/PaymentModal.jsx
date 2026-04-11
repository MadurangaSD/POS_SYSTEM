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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
      <Card className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#1C1C1E] animate-slideIn">
        <CardHeader className="border-b border-white/5 bg-[#1C1C1E]">
          <CardTitle className="flex items-center gap-3 text-2xl text-white">
            <div className="rounded-xl border border-white/10 bg-[#242426] p-2">
              <svg className="w-6 h-6 text-white/85" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            {"Complete Payment"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Total Amount */}
          <div className="rounded-xl border border-white/10 bg-[#242426] p-6 text-center">
            <p className="mb-1 text-sm font-medium text-white/55">Total</p>
            <p className="text-5xl font-bold text-white">{formatCurrency(total)}</p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/85">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                className={`h-16 text-lg font-semibold transition-all duration-200 ${
                  paymentMethod === "cash"
                    ? "bg-[#0A84FF] text-white"
                    : "border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]"
                }`}
                onClick={() => setPaymentMethod("cash")}
              >
                💵 Cash
              </Button>
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                className={`h-16 text-lg font-semibold transition-all duration-200 ${
                  paymentMethod === "card"
                    ? "bg-[#0A84FF] text-white"
                    : "border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]"
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                💳 Card
              </Button>
              <Button
                variant={paymentMethod === "qr" ? "default" : "outline"}
                className={`h-16 text-lg font-semibold transition-all duration-200 ${
                  paymentMethod === "qr"
                    ? "bg-[#0A84FF] text-white"
                    : "border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]"
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
                  <label className="text-sm font-medium text-white/85">Amount Received</label>
                  <div className="relative mt-1">
                    <Input
                      type="text"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="h-14 pr-24 text-2xl font-bold"
                      placeholder="0.00"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute right-2 top-2 rounded-lg border-white/10 bg-[#1C1C1E] px-3 py-1 text-white/90 hover:bg-white/[0.08]"
                      onClick={handleQuickAmount}
                    >
                      Exact
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/85">Change</label>
                  <div
                    className={`h-14 mt-1 flex items-center justify-center text-2xl font-bold rounded-xl border ${
                      change >= 0
                        ? "border-white/10 bg-[#242426] text-white"
                        : "border-white/10 bg-[#242426] text-white"
                    }`}
                  >
                    {formatCurrency(change >= 0 ? change : 0)}
                  </div>
                </div>
              </div>

              {/* Numeric Keypad */}
              <div>
                <p className="mb-2 text-sm font-medium text-white/85">Quick Entry</p>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "⌫"].map((key) => (
                    <Button
                      key={key}
                      variant="outline"
                      className="h-14 border-white/10 bg-[#242426] text-xl font-semibold text-white/90 transition-all duration-200 hover:bg-white/[0.08]"
                      onClick={() =>
                        key === "⌫" ? handleNumPad("backspace") : handleNumPad(key.toString())
                      }
                    >
                      {key}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    className="col-span-4 h-14 border-white/10 bg-[#242426] text-sm font-semibold text-white/90 hover:bg-white/[0.08]"
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
            <div className="rounded-xl border border-white/10 bg-[#242426] p-6 text-center">
              <p className="mb-2 text-lg font-medium text-white/90">
                {paymentMethod === "card" ? "Swipe or Insert Card" : "Scan QR Code"}
              </p>
              <p className="text-sm text-white/60">
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
              className="h-14 border-white/10 bg-[#242426] text-lg font-semibold text-white/90 hover:bg-white/[0.08]" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              className="h-14 bg-[#0A84FF] text-lg font-semibold text-white hover:brightness-110"
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
