import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function getSessionId() {
  return `session_${Math.random().toString(36).substring(2)}_${Date.now()}`;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("cart_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ id: null, items: [] });
    }

    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                slug: true,
                images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(cart || { id: null, items: [] });
  } catch {
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity = 1 } = await request.json();
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("cart_session")?.value;

    if (!sessionId) {
      sessionId = getSessionId();
    }

    let cart = await prisma.cart.findUnique({
      where: { sessionId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("cart_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}
