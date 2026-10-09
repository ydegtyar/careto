import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../server/db/schema.js';

function parseConnectionString(raw?: string): string {
  if (!raw) return '';
  const match = raw.match(/postgresql:\/\/[^\s"']+/);
  if (match) return match[0];
  return raw.trim().replace(/^["']|["']$/g, '');
}

const connectionString = parseConnectionString(process.env.DATABASE_URL);

export const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
