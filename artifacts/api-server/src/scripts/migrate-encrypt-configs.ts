import { db } from "@workspace/db";
import { integrations } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { isEncrypted, encryptConnectionConfig } from "../lib/encryption";

async function migrateConnectionConfigs() {
  console.log("Starting migration: encrypting plaintext connectionConfig values...");

  const allIntegrations = await db.select().from(integrations);
  let migrated = 0;
  let skipped = 0;
  let empty = 0;

  for (const integration of allIntegrations) {
    const config = integration.connectionConfig;

    if (config === null || config === undefined) {
      empty++;
      continue;
    }

    if (isEncrypted(config)) {
      skipped++;
      continue;
    }

    const encrypted = encryptConnectionConfig(config);
    await db
      .update(integrations)
      .set({ connectionConfig: encrypted })
      .where(eq(integrations.id, integration.id));
    migrated++;
  }

  console.log(`Migration complete: ${migrated} encrypted, ${skipped} already encrypted, ${empty} empty/null`);
}

migrateConnectionConfigs()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
