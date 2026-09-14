"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    story: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    stock: "0",
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    productType: "physical",
    tags: "",
    platform: "",
    licenseType: "",
    categoryId: "",
    brandId: "",
    imageUrl: "",
    imageAlt: "",
  });

  useEffect(() => {
    fetch("/api/admin/products?pageSize=1")
      .then((r) => r.json())
      .catch(() => {});
    // Fetch categories and brands from the database
    Promise.all([
      fetch("/api/admin/settings/company").then((r) => r.json()),
    ]).catch(() => {});
  }, []);

  // Load categories and brands on mount
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/search?type=categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch {
        // fallback: use the products list endpoint
      }
      try {
        const res = await fetch("/api/admin/search?type=brands");
        if (res.ok) {
          const data = await res.json();
          setBrands(data.brands || []);
        }
      } catch {
        // ignore
      }
    }
    loadData();
  }, []);

  const autoSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !prev.slug) {
        next.slug = autoSlug(value);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!form.name || !form.slug || !form.shortDescription || !form.description || !form.price) {
      setError("Please fill in all required fields (name, slug, short description, description, price).");
      setSaving(false);
      return;
    }

    if (form.status === "PUBLISHED" && !form.imageUrl) {
      setError("Cannot publish a product without at least one image. Please provide an image URL.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        stock: parseInt(form.stock, 10) || 0,
        tags: form.tags
          ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : [],
        platform: form.platform || null,
        licenseType: form.licenseType || null,
        categoryId: form.categoryId || null,
        brandId: form.brandId || null,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create product.");
        setSaving(false);
        return;
      }

      router.push("/admin/products");
    } catch {
      setError("An unexpected error occurred.");
      setSaving(false);
    }
  };

  // Separate top-level and sub categories
  const topLevelCategories = categories.filter((c) => !c.parentId);
  const subCategories = categories.filter((c) => c.parentId);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-body-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Add Product</h1>
        <p className="text-body text-text-secondary mt-1">
          Create a new product in your catalog
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 p-4 mb-6 text-body-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Product Name *"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Slug *"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  required
                  placeholder="auto-generated-from-name"
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  label="Short Description *"
                  value={form.shortDescription}
                  onChange={(e) => updateField("shortDescription", e.target.value)}
                  rows={2}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  label="Full Description *"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={6}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  label="Story (optional)"
                  value={form.story}
                  onChange={(e) => updateField("story", e.target.value)}
                  rows={3}
                  placeholder="The story behind this product..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Price *"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                required
              />
              <Input
                label="Compare At Price (optional)"
                type="number"
                step="0.01"
                min="0"
                value={form.compareAtPrice}
                onChange={(e) => updateField("compareAtPrice", e.target.value)}
                placeholder="Strikethrough price"
              />
              <Input
                label="Stock Quantity"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => updateField("stock", e.target.value)}
              />
              <Input
                label="SKU"
                value={form.sku}
                onChange={(e) => updateField("sku", e.target.value)}
                placeholder="e.g. MVM-ELP-001"
              />
              <Select
                label="Product Type"
                value={form.productType}
                onChange={(e) => updateField("productType", e.target.value)}
                options={[
                  { value: "physical", label: "Physical Product" },
                  { value: "subscription", label: "Subscription" },
                ]}
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                options={[
                  { value: "DRAFT", label: "Draft" },
                  { value: "PUBLISHED", label: "Published" },
                  { value: "ARCHIVED", label: "Archived" },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Category"
                value={form.categoryId}
                onChange={(e) => updateField("categoryId", e.target.value)}
                options={[
                  { value: "", label: "No Category" },
                  ...topLevelCategories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  })),
                  ...subCategories.map((c) => {
                    const parent = topLevelCategories.find((p) => p.id === c.parentId);
                    return {
                      value: c.id,
                      label: parent ? `  ${parent.name} → ${c.name}` : c.name,
                    };
                  }),
                ]}
              />
              <Select
                label="Brand"
                value={form.brandId}
                onChange={(e) => updateField("brandId", e.target.value)}
                options={[
                  { value: "", label: "No Brand" },
                  ...brands.map((b) => ({ value: b.id, label: b.name })),
                ]}
              />
              <Input
                label="Tags (comma-separated)"
                value={form.tags}
                onChange={(e) => updateField("tags", e.target.value)}
                placeholder="e.g. Work, Office, Creative"
              />
              <Input
                label="Platform (for software)"
                value={form.platform}
                onChange={(e) => updateField("platform", e.target.value)}
                placeholder="e.g. Cross-platform, macOS/Windows, Web"
              />
              <Select
                label="License Type (for software)"
                value={form.licenseType}
                onChange={(e) => updateField("licenseType", e.target.value)}
                options={[
                  { value: "", label: "N/A" },
                  { value: "Subscription", label: "Subscription" },
                  { value: "One-time", label: "One-time Purchase" },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon size={18} />
              Product Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Image URL"
                value={form.imageUrl}
                onChange={(e) => updateField("imageUrl", e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
              <Input
                label="Alt Text"
                value={form.imageAlt}
                onChange={(e) => updateField("imageAlt", e.target.value)}
                placeholder="Describe the image"
              />
            </div>
            {form.imageUrl && (
              <div className="mt-4 relative w-48 h-48 rounded-lg border border-border-subtle overflow-hidden bg-surface-neutral">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt={form.imageAlt || form.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => updateField("imageUrl", "")}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white text-text-tertiary hover:text-error transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {form.status === "PUBLISHED" && !form.imageUrl && (
              <p className="mt-3 text-caption text-warning flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning" />
                A product image is required to publish.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/admin/products"
            className="text-body-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </Link>
          <Button type="submit" loading={saving}>
            <Save size={16} />
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}
