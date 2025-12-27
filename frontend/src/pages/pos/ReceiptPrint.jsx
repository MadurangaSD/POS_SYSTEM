import { useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ReceiptPrint({ data, onClose }) {
  const receiptRef = useRef(null);
  const items = data.items || [];
  const subtotal = data.subtotal ?? data.total ?? 0;
  const discount = data.discount ?? 0;
  const tax = data.tax ?? 0;
  const total = data.total ?? subtotal - discount + tax;

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${data.billNo}`,
  });

  return (
    <div className="fixed inset-0 bg-[hsl(var(--background))] flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6 space-y-4">
          {/* Receipt Preview */}
          <div
            ref={receiptRef}
            className="bg-white p-8 border-2 border-dashed border-slate-300 rounded-lg"
            style={{ fontFamily: "monospace" }}
          >
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold">YOUR STORE NAME</h1>
              <p className="text-sm">123 Main Street, City, Country</p>
              <p className="text-sm">Tel: +94 XX XXX XXXX</p>
              <p className="text-sm">Email: store@example.com</p>
            </div>

            <div className="border-t-2 border-b-2 border-dashed border-slate-300 py-3 my-3">
              <div className="flex justify-between text-sm">
                <span>Bill No:</span>
                <span className="font-bold">{data.billNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Date/Time:</span>
                <span>{data.date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cashier:</span>
                <span>{data.cashier}</span>
              </div>
            </div>

            <div className="my-4">
              <div className="text-sm font-bold mb-2">ITEMS</div>
              <div className="text-sm space-y-1">
                {items.length === 0 && (
                  <div className="flex justify-between">
                    <span>No items</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                )}
                {items.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex justify-between">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>{formatCurrency(item.total ?? item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-dashed border-slate-300 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(Number(subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span>{formatCurrency(Number(discount))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>{formatCurrency(Number(tax))}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t-2 border-slate-300 pt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(Number(total))}</span>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-slate-300 mt-3 pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="uppercase font-semibold">{data.paymentMethod}</span>
              </div>
              {data.paymentMethod === "cash" && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Received:</span>
                    <span>{formatCurrency(data.cashReceived)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change:</span>
                    <span>{formatCurrency(data.change)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-center mt-6 text-xs text-muted-foreground">
              <p>Thank you for your purchase!</p>
              <p>Please come again</p>
              <p className="mt-2">--- END OF RECEIPT ---</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" onClick={onClose}>
              New Sale
            </Button>
            <Button size="lg" onClick={handlePrint}>
              🖨️ Print Receipt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
