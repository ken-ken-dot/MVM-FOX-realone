import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma, safeQuery } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

const statusVariant: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  NEW: "info",
  REVIEWING: "warning",
  QUOTED: "warning",
  COMPLETED: "success",
  CANCELLED: "error",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminServiceRequestDetailPage({ params }: Props) {
  const { id } = await params;

  const request = await safeQuery(
    () =>
      prisma.serviceRequest.findUnique({
        where: { id },
        include: {
          service: { select: { title: true, slug: true } },
          customer: true,
        },
      }),
    null,
  );

  if (!request) notFound();

  const eventDetails = request.eventDetails as Record<string, string | null> | null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/services/requests"
          className="inline-flex items-center gap-2 text-body-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Service Requests
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 font-bold tracking-tight">
            Service Request
          </h1>
          <p className="text-body text-text-secondary mt-1">
            {request.referenceCode} — Submitted {formatDateTime(request.createdAt)}
          </p>
        </div>
        <Badge variant={statusVariant[request.status]} size="md">
          {request.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-text-tertiary">Service</p>
                  <p className="text-body-sm font-medium">
                    {request.service?.title || "—"}
                  </p>
                </div>
                {request.location && (
                  <div>
                    <p className="text-caption text-text-tertiary">Location</p>
                    <p className="text-body-sm font-medium">{request.location}</p>
                  </div>
                )}
                {eventDetails?.eventDate && (
                  <div>
                    <p className="text-caption text-text-tertiary">Event Date</p>
                    <p className="text-body-sm font-medium">{eventDetails.eventDate}</p>
                  </div>
                )}
                {eventDetails?.guestCount && (
                  <div>
                    <p className="text-caption text-text-tertiary">Guest Count</p>
                    <p className="text-body-sm font-medium">{eventDetails.guestCount}</p>
                  </div>
                )}
              </div>
              {request.description && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <p className="text-caption text-text-tertiary mb-2">Description</p>
                  <p className="text-body-sm text-text-primary whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {request.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-accent/5 border border-accent/10 p-4">
                  <p className="text-body-sm text-text-primary whitespace-pre-wrap">
                    {request.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customer Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-caption text-text-tertiary">Name</p>
                  <p className="text-body-sm font-medium">{request.name}</p>
                </div>
                <div>
                  <p className="text-caption text-text-tertiary">Email</p>
                  <p className="text-body-sm font-medium">{request.email}</p>
                </div>
                {request.phone && (
                  <div>
                    <p className="text-caption text-text-tertiary">Phone</p>
                    <p className="text-body-sm font-medium">{request.phone}</p>
                  </div>
                )}
                {request.companyName && (
                  <div>
                    <p className="text-caption text-text-tertiary">Company</p>
                    <p className="text-body-sm font-medium">{request.companyName}</p>
                  </div>
                )}
                <div>
                  <p className="text-caption text-text-tertiary">Reference Code</p>
                  <p className="text-body-sm font-medium text-accent">
                    {request.referenceCode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
