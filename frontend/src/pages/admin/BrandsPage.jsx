import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/services/api";

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manufacturer: "",
    contactInfo: {
      email: "",
      phone: "",
      website: "",
    },
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/brands");
      setBrands(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (brand = null) => {
    if (brand) {
      setFormData({
        name: brand.name,
        description: brand.description || "",
        manufacturer: brand.manufacturer || "",
        contactInfo: brand.contactInfo || {
          email: "",
          phone: "",
          website: "",
        },
      });
      setEditingId(brand._id);
    } else {
      setFormData({
        name: "",
        description: "",
        manufacturer: "",
        contactInfo: {
          email: "",
          phone: "",
          website: "",
        },
      });
      setEditingId(null);
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name.trim()) {
        toast.error("Brand name is required");
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        manufacturer: formData.manufacturer,
        contactInfo: formData.contactInfo,
      };

      if (editingId) {
        await api.put(`/api/brands/${editingId}`, payload);
        toast.success("Brand updated successfully");
      } else {
        await api.post("/api/brands", payload);
        toast.success("Brand created successfully");
      }

      setIsOpen(false);
      setFormData({
        name: "",
        description: "",
        manufacturer: "",
        contactInfo: {
          email: "",
          phone: "",
          website: "",
        },
      });
      setEditingId(null);
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save brand");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) {
      return;
    }
    try {
      await api.delete(`/api/brands/${id}`);
      toast.success("Brand deleted successfully");
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete brand");
    }
  };

  const handleContactChange = (field, value) => {
    setFormData({
      ...formData,
      contactInfo: {
        ...formData.contactInfo,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Brand Management</h1>
          <p className="text-gray-500 mt-1">
            Create and manage product brands
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Add Brand
        </Button>
      </div>

      {/* Brands Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-gray-500">Loading brands...</p>
        </div>
      ) : brands.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No brands found. Create one to get started!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <Card
              key={brand._id}
              className="p-4 hover:shadow-lg transition-shadow border-l-4 border-l-purple-500"
            >
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {brand.name}
                  </h3>
                  {brand.manufacturer && (
                    <p className="text-xs text-gray-500 mt-1">
                      Manufacturer: {brand.manufacturer}
                    </p>
                  )}
                  {brand.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {brand.description}
                    </p>
                  )}
                </div>

                {/* Contact Info */}
                {brand.contactInfo && (
                  <div className="text-xs space-y-1 p-2 bg-gray-50 rounded">
                    {brand.contactInfo.email && (
                      <p>
                        <span className="text-gray-600">Email:</span>{" "}
                        <a
                          href={`mailto:${brand.contactInfo.email}`}
                          className="text-blue-600"
                        >
                          {brand.contactInfo.email}
                        </a>
                      </p>
                    )}
                    {brand.contactInfo.phone && (
                      <p>
                        <span className="text-gray-600">Phone:</span>{" "}
                        {brand.contactInfo.phone}
                      </p>
                    )}
                    {brand.contactInfo.website && (
                      <p>
                        <span className="text-gray-600">Website:</span>{" "}
                        <a
                          href={brand.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600"
                        >
                          {brand.contactInfo.website}
                        </a>
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleOpenDialog(brand)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDelete(brand._id)}
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <Card className="w-full max-w-md p-6 my-8">
              <h2 className="text-2xl font-bold mb-4">
                {editingId ? "Edit Brand" : "Add New Brand"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Brand Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Coca Cola"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Manufacturer
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., The Coca Cola Company"
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData({ ...formData, manufacturer: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Input
                    type="text"
                    placeholder="Brand description..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Contact Information</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        placeholder="contact@brand.com"
                        value={formData.contactInfo.email}
                        onChange={(e) =>
                          handleContactChange("email", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.contactInfo.phone}
                        onChange={(e) =>
                          handleContactChange("phone", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Website
                      </label>
                      <Input
                        type="url"
                        placeholder="https://www.brand.com"
                        value={formData.contactInfo.website}
                        onChange={(e) =>
                          handleContactChange("website", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Save Brand
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
