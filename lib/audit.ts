import { store, newId } from "./store";
import { TABLES, type AuditEntry } from "./models";
import { clientIp } from "./rate-limit";

/**
 * Append-only audit log. Every admin write should call this with before/after
 * snapshots so the client has a complete history of what changed and by whom.
 */
export async function logAudit(input: {
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  headers: Headers;
}): Promise<void> {
  try {
    await store.insert<AuditEntry>(TABLES.audit, {
      id: newId(),
      actorId: input.actorId,
      actorEmail: input.actorEmail,
      action: input.action,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      before: input.before ?? null,
      after: input.after ?? null,
      ip: clientIp(input.headers),
      userAgent: input.headers.get("user-agent")?.slice(0, 512) ?? null,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error("[audit] failed to log", e);
  }
}
