import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const DRAFT_EXPIRY_HOURS = 24;

function createSignedToken(): string {
  const random = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now().toString(36);
  return `${timestamp}.${random}`;
}

/**
 * Save a form draft with a signed token.
 * POST /api/drafts { formType, data }
 * Returns { token } for resumption.
 */
export async function POST(request: NextRequest) {
  try {
    const { formType, data } = await request.json();

    if (!formType || !data) {
      return NextResponse.json(
        { error: "formType and data are required" },
        { status: 400 }
      );
    }

    const token = createSignedToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + DRAFT_EXPIRY_HOURS);

    const draft = await prisma.formDraft.create({
      data: {
        token,
        formType,
        data,
        expiresAt,
      },
    });

    return NextResponse.json({ token: draft.token, expiresAt: draft.expiresAt });
  } catch (error) {
    console.error("Failed to save draft:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}

/**
 * Retrieve a form draft by token.
 * GET /api/drafts?token=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const draft = await prisma.formDraft.findUnique({
      where: { token },
    });

    if (!draft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    if (new Date() > draft.expiresAt) {
      // Clean up expired draft
      await prisma.formDraft.delete({ where: { id: draft.id } });
      return NextResponse.json(
        { error: "Draft has expired" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      formType: draft.formType,
      data: draft.data,
      expiresAt: draft.expiresAt,
    });
  } catch (error) {
    console.error("Failed to retrieve draft:", error);
    return NextResponse.json(
      { error: "Failed to retrieve draft" },
      { status: 500 }
    );
  }
}
