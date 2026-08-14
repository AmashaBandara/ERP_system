import type { Knex } from 'knex';
import { db } from '../db/knex';

export interface AuditEntry {
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  ip_address?: string | null;
  user_agent?: string | null;
  before_json?: unknown;
  after_json?: unknown;
}

export async function writeAudit(entry: AuditEntry, trx: Knex = db): Promise<void> {
  await trx('audit_logs').insert({
    user_id: entry.user_id,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    ip_address: entry.ip_address ?? null,
    user_agent: entry.user_agent ?? null,
    before_json: entry.before_json ?? null,
    after_json: entry.after_json ?? null,
  });
}
