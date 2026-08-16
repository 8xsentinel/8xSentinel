import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const SUPABASE_DB_URL = "postgresql://postgres.cvrvojvoxyqkfxwlayfr:Manogna902539@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";
const rawUrl = process.env.DATABASE_URL || '';
const connectionString = (!rawUrl || rawUrl.includes('[YOUR-PASSWORD]') || rawUrl.includes('[Manogna902539]'))
  ? SUPABASE_DB_URL
  : rawUrl;

declare global {
  var postgresClient: postgres.Sql | undefined;
}

// Create fresh client with proper pooling and connection error recovery
if (globalThis.postgresClient) {
  try {
    globalThis.postgresClient.end({ timeout: 1 });
  } catch (e) {
    // Ignore error closing old client
  }
}

const client = postgres(connectionString, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.postgresClient = client;
}

export const db = drizzle(client, { schema });
export * from './schema';

