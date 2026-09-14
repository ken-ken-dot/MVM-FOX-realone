"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input, Button, AmbientBackground, AmbientIconField } from "@/components/ui";
import { PageHero } from "@/components/sections/page-hero";
import { Package, ClipboardList, Briefcase, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface TrackingResult {
  type: "order" | "catering" | "service";
  referenceCode: string;
  status: string;
  orderNumber?: string;
  paymentStatus?: string;
  total?: string;
  guestCount?: number;
  eventDate?: string;
  createdAt: string;
  updatedAt: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock size={20} className="text-warning" />,
  NEW: <Clock size={20} className="text-info" />,
  REVIEWING: <AlertCircle size={20} className="text-warning" />,
  CONFIRMED: <CheckCircle size={20} className="text-success" />,
  QUOTED: <AlertCircle size={20} className="text-warning" />,
  PROCESSING: <AlertCircle size={20} className="text-info" />,
  SHIPPED: <Package size={20} className="text-info" />,
  DELIVERED: <CheckCircle size={20} className="text-success" />,
  COMPLETED: <CheckCircle size={20} className="text-success" />,
  CANCELLED: <AlertCircle size={20} className="text-error" />,
};

const typeLabels = {
  order: "Order",
  catering: "Catering Request",
  service: "Service Request",
};

const typeIcons = {
  order: <Package size={20} className="text-accent" />,
  catering: <ClipboardList size={20} className="text-accent" />,
  service: <Briefcase size={20} className="text-accent" />,
};

export default function TrackPage() {
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      referenceCode: "",
      email: "",
    },
  });

  const onSubmit = async (data: { referenceCode: string; email: string }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Not found");
      }

      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHero
        title="Track Your Request"
        subtitle="Enter your reference code and email to check the status of your order, catering request, or service inquiry."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Track" }]}
      />

      <section className="relative section-padding bg-bg-primary-light overflow-hidden">
        <AmbientBackground icons="mixed" variant="light" />
        <AmbientIconField variant="light" density="low" />
        <div className="container-mvm max-w-2xl relative z-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Reference Code"
                placeholder="MVF-OR-1234"
                hint="Found on your confirmation screen"
                error={errors.referenceCode?.message}
                {...register("referenceCode", { required: "Reference code is required" })}
              />
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                {...register("email", { required: "Email is required" })}
              />
            </div>

            {error && (
              <div className="rounded-md bg-error/10 border border-error/20 p-4">
                <p className="text-body-sm text-error">{error}</p>
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} fullWidth>
              Look Up Status
            </Button>
          </form>

          {result && (
            <div className="rounded-lg border border-border-subtle bg-white p-6">
              <div className="flex items-center gap-3 mb-6">
                {typeIcons[result.type]}
                <div>
                  <h2 className="text-h3 font-semibold">{typeLabels[result.type]}</h2>
                  <p className="text-caption text-text-tertiary">
                    Reference: {result.referenceCode}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-text-tertiary mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {statusIcons[result.status] || <Clock size={20} className="text-text-tertiary" />}
                    <span className="text-body font-semibold">{result.status.replace(/_/g, " ")}</span>
                  </div>
                </div>

                {result.orderNumber && (
                  <div>
                    <p className="text-caption text-text-tertiary mb-1">Order Number</p>
                    <p className="text-body font-semibold">{result.orderNumber}</p>
                  </div>
                )}

                {result.paymentStatus && (
                  <div>
                    <p className="text-caption text-text-tertiary mb-1">Payment</p>
                    <p className="text-body font-semibold">{result.paymentStatus}</p>
                  </div>
                )}

                {result.total && (
                  <div>
                    <p className="text-caption text-text-tertiary mb-1">Total</p>
                    <p className="text-body font-semibold">${parseFloat(result.total).toFixed(2)}</p>
                  </div>
                )}

                {result.guestCount && (
                  <div>
                    <p className="text-caption text-text-tertiary mb-1">Guests</p>
                    <p className="text-body font-semibold">{result.guestCount}</p>
                  </div>
                )}

                <div>
                  <p className="text-caption text-text-tertiary mb-1">Submitted</p>
                  <p className="text-body font-semibold">
                    {new Date(result.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border-subtle">
                <p className="text-caption text-text-tertiary">
                  Last updated: {new Date(result.updatedAt).toLocaleString("en-US")}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
