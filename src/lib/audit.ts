import { prisma } from "./prisma";

interface AuditLogParams {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Log an admin mutation to the audit trail.
 * Records actor, action, entity, before/after diff, timestamp.
 */
export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  before,
  after,
  ipAddress,
}: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId || undefined,
        before: before ? JSON.parse(JSON.stringify(before)) : undefined,
        after: after ? JSON.parse(JSON.stringify(after)) : undefined,
        ipAddress: ipAddress || undefined,
      },
    });
  } catch {
    // Audit logging should never break the main flow
    console.error("Failed to write audit log:", { action, entity, entityId });
  }
}

/**
 * Compute a shallow diff between two objects.
 * Returns only fields that changed.
 */
export function computeDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): { before: Record<string, unknown>; after: Record<string, unknown> } | null {
  const beforeChanges: Record<string, unknown> = {};
  const afterChanges: Record<string, unknown> = {};
  let hasChanges = false;

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const bVal = before[key];
    const aVal = after[key];
    if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
      beforeChanges[key] = bVal;
      afterChanges[key] = aVal;
      hasChanges = true;
    }
  }

  return hasChanges ? { before: beforeChanges, after: afterChanges } : null;
}
