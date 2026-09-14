"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, X, Plus, Trash2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  story: string | null;
  specs: unknown;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stock: number;
  status: string;
  isActive: boolean;
  productType: string;
  tags: string[];
  platform: string | null;
  licenseType: string | null;
  categoryId: string | null;
  brandId: string | null;
  sortOrder: number;
  images: ProductImage[];
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
}

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

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");

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
    status: "DRAFT",
    isActive: true,
    productType: "physical",
    tags: "",
    platform: "",
    licenseType: "",
    categoryId: "",
    brandId: "",
    sortOrder: "0",
  });

  useEffect(() => {
    async function load() {
      try {
        const [productRes, catRes, brandRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch("/api/admin/search?type=categories"),
          fetch("/api/admin/search?type=brands"),
        ]);

        if (productRes.ok) {
          const p = await productRes.json();
          setProduct(p);
          setForm({
            name: p.name || "",
            slug: p.slug || "",
            shortDescription: p.shortDescription || "",
            description: p.description || "",
            story: p.story || "",
            price: String(p.price || ""),
            compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
            sku: p.sku || "",
            stock: String(p.stock || 0),
            status: p.status || "DRAFT",
            isActive: p.isActive ?? true,
            productType: p.productType || "physical",
            tags: (p.tags || []).join(", "),
            platform: p.platform || "",
            licenseType: p.licenseType || "",
            categoryId: p.categoryId || "",
            brandId: p.brandId || "",
            sortOrder: String(p.sortOrder || 0),
          });
        }

        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(data.categories || []);
        }
        if (brandRes.ok) {
          const data = await brandRes.json();
          setBrands(data.brands || []);
        }
      } catch {
        setError("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (form.status === "PUBLISHED" && (!product || product.images.length === 0)) {
      setError("Cannot publish without at least one image.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        stock: parseInt(form.stock, 10) || 0,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
        tags: form.tags
          ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : [],
        platform: form.platform || null,
        licenseType: form.licenseType || null,
        categoryId: form.categoryId || null,
        brandId: form.brandId || null,
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save.");
        setSaving(false);
        return;
      }

      router.push("/admin/products");
    } catch {
      setError("An unexpected error occurred.");
      setSaving(false);
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl) return;

    try {
      const res = await fetch(`/api/admin/products/${id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newImageUrl,
          alt: newImageAlt || product?.name || "",
          isPrimary: product?.images.length === 0,
        }),
      });

      if (res.ok) {
        const image = await res.json();
        setProduct((prev) =>
          prev ? { ...prev, images: [...prev.images, image] } : prev,
        );
        setNewImageUrl("");
        setNewImageAlt("");
        setImageModalOpen(false);
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}/images?imageId=${imageId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProduct((prev) =>
          prev
            ? { ...prev, images: prev.images.filter((img) => img.id !== imageId) }
            : prev,
        );
      }
    } catch {
      // ignore
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await fetch(`/api/admin/products/${id}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      // Re-fetch product to get updated state
      const res = await fetch(`/api/admin/products/${id}`);
      if (res.ok) {
        const p = await res.json();
        setProduct(p);
      }
    } catch {
      // ignore
    }
  };

  const topLevelCategories = categories.filter((c) => !c.parentId);
  const subCategories = categories.filter((c) => c.parentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-body text-text-secondary">Product not found.</p>
        <Link href="/admin/products" className="text-accent hover:underline mt-2 inline-block">
          Back to Products
        </Link>
      </div>
    );
  }

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

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 font-bold tracking-tight">Edit Product</h1>
          <p className="text-body text-text-secondary mt-1">
            {product.name} — {product.sku || "No SKU"}
          </p>
        </div>
        <Badge variant={product.status === "PUBLISHED" ? "success" : product.status === "DRAFT" ? "warning" : "default"}>
          {product.status}
        </Badge>
      </div>

      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 p-4 mb-6 text-body-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label="Product Name *" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <Input label="Slug *" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <Textarea label="Short Description *" value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} rows={2} required />
              </div>
              <div className="md:col-span-2">
                <Textarea label="Full Description *" value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={6} required />
              </div>
              <div className="md:col-span-2">
                <Textarea label="Story" value={form.story} onChange={(e) => updateField("story", e.target.value)} rows={3} />
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
              <Input label="Price *" type="number" step="0.01" min="0" value={form.price} onChange={(e) => updateField("price", e.target.value)} required />
              <Input label="Compare At Price" type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={(e) => updateField("compareAtPrice", e.target.value)} />
              <Input label="Stock" type="number" min="0" value={form.stock} onChange={(e) => updateField("stock", e.target.value)} />
              <Input label="SKU" value={form.sku} onChange={(e) => updateField("sku", e.target.value)} />
              <Select label="Product Type" value={form.productType} onChange={(e) => updateField("productType", e.target.value)} options={[{ value: "physical", label: "Physical" }, { value: "subscription", label: "Subscription" }]} />
              <Select label="Status" value={form.status} onChange={(e) => updateField("status", e.target.value)} options={[{ value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" }]} />
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
                  ...topLevelCategories.map((c) => ({ value: c.id, label: c.name })),
                  ...subCategories.map((c) => {
                    const parent = topLevelCategories.find((p) => p.id === c.parentId);
                    return { value: c.id, label: parent ? `${parent.name} → ${c.name}` : c.name };
                  }),
                ]}
              />
              <Select
                label="Brand"
                value={form.brandId}
                onChange={(e) => updateField("brandId", e.target.value)}
                options={[{ value: "", label: "No Brand" }, ...brands.map((b) => ({ value: b.id, label: b.name }))]}
              />
              <Input label="Tags (comma-separated)" value={form.tags} onChange={(e) => updateField("tags", e.target.value)} placeholder="Work, Office, Creative" />
              <Input label="Platform" value={form.platform} onChange={(e) => updateField("platform", e.target.value)} placeholder="Cross-platform" />
              <Select label="License Type" value={form.licenseType} onChange={(e) => updateField("licenseType", e.target.value)} options={[{ value: "", label: "N/A" }, { value: "Subscription", label: "Subscription" }, { value: "One-time", label: "One-time" }]} />
              <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => updateField("sortOrder", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon size={18} />
                Product Images ({product.images.length})
              </span>
              <Button type="button" variant="outline" size="sm" onClick={() => setImageModalOpen(true)}>
                <Plus size={14} />
                Add Image
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {product.images.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border-subtle rounded-lg">
                <ImageIcon size={32} className="text-text-tertiary mx-auto mb-2" />
                <p className="text-body-sm text-text-secondary">No images yet. Add one to get started.</p>
                {form.status === "PUBLISHED" && (
                  <p className="text-caption text-warning mt-2">A product image is required to publish.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {product.images.map((img) => (
                  <div key={img.id} className="relative group rounded-lg border border-border-subtle overflow-hidden bg-surface-neutral">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt || ""} className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(img.id)}
                          className="p-1.5 rounded-full bg-white/90 hover:bg-white text-text-primary"
                          title="Set as primary"
                        >
                          <Star size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="p-1.5 rounded-full bg-white/90 hover:bg-white text-error"
                        title="Delete image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {img.isPrimary && (
                      <div className="absolute top-1.5 left-1.5">
                        <Badge variant="success" size="sm">Primary</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="text-body-sm text-text-secondary hover:text-text-primary transition-colors">
              Cancel
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => { if (confirm("Delete this product? This cannot be undone.")) { fetch(`/api/admin/products/${id}`, { method: "DELETE" }).then(() => router.push("/admin/products")); } }}>
              <Trash2 size={16} />
              Delete
            </Button>
            <Button type="submit" loading={saving}>
              <Save size={16} />
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      {/* Add Image Modal */}
      <Modal open={imageModalOpen} onClose={() => { setImageModalOpen(false); setNewImageUrl(""); setNewImageAlt(""); }} title="Add Image">
        <div className="space-y-4">
          <Input label="Image URL *" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." />
          <Input label="Alt Text" value={newImageAlt} onChange={(e) => setNewImageAlt(e.target.value)} placeholder="Describe the image" />
          {newImageUrl && (
            <div className="w-32 h-32 rounded-lg border border-border-subtle overflow-hidden bg-surface-neutral">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={newImageUrl} alt={newImageAlt} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setImageModalOpen(false); setNewImageUrl(""); setNewImageAlt(""); }}>
              Cancel
            </Button>
            <Button onClick={handleAddImage} disabled={!newImageUrl}>
              Add Image
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
