import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createReferenceCode } from "@/lib/reference-codes";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, companyName, serviceId, location, description, eventDate, guestCount } = body;

    if (!name || !email || !serviceId || !description) {
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

    // Generate reference code
    const referenceCode = await createReferenceCode("service");

    // Create service request
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        referenceCode,
        serviceId,
        customerId: customer.id,
        name,
        email,
        phone,
        companyName,
        location,
        description,
        eventDetails: {
          eventDate: eventDate || null,
          guestCount: guestCount || null,
        },
        status: "NEW",
      },
    });

    // Notify admin of new service request
    await createNotification({
      type: "service_request",
      title: "New Service Inquiry",
      message: `${referenceCode} — ${name} — ${description?.substring(0, 50) || "No description"}`,
      entityId: serviceRequest.id,
      entityType: "ServiceRequest",
    });

    return NextResponse.json({ success: true, referenceCode });
  } catch (error) {
    console.error("Quote request failed:", error);
    return NextResponse.json(
      { error: "Failed to submit quote request" },
      { status: 500 },
    );
  }
}
