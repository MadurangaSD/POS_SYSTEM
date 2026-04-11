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
import { Tag, Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { categoriesAPI } from "@/services/api";
import PageHeader from "@/components/PageHeader";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    defaultTaxRate: 0,
    parentCategory: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        defaultTaxRate: category.defaultTaxRate || 0,
        parentCategory: category.parentCategory?._id || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        defaultTaxRate: 0,
        parentCategory: "",
      });
    }
    setShowDialog(true);
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

      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id, payload);
        toast.success("Category updated successfully");
      } else {
        await categoriesAPI.create(payload);
        toast.success("Category created successfully");
      }

      setShowDialog(false);
      setFormData({
        name: "",
        description: "",
        defaultTaxRate: 0,
        parentCategory: "",
      });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.error || "Failed to save category");
    }
  };

  const handleOpenDeleteDialog = (category) => {
    setDeletingCategory(category);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await categoriesAPI.delete(deletingCategory._id);
      toast.success("Category deleted successfully");
      setShowDeleteDialog(false);
      setDeletingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.error || "Failed to delete category");
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const headerStats = [
    {
      label: "Total Categories",
      value: categories.length.toString(),
      tone: "slate",
      helper: "All product categories",
    },
    {
      label: "Active",
      value: categories.filter((c) => c.isActive).length.toString(),
      tone: "slate",
      helper: "Active categories",
    },
    {
      label: "Top Level",
      value: categories.filter((c) => !c.parentCategory).length.toString(),
      tone: "slate",
      helper: "Root categories",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Tag}
        title="Categories"
        subtitle="Manage product categories"
        stats={headerStats}
      />

      {/* Search and Actions */}
      <Card className="rounded-xl border border-white/5 bg-[#242426]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/45 h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto bg-[#0A84FF] text-white hover:brightness-110 rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <p className="text-white/55">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-white/5 bg-[#1C1C1E]">
              <Tag className="mx-auto h-12 w-12 text-white/35" />
              <h3 className="mt-2 text-sm font-semibold text-white/90">No categories</h3>
              <p className="mt-1 text-sm text-white/55">
                {searchQuery ? "No categories match your search." : "Get started by creating a new category."}
              </p>
              {!searchQuery && (
                <div className="mt-6">
                  <Button className="bg-[#0A84FF] text-white hover:brightness-110 rounded-xl" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-white/55">Name</TableHead>
                  <TableHead className="text-white/55">Description</TableHead>
                  <TableHead className="text-white/55">Tax Rate</TableHead>
                  <TableHead className="text-white/55">Parent</TableHead>
                  <TableHead className="text-white/55">Status</TableHead>
                  <TableHead className="text-right text-white/55">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat._id} className="border-white/5 hover:bg-white/[0.03]">
                    <TableCell className="font-medium text-white/90">{cat.name}</TableCell>
                    <TableCell className="text-white/60 max-w-xs truncate">
                      {cat.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="border border-white/10 bg-white/[0.03] text-white/80">{cat.defaultTaxRate}%</Badge>
                    </TableCell>
                    <TableCell className="text-white/60">
                      {cat.parentCategory?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={cat.isActive ? "border border-white/10 bg-white/[0.12] text-white" : "border border-white/10 bg-white/[0.03] text-white/70"}>
                        {cat.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 bg-[#1C1C1E] text-white/90 hover:bg-white/[0.08]"
                          onClick={() => handleOpenDialog(cat)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 bg-[#1C1C1E] text-white/90 hover:bg-white/[0.08]"
                          onClick={() => handleOpenDeleteDialog(cat)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-2xl border border-white/10 bg-[#1C1C1E] text-white">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category information below."
                : "Create a new product category."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/85">Category Name *</label>
              <Input
                type="text"
                placeholder="e.g., Beverages"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white/85">Description</label>
              <Input
                type="text"
                placeholder="e.g., All types of drinks"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white/85">Default Tax Rate (%)</label>
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
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white/85">Parent Category (Optional)</label>
              <Select
                value={formData.parentCategory}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentCategory: value })
                }
              >
                <SelectTrigger className="mt-1 bg-[#242426]">
                  <SelectValue placeholder="None (Top-level category)" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C1C1E]">
                  <SelectItem value="none">None (Top-level category)</SelectItem>
                  {categories
                    .filter((cat) => cat._id !== editingCategory?._id)
                    .map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button className="bg-[#0A84FF] text-white hover:brightness-110" type="submit">
                {editingCategory ? "Update" : "Create"} Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl border border-white/10 bg-[#1C1C1E] text-white">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button className="bg-[#0A84FF] text-white hover:brightness-110" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
