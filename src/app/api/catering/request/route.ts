import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createReferenceCode } from "@/lib/reference-codes";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      companyName,
      packageName,
      eventTypeId,
      guestCount,
      eventDate,
      location,
      address,
      notes,
    } = body;

    if (!name || !email || !guestCount || !eventDate || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email,
          firstName: name.split(" ")[0],
          lastName: name.split(" ").slice(1).join(" ") || "",
          phone: phone || undefined,
          companyName: companyName || undefined,
        },
      });
    }

    // Resolve package slug if provided
    let resolvedPackageName: string | null = null;
    if (packageName) {
      const pkg = await prisma.cateringPackage.findFirst({
        where: { id: packageName },
      });
      if (pkg) resolvedPackageName = pkg.slug;
    }

    // Generate reference code
    const referenceCode = await createReferenceCode("catering");

    // Create catering request
    const cateringRequest = await prisma.cateringRequest.create({
      data: {
        referenceCode,
        customerId: customer.id,
        name,
        email,
        phone,
        companyName,
        packageName: resolvedPackageName,
        guestCount: parseInt(guestCount),
        eventDate: new Date(eventDate),
        eventType: undefined,
        eventTypeId: eventTypeId || undefined,
        location,
        address,
        notes,
        status: "NEW",
      },
    });

    // Notify admin of new catering request
    await createNotification({
      type: "catering_request",
      title: "New Catering Request",
      message: `${referenceCode} — ${name} — ${guestCount} guests`,
      entityId: cateringRequest.id,
      entityType: "CateringRequest",
    });

    return NextResponse.json({ success: true, referenceCode });
  } catch (error) {
    console.error("Catering request failed:", error);
    return NextResponse.json(
      { error: "Failed to submit catering request" },
      { status: 500 },
    );
  }
}
