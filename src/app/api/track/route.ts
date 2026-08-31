import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public tracking endpoint.
 * Accepts { referenceCode, email } and returns the status of the matching record.
 * Only exposes: type, referenceCode, status, createdAt, updatedAt — no internal notes.
 */
export async function POST(request: NextRequest) {
  try {
    const { referenceCode, email } = await request.json();

    if (!referenceCode || !email) {
      return NextResponse.json(
        { error: "Reference code and email are required" },
        { status: 400 }
      );
    }

    const normalizedCode = referenceCode.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Try order first
    const order = await prisma.order.findFirst({
      where: { referenceCode: normalizedCode, email: normalizedEmail },
      select: {
        referenceCode: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (order) {
      return NextResponse.json({
        type: "order",
        referenceCode: order.referenceCode,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      });
    }

    // Try catering request
    const catering = await prisma.cateringRequest.findFirst({
      where: { referenceCode: normalizedCode, email: normalizedEmail },
      select: {
        referenceCode: true,
        status: true,
        guestCount: true,
        eventDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (catering) {
      return NextResponse.json({
        type: "catering",
        referenceCode: catering.referenceCode,
        status: catering.status,
        guestCount: catering.guestCount,
        eventDate: catering.eventDate,
        createdAt: catering.createdAt,
        updatedAt: catering.updatedAt,
      });
    }

    // Try service request
    const service = await prisma.serviceRequest.findFirst({
      where: { referenceCode: normalizedCode, email: normalizedEmail },
      select: {
        referenceCode: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (service) {
      return NextResponse.json({
        type: "service",
        referenceCode: service.referenceCode,
        status: service.status,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      });
    }

    return NextResponse.json(
      { error: "No request found with that reference code and email combination." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Track lookup failed:", error);
    return NextResponse.json(
      { error: "Failed to look up request" },
      { status: 500 }
    );
  }
}
