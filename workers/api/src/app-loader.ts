/**
 * Lazy app loader — imported AFTER environment variables are injected.
 * This ensures DATABASE_URL, CLERK_SECRET_KEY, etc. are available
 * when the Express app and its dependencies initialize.
 */

import app from "../../../artifacts/api-server/src/app";
import { seedRolesIfEmpty } from "../../../artifacts/api-server/src/lib/seedRoles";
import { ensurePgvector } from "../../../artifacts/api-server/src/lib/ensurePgvector";

// Run one-time initialization
let initialized = false;

if (!initialized) {
  initialized = true;

  // Best-effort: seed roles and enable pgvector (don't block requests)
  seedRolesIfEmpty().catch((err) =>
    console.error("Role seeding failed:", err)
  );

  ensurePgvector().catch((err) =>
    console.error("pgvector setup failed:", err)
  );
}

export default app;
