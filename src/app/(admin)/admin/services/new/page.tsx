"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
}

export default function AddServicePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    imageUrl: "",
    categoryId: "",
    sortOrder: "0",
    isActive: true,
  });

  const [benefits, setBenefits] = useState<string[]>([""]);
  const [processSteps, setProcessSteps] = useState<string[]>([""]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/search?type=serviceCategories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.serviceCategories || []);
        }
      } catch {
        // ignore
      }
    }
    loadCategories();
  }, []);

  const autoSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !prev.slug) {
        next.slug = autoSlug(value as string);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!form.title || !form.slug || !form.shortDescription || !form.description) {
      setError("Please fill in all required fields (title, slug, short description, description).");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...form,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
        categoryId: form.categoryId || null,
        benefits: benefits.filter((b) => b.trim()),
        process: processSteps.filter((s) => s.trim()),
      };

      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create service.");
        setSaving(false);
        return;
      }

      router.push("/admin/services");
    } catch {
      setError("An unexpected error occurred.");
      setSaving(false);
    }
  };

  const addBenefit = () => setBenefits([...benefits, ""]);
  const removeBenefit = (index: number) => setBenefits(benefits.filter((_, i) => i !== index));
  const updateBenefit = (index: number, value: string) => {
    const updated = [...benefits];
    updated[index] = value;
    setBenefits(updated);
  };

  const addProcessStep = () => setProcessSteps([...processSteps, ""]);
  const removeProcessStep = (index: number) => setProcessSteps(processSteps.filter((_, i) => i !== index));
  const updateProcessStep = (index: number, value: string) => {
    const updated = [...processSteps];
    updated[index] = value;
    setProcessSteps(updated);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-2 text-body-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Services
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-h1 font-bold tracking-tight">Add Service</h1>
        <p className="text-body text-text-secondary mt-1">
          Create a new service offering
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
                <Input label="Title *" value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
              </div>
              <div className="md:col-span-2">
                <Input label="Slug *" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} required placeholder="auto-generated-from-title" />
              </div>
              <div className="md:col-span-2">
                <Textarea label="Short Description *" value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} rows={2} required />
              </div>
              <div className="md:col-span-2">
                <Textarea label="Full Description *" value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={6} required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Image</CardTitle>
          </CardHeader>
          <CardContent>
            <Input label="Image URL" value={form.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} placeholder="https://images.unsplash.com/..." />
            {form.imageUrl && (
              <div className="mt-3 w-48 h-32 rounded-lg border border-border-subtle overflow-hidden bg-surface-neutral">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt={form.title} className="w-full h-full object-cover" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Category"
                value={form.categoryId}
                onChange={(e) => updateField("categoryId", e.target.value)}
                options={[{ value: "", label: "No Category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
              />
              <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => updateField("sortOrder", e.target.value)} />
              <Select
                label="Status"
                value={String(form.isActive)}
                onChange={(e) => updateField("isActive", e.target.value === "true")}
                options={[{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Benefits
              <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                <Plus size={14} />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={benefit}
                    onChange={(e) => updateBenefit(i, e.target.value)}
                    placeholder={`Benefit ${i + 1}`}
                    className="flex-1"
                  />
                  {benefits.length > 1 && (
                    <button type="button" onClick={() => removeBenefit(i)} className="p-2 text-text-tertiary hover:text-error transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Process Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Process Steps
              <Button type="button" variant="outline" size="sm" onClick={addProcessStep}>
                <Plus size={14} />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-caption text-text-tertiary w-6 text-center shrink-0">{i + 1}.</span>
                  <Input
                    value={step}
                    onChange={(e) => updateProcessStep(i, e.target.value)}
                    placeholder={`Step ${i + 1}`}
                    className="flex-1"
                  />
                  {processSteps.length > 1 && (
                    <button type="button" onClick={() => removeProcessStep(i)} className="p-2 text-text-tertiary hover:text-error transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4">
          <Link href="/admin/services" className="text-body-sm text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </Link>
          <Button type="submit" loading={saving}>
            <Save size={16} />
            Create Service
          </Button>
        </div>
      </form>
    </div>
  );
}
