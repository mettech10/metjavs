import { prisma } from '../config/prisma.js';

export async function logAudit(action: string, actorId?: string, entityType = 'SYSTEM', entityId?: string, metadata?: unknown) {
  await prisma.auditLog.create({ data: { action, actorId, entityType, entityId, metadata: metadata as object | undefined } });
}
