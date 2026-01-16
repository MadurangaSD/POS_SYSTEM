import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/services/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    defaultTaxRate: 0,
    parentCategory: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        defaultTaxRate: category.defaultTaxRate || 0,
        parentCategory: category.parentCategory?._id || "",
      });
      setEditingId(category._id);
    } else {
      setFormData({
        name: "",
        description: "",
        defaultTaxRate: 0,
        parentCategory: "",
      });
      setEditingId(null);
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name.trim()) {
        toast.error("Category name is required");
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        defaultTaxRate: parseFloat(formData.defaultTaxRate) || 0,
        parentCategory: formData.parentCategory || undefined,
      };

      if (editingId) {
        await api.put(`/api/categories/${editingId}`, payload);
        toast.success("Category updated successfully");
      } else {
        await api.post("/api/categories", payload);
        toast.success("Category created successfully");
      }

      setIsOpen(false);
      setFormData({
        name: "",
        description: "",
        defaultTaxRate: 0,
        parentCategory: "",
      });
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }
    try {
      await api.delete(`/api/categories/${id}`);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-gray-500 mt-1">
            Create and manage product categories
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No categories found. Create one to get started!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card
              key={cat._id}
              className="p-4 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
            >
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-gray-600">Tax Rate</p>
                    <p className="font-semibold text-blue-600">
                      {cat.defaultTaxRate}%
                    </p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-gray-600">Status</p>
                    <p className="font-semibold text-green-600">
                      {cat.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleOpenDialog(cat)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDelete(cat._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingId ? "Edit Category" : "Add New Category"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Beverages"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., All types of drinks"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Default Tax Rate (%)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.defaultTaxRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultTaxRate: e.target.value,
                      })
                    }
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Parent Category (Optional)
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-white"
                    value={formData.parentCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parentCategory: e.target.value,
                      })
                    }
                  >
                    <option value="">None (Top-level category)</option>
                    {categories
                      .filter((cat) => cat._id !== editingId)
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Save Category
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </Dialog>
      )}
    </div>
  );
}
