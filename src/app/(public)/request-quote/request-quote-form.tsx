"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteRequestSchema, type QuoteRequestInput } from "@/validators";
import { Input, Textarea, Select, Button } from "@/components/ui";
import { PageHero } from "@/components/sections/page-hero";
import { CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

const DRAFT_KEY = "mvmfox_quote_draft";

export function RequestQuoteForm() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service");
  const [submitted, setSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuoteRequestInput>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      serviceId: preselectedService || "",
    },
  });

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        reset({ ...data, serviceId: preselectedService || data.serviceId });
      }
    } catch {
      // ignore
    }
  }, [reset, preselectedService]);

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

  const onSubmit = async (data: QuoteRequestInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/services/request-quote", {
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
          title="Quote Request Received"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: "Request Quote" },
          ]}
        />
        <section className="section-padding bg-bg-primary-light">
          <div className="container-mvm max-w-lg text-center">
            <CheckCircle size={64} className="mx-auto text-success mb-6" />
            <h2 className="text-h2 font-bold mb-4">Thank You!</h2>
            {referenceCode && (
              <div className="inline-block rounded-md bg-accent/10 px-4 py-2 mb-4">
                <p className="text-caption text-accent font-medium">Your Reference Code</p>
                <p className="text-h3 font-bold text-accent">{referenceCode}</p>
              </div>
            )}
            <p className="text-body-lg text-text-secondary">
              We&apos;ve received your quote request. Our team will review it
              and get back to you within 1-2 business days.
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
        title="Request a Quote"
        subtitle="Tell us about your needs and we'll provide a personalized quote."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "Request Quote" },
        ]}
      />

      <section className="section-padding bg-bg-primary-light">
        <div className="container-mvm max-w-2xl">
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
                label="Company Name"
                placeholder="Acme Corp"
                error={errors.companyName?.message}
                {...register("companyName")}
              />
            </div>

            {/* Service selection — would need a services list, use a simple text select for now */}
            <input type="hidden" {...register("serviceId")} />
            <Input
              label="Service Interested In"
              placeholder="e.g., Event Planning, Corporate Catering"
              hint="Let us know which service you're interested in"
              error={errors.serviceId?.message}
              {...register("serviceId", { required: "Please enter a service" })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Event Date"
                type="date"
                error={errors.eventDate?.message}
                {...register("eventDate")}
              />
              <Input
                label="Estimated Guest Count"
                type="number"
                placeholder="e.g., 50"
                error={errors.guestCount?.message}
                {...register("guestCount")}
              />
            </div>

            <Input
              label="Location"
              placeholder="City, State or full address"
              error={errors.location?.message}
              {...register("location")}
            />

            <Textarea
              label="Project Description"
              placeholder="Tell us about your event, requirements, and any special requests..."
              error={errors.description?.message}
              {...register("description")}
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
              . We&apos;ll only use your information to respond to your inquiry.
            </p>

            <Button type="submit" size="lg" loading={submitting} fullWidth>
              Submit Quote Request
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
