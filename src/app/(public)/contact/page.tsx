"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/validators";
import { Input, Textarea, Button } from "@/components/ui";
import { PageHero } from "@/components/sections/page-hero";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to send message");
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHero
        title="Contact Us"
        subtitle="Have a question or need to get in touch? We'd love to hear from you."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="section-padding bg-bg-primary-light">
        <div className="container-mvm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact info */}
            <div>
              <h2 className="text-h3 font-semibold mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <a
                  href="mailto:info@mvmfox.com"
                  className="flex items-center gap-3 text-body hover:text-accent transition-colors"
                >
                  <Mail size={20} className="text-accent" />
                  info@mvmfox.com
                </a>
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-3 text-body hover:text-accent transition-colors"
                >
                  <Phone size={20} className="text-accent" />
                  (123) 456-7890
                </a>
                <div className="flex items-start gap-3 text-body">
                  <MapPin size={20} className="text-accent mt-0.5" />
                  <span>
                    United States
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="rounded-lg border border-border-subtle bg-white p-10 text-center">
                  <CheckCircle
                    size={48}
                    className="mx-auto text-success mb-4"
                  />
                  <h3 className="text-h3 font-semibold mb-2">Message Sent!</h3>
                  <p className="text-body text-text-secondary">
                    We&apos;ll get back to you within 1-2 business days.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="rounded-lg border border-border-subtle bg-white p-6 space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Name"
                      placeholder="John Doe"
                      error={errors.name?.message}
                      {...register("name")}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="john@example.com"
                      error={errors.email?.message}
                      {...register("email")}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Phone (optional)"
                      type="tel"
                      placeholder="(555) 123-4567"
                      error={errors.phone?.message}
                      {...register("phone")}
                    />
                    <Input
                      label="Subject"
                      placeholder="How can we help?"
                      error={errors.subject?.message}
                      {...register("subject")}
                    />
                  </div>

                  <Textarea
                    label="Message"
                    placeholder="Tell us about your inquiry..."
                    error={errors.message?.message}
                    {...register("message")}
                  />

                  {error && (
                    <div className="rounded-md bg-error/10 border border-error/20 p-4">
                      <p className="text-body-sm text-error">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    loading={submitting}
                    fullWidth
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
