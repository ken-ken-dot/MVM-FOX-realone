import { prisma } from "./prisma";

/**
 * Generate a short human-readable reference code.
 * Format: MVF-{TYPE}-{4-digit random}
 * Types: OR (Order), CT (Catering), SV (Service)
 */
const TYPE_PREFIXES = {
  order: "OR",
  catering: "CT",
  service: "SV",
} as const;

type ReferenceType = keyof typeof TYPE_PREFIXES;

function generateCode(type: ReferenceType): string {
  const prefix = TYPE_PREFIXES[type];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `MVF-${prefix}-${num}`;
}

/**
 * Generate a unique reference code, retrying on collision.
 */
export async function createReferenceCode(type: ReferenceType): Promise<string> {
  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateCode(type);
    const exists = await checkExists(type, code);
    if (!exists) return code;
  }
  throw new Error(`Failed to generate unique reference code for ${type} after ${maxAttempts} attempts`);
}

async function checkExists(type: ReferenceType, code: string): Promise<boolean> {
  switch (type) {
    case "order":
      return !!(await prisma.order.findUnique({ where: { referenceCode: code }, select: { id: true } }));
    case "catering":
      return !!(await prisma.cateringRequest.findUnique({ where: { referenceCode: code }, select: { id: true } }));
    case "service":
      return !!(await prisma.serviceRequest.findUnique({ where: { referenceCode: code }, select: { id: true } }));
  }
}
