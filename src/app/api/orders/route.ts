import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { createReferenceCode } from "@/lib/reference-codes";
import { createNotification } from "@/lib/notifications";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      phone,
      firstName,
      lastName,
      address,
      city,
      state,
      zip,
      country,
      notes,
    } = body;

    if (!email || !firstName || !lastName || !address || !city || !state || !zip) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get cart
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: "No cart found" }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
      const price = parseFloat(item.product.price.toString());
      subtotal += price * item.quantity;
      return {
        productId: item.productId,
        productName: item.product.name,
        price: price,
        quantity: item.quantity,
      };
    });

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email,
          firstName,
          lastName,
          phone: phone || undefined,
        },
      });
    }

    // Generate reference code
    const referenceCode = await createReferenceCode("order");

    // Check stock availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}, requested: ${item.quantity}` },
          { status: 400 },
        );
      }
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        referenceCode,
        customerId: customer.id,
        email,
        phone,
        firstName,
        lastName,
        shippingAddress: { line1: address, city, state, zip, country: country || "US" },
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal,
        tax: 0,
        total: subtotal,
        notes,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    // Decrement stock
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Notify admin of new order
    await createNotification({
      type: "order",
      title: "New Order",
      message: `${order.orderNumber} — ${order.firstName} ${order.lastName} — $${order.total}`,
      entityId: order.id,
      entityType: "Order",
    });

    // Check for low stock alerts
    for (const item of cart.items) {
      const updatedProduct = await prisma.product.findUnique({ where: { id: item.productId } });
      if (updatedProduct && updatedProduct.stock <= 5 && updatedProduct.status === "PUBLISHED") {
        await createNotification({
          type: "low_stock",
          title: "Low Stock Alert",
          message: `${updatedProduct.name} has only ${updatedProduct.stock} units remaining`,
          entityId: updatedProduct.id,
          entityType: "Product",
        });
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
