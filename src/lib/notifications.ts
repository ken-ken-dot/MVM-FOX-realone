import { prisma } from "./prisma";

type NotificationType = "order" | "catering_request" | "service_request" | "low_stock";

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
}

/**
 * Create an in-app notification for admin users.
 */
export async function createNotification({
  type,
  title,
  message,
  entityId,
  entityType,
}: CreateNotificationParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        type,
        title,
        message,
        entityId: entityId || null,
        entityType: entityType || null,
      },
    });
  } catch {
    console.error("Failed to create notification:", { type, title });
  }
}

/**
 * Get unread notification count.
 */
export async function getUnreadCount(): Promise<number> {
  try {
    return await prisma.notification.count({ where: { isRead: false } });
  } catch {
    return 0;
  }
}

/**
 * Get recent notifications (newest first), limited to given count.
 */
export async function getRecentNotifications(limit = 20) {
  try {
    return await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(id: string): Promise<void> {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  } catch {
    console.error("Failed to mark notification as read:", id);
  }
}

/**
 * Mark all notifications as read.
 */
export async function markAllAsRead(): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  } catch {
    console.error("Failed to mark all notifications as read");
  }
}
