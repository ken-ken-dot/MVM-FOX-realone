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
  CONFIRMED: "success",
  COMPLETED: "success",
  CANCELLED: "error",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminCateringDetailPage({ params }: Props) {
  const { id } = await params;

  const request = await safeQuery(
    () =>
      prisma.cateringRequest.findUnique({
        where: { id },
        include: {
          event: true,
          customer: true,
        },
      }),
    null,
  );

  if (!request) notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/catering"
          className="inline-flex items-center gap-2 text-body-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Catering
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 font-bold tracking-tight">
            Catering Request
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
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-text-tertiary">Event Type</p>
                  <p className="text-body-sm font-medium">
                    {request.event?.name || request.eventType || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-text-tertiary">Guest Count</p>
                  <p className="text-body-sm font-medium">{request.guestCount}</p>
                </div>
                <div>
                  <p className="text-caption text-text-tertiary">Event Date</p>
                  <p className="text-body-sm font-medium">
                    {request.eventDate
                      ? formatDateTime(request.eventDate)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-text-tertiary">Package</p>
                  <p className="text-body-sm font-medium">
                    {request.packageName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-text-tertiary">Location</p>
                  <p className="text-body-sm font-medium">
                    {request.location || "—"}
                  </p>
                </div>
                {request.address && (
                  <div>
                    <p className="text-caption text-text-tertiary">Address</p>
                    <p className="text-body-sm font-medium">{request.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {request.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
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

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {request.adminNotes ? (
                <div className="rounded-md bg-surface-neutral p-4">
                  <p className="text-body-sm whitespace-pre-wrap">
                    {request.adminNotes}
                  </p>
                </div>
              ) : (
                <p className="text-body-sm text-text-tertiary italic">
                  No admin notes yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quoted Price */}
          {request.quotedPrice && (
            <Card>
              <CardHeader>
                <CardTitle>Quoted Price</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-h3 font-bold text-accent">
                  ${parseFloat(request.quotedPrice.toString()).toFixed(2)}
                </p>
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
