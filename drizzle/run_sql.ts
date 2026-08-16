import { db } from './index';
import { sql } from 'drizzle-orm';

async function run() {
  try {
    await db.execute(sql`ALTER TABLE trusted_resellers ADD COLUMN IF NOT EXISTS gov_id_url text;`);
    await db.execute(sql`ALTER TABLE trusted_resellers ADD COLUMN IF NOT EXISTS selfie_url text;`);
    await db.execute(sql`ALTER TABLE trusted_resellers ADD COLUMN IF NOT EXISTS location_lat varchar(50);`);
    await db.execute(sql`ALTER TABLE trusted_resellers ADD COLUMN IF NOT EXISTS location_lng varchar(50);`);
    await db.execute(sql`ALTER TABLE trusted_resellers ADD COLUMN IF NOT EXISTS tier integer NOT NULL DEFAULT 1;`);
    await db.execute(sql`ALTER TABLE trusted_resellers ADD COLUMN IF NOT EXISTS tier2_status varchar(50) NOT NULL DEFAULT 'not_applied';`);
    console.log('Successfully added columns');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
run();
