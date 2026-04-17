import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialFormData = {
  name: "",
  barcode: "",
  sku: "",
  category: null,
  brand: null,
  costPrice: "",
  sellingPrice: "",
  quantity: "0",
  reorderLevel: "10",
};

const objectIdPattern = /^[a-fA-F0-9]{24}$/;

const normalizeRelationId = (value) => {
  if (!value || value === "" || value === "null") return null;

  const normalized = typeof value === "object" ? value?._id || value?.id || "" : String(value);
  return objectIdPattern.test(normalized) ? normalized : null;
};

export default function AddProduct({ categories = [], brands = [], onSubmit, saving = false }) {
  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      name: formData.name.trim(),
      category: normalizeRelationId(formData.category),
      brand: normalizeRelationId(formData.brand),
      costPrice: Number(formData.costPrice),
      sellingPrice: Number(formData.sellingPrice),
      quantity: Number(formData.quantity),
      reorderLevel: Number(formData.reorderLevel),
    };

    const barcode = formData.barcode?.trim();
    const sku = formData.sku?.trim();

    if (barcode) {
      payload.barcode = barcode;
    } else {
      delete payload.barcode;
    }

    if (sku) {
      payload.sku = sku;
    } else {
      delete payload.sku;
    }

    await onSubmit?.(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={formData.name}
        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        placeholder="Product name"
      />

      <Input
        value={formData.barcode}
        onChange={(e) => setFormData((prev) => ({ ...prev, barcode: e.target.value }))}
        placeholder="Barcode (optional)"
      />

      <Input
        value={formData.sku}
        onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
        placeholder="SKU (optional)"
      />

      <Select
        value={formData.category || ""}
        onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value || null }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category (optional)" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category._id} value={category._id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={formData.brand || ""}
        onValueChange={(value) => setFormData((prev) => ({ ...prev, brand: value || null }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select brand (optional)" />
        </SelectTrigger>
        <SelectContent>
          {brands.map((brand) => (
            <SelectItem key={brand._id} value={brand._id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Product"}
      </Button>
    </form>
  );
}
