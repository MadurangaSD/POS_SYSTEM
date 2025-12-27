import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Barcode from "react-barcode";
import { Printer, Download } from "lucide-react";

export default function BarcodePrintDialog({ product, open, onClose }) {
  const [copies, setCopies] = useState(1);
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current;
    const windowPrint = window.open('', '', 'width=800,height=600');
    windowPrint.document.write('<html><head><title>Print Barcode</title>');
    windowPrint.document.write('<style>');
    windowPrint.document.write(`
      body { font-family: Arial, sans-serif; margin: 20px; }
      .barcode-label { 
        display: inline-block;
        border: 1px solid #000;
        padding: 10px;
        margin: 10px;
        text-align: center;
        page-break-inside: avoid;
      }
      .product-name { font-size: 12px; font-weight: bold; margin-bottom: 5px; }
      .price { font-size: 14px; margin-top: 5px; }
    `);
    windowPrint.document.write('</style></head><body>');
    windowPrint.document.write(printContent.innerHTML);
    windowPrint.document.write('</body></html>');
    windowPrint.document.close();
    windowPrint.focus();
    windowPrint.print();
    windowPrint.close();
  };

  const handleDownload = () => {
    // Create a canvas from the barcode SVG
    const svg = printRef.current.querySelector('svg');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${product?.barcode || 'barcode'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Print Barcode Labels</DialogTitle>
          <DialogDescription>
            Generate printable barcode labels for {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Number of Copies</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={copies}
              onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
              className="mt-1"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Label Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={printRef}>
                {Array.from({ length: copies }).map((_, index) => (
                  <div key={index} className="barcode-label inline-block border p-4 m-2 text-center">
                    <div className="product-name font-bold text-sm mb-2">
                      {product.name}
                    </div>
                    <Barcode
                      value={product.barcode}
                      height={50}
                      width={1.5}
                      fontSize={12}
                    />
                    <div className="price text-lg font-bold mt-2">
                      ₹{product.sellingPrice.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Labels
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
