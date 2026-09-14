"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cateringRequestSchema, type CateringRequestInput } from "@/validators";
import { Input, Textarea, Select, Button, AmbientBackground, AmbientIconField } from "@/components/ui";
import { PageHero } from "@/components/sections/page-hero";
import { CheckCircle } from "lucide-react";

const DRAFT_KEY = "mvmfox_catering_draft";

export default function RequestCateringPage() {
  const [submitted, setSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CateringRequestInput>({
    resolver: zodResolver(cateringRequestSchema),
  });

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        reset(data);
        setRestored(true);
        // Clear after 5 seconds
        setTimeout(() => setRestored(false), 5000);
      }
    } catch {
      // ignore
    }
  }, [reset]);

  // Auto-save draft to localStorage on change (debounced)
  useEffect(() => {
    const subscription = watch((data) => {
      const timeout = setTimeout(() => {
        try {
          const filled = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== undefined && v !== "" && v !== null)
          );
          if (Object.keys(filled).length > 0) {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(filled));
          }
        } catch {
          // ignore
        }
      }, 1000);
      return () => clearTimeout(timeout);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: CateringRequestInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/catering/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to submit request");
      }
      const body = await res.json();
      setReferenceCode(body.referenceCode || null);
      setSubmitted(true);
      // Clear draft on successful submission
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <PageHero
          title="Catering Request Received"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Catering", href: "/catering" },
            { label: "Request" },
          ]}
        />
        <section className="relative section-padding bg-bg-primary-light overflow-hidden">
          <AmbientBackground icons="catering" variant="light" />
          <AmbientIconField variant="light" density="low" />
          <div className="container-mvm max-w-lg text-center relative z-10">
            <CheckCircle size={64} className="mx-auto text-success mb-6" />
            <h2 className="text-h2 font-bold mb-4">Thank You!</h2>
            {referenceCode && (
              <div className="inline-block rounded-md bg-accent/10 px-4 py-2 mb-4">
                <p className="text-caption text-accent font-medium">Your Reference Code</p>
                <p className="text-h3 font-bold text-accent">{referenceCode}</p>
              </div>
            )}
            <p className="text-body-lg text-text-secondary">
              We&apos;ve received your catering request. Our team will review the
              details and get back to you within 1-2 business days.
            </p>
            <p className="text-body-sm text-text-secondary mt-4">
              Save your reference code — use it at <a href="/track" className="text-accent hover:underline">/track</a> to check status anytime.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        title="Request Catering"
        subtitle="Tell us about your event and we'll create the perfect catering experience."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Catering", href: "/catering" },
          { label: "Request" },
        ]}
      />

      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="catering" variant="light" />
        <AmbientIconField variant="light" density="low" />
        <div className="container-mvm max-w-2xl relative z-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register("name")}
              />
              <Input
                label="Email"
                type="email"
                placeholder="john@company.com"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Phone"
                type="tel"
                placeholder="(555) 123-4567"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <Input
                label="Company / Event Name"
                placeholder="Acme Corp / Smith Wedding"
                error={errors.companyName?.message}
                {...register("companyName")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Event Date"
                type="date"
                error={errors.eventDate?.message}
                {...register("eventDate")}
              />
              <Input
                label="Number of Guests"
                type="number"
                placeholder="e.g., 100"
                error={errors.guestCount?.message}
                {...register("guestCount", { valueAsNumber: true })}
              />
            </div>

            <Input
              label="Event Type"
              placeholder="e.g., Corporate Lunch, Wedding Reception, Birthday Party"
              hint="What kind of event is this?"
              error={errors.eventTypeId?.message}
              {...register("eventTypeId")}
            />

            <Input
              label="Location"
              placeholder="Venue name or address"
              error={errors.location?.message}
              {...register("location")}
            />

            <Input
              label="Package Interest (optional)"
              placeholder="e.g., Premium Package"
              {...register("packageName")}
            />

            <Textarea
              label="Additional Notes"
              placeholder="Tell us about any dietary restrictions, special requests, or other details..."
              maxLength={500}
              {...register("notes")}
            />

            {error && (
              <div className="rounded-md bg-error/10 border border-error/20 p-4">
                <p className="text-body-sm text-error">{error}</p>
              </div>
            )}

            <p className="text-caption text-text-tertiary">
              By submitting this form, you agree to our{" "}
              <a href="/privacy" className="underline hover:text-text-secondary">
                Privacy Policy
              </a>
              .
            </p>

            <Button type="submit" size="lg" loading={submitting} fullWidth>
              Submit Catering Request
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
