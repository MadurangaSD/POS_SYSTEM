import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import { brandsAPI } from "@/services/api";

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
      const data = await brandsAPI.getAll();
      setBrands(data);
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
        await brandsAPI.update(editingId, payload);
        toast.success("Brand updated successfully");
      } else {
        await brandsAPI.create(payload);
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
      await brandsAPI.delete(id);
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
    <div className="space-y-6 p-6 text-white/90">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Brand Management</h1>
          <p className="mt-1 text-white/55">
            Create and manage product brands
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="rounded-xl bg-[#0A84FF] text-white hover:brightness-110"
        >
          + Add Brand
        </Button>
      </div>

      {/* Brands Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-white/55">Loading brands...</p>
        </div>
      ) : brands.length === 0 ? (
        <Card className="rounded-2xl border border-white/5 bg-[#242426] p-12 text-center">
          <p className="text-white/55">No brands found. Create one to get started!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <Card
              key={brand._id}
              className="rounded-2xl border border-white/5 bg-[#242426] p-4 transition-all duration-200 hover:bg-white/[0.03]"
            >
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-white/95">
                    {brand.name}
                  </h3>
                  {brand.manufacturer && (
                    <p className="mt-1 text-xs text-white/55">
                      Manufacturer: {brand.manufacturer}
                    </p>
                  )}
                  {brand.description && (
                    <p className="mt-2 text-sm text-white/65">
                      {brand.description}
                    </p>
                  )}
                </div>

                {/* Contact Info */}
                {brand.contactInfo && (
                  <div className="space-y-1 rounded-xl border border-white/5 bg-[#1C1C1E] p-2 text-xs">
                    {brand.contactInfo.email && (
                      <p>
                        <span className="text-white/55">Email:</span>{" "}
                        <a
                          href={`mailto:${brand.contactInfo.email}`}
                          className="text-[#0A84FF]"
                        >
                          {brand.contactInfo.email}
                        </a>
                      </p>
                    )}
                    {brand.contactInfo.phone && (
                      <p>
                        <span className="text-white/55">Phone:</span>{" "}
                        {brand.contactInfo.phone}
                      </p>
                    )}
                    {brand.contactInfo.website && (
                      <p>
                        <span className="text-white/55">Website:</span>{" "}
                        <a
                          href={brand.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0A84FF]"
                        >
                          {brand.contactInfo.website}
                        </a>
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 border-t border-white/5 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/10 bg-[#1C1C1E] text-white/90 hover:bg-white/[0.08]"
                    onClick={() => handleOpenDialog(brand)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/10 bg-[#1C1C1E] text-white/90 hover:bg-white/[0.08]"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
            <Card className="my-8 w-full max-w-md rounded-2xl border border-white/10 bg-[#1C1C1E] p-6 text-white">
              <h2 className="mb-4 text-2xl font-bold text-white">
                {editingId ? "Edit Brand" : "Add New Brand"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/85">
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
                  <label className="mb-1 block text-sm font-medium text-white/85">
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
                  <label className="mb-1 block text-sm font-medium text-white/85">
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

                <div className="border-t border-white/10 pt-4">
                  <h3 className="mb-3 font-semibold text-white/90">Contact Information</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-white/85">
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
                      <label className="mb-1 block text-sm font-medium text-white/85">
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
                      <label className="mb-1 block text-sm font-medium text-white/85">
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

                <div className="flex gap-2 border-t border-white/10 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#0A84FF] text-white hover:brightness-110"
                  >
                    Save Brand
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-white/10 bg-[#242426] text-white/90 hover:bg-white/[0.08]"
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
