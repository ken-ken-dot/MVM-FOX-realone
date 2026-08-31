import { NextRequest, NextResponse } from "next/server";
import { getRecentNotifications, markAsRead, markAllAsRead, getUnreadCount } from "@/lib/notifications";

export async function GET() {
  try {
    const [notifications, unreadCount] = await Promise.all([
      getRecentNotifications(30),
      getUnreadCount(),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.markAllAsRead) {
      await markAllAsRead();
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      await markAsRead(body.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
