import { db } from "@workspace/db";
import { aiEmployeeRoles } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateAvatar, getDiceBearFallback, type AvatarIdentityPackage } from "../lib/avatars";

const BATCH_SIZE = 5;
const DELAY_BETWEEN_BATCHES_MS = 2000;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function seedAvatars() {
  console.log("[seed-avatars] Starting avatar seeding for all roles...");

  const roles = await db.select().from(aiEmployeeRoles);
  console.log(`[seed-avatars] Found ${roles.length} roles to process`);

  let generated = 0;
  let fallback = 0;
  let skipped = 0;

  for (let batchStart = 0; batchStart < roles.length; batchStart += BATCH_SIZE) {
    const batch = roles.slice(batchStart, batchStart + BATCH_SIZE);
    console.log(`[seed-avatars] Processing batch ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(roles.length / BATCH_SIZE)}`);

    for (const role of batch) {
      if (role.avatarUrl && !role.avatarUrl.includes("dicebear.com")) {
        console.log(`  Skipping ${role.title} - already has custom avatar`);
        skipped++;
        continue;
      }

      try {
        const result = await generateAvatar({
          roleTitle: role.title,
          industry: role.industry,
          seniority: role.seniorityLevel,
          attireStyle: "business-casual",
          seed: `role-${role.id}-${role.title.replace(/\s+/g, "-").toLowerCase()}`,
        });

        const aip: AvatarIdentityPackage = result.identityPackage;

        await db
          .update(aiEmployeeRoles)
          .set({ avatarUrl: result.avatarUrl, avatarConfig: aip })
          .where(eq(aiEmployeeRoles.id, role.id));

        console.log(`  Generated avatar for: ${role.title}`);
        generated++;
      } catch (error) {
        const fallbackUrl = getDiceBearFallback(role.title, "notionists");
        const fallbackAip: AvatarIdentityPackage = {
          version: 1,
          avatarUrl: fallbackUrl,
          renderConfig: {
            size: "512x512",
            style: "dicebear-fallback",
            generationParams: {
              roleTitle: role.title,
              industry: role.industry,
              seniority: role.seniorityLevel,
              attireStyle: "business-casual",
            },
          },
        };
        await db
          .update(aiEmployeeRoles)
          .set({ avatarUrl: fallbackUrl, avatarConfig: fallbackAip })
          .where(eq(aiEmployeeRoles.id, role.id));

        console.log(`  Fallback avatar for: ${role.title} (${error instanceof Error ? error.message : "unknown error"})`);
        fallback++;
      }
    }

    if (batchStart + BATCH_SIZE < roles.length) {
      console.log(`  Waiting ${DELAY_BETWEEN_BATCHES_MS}ms before next batch...`);
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  console.log(`\n[seed-avatars] Complete!`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Fallback: ${fallback}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total: ${roles.length}`);
}

seedAvatars()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed-avatars] Fatal error:", err);
    process.exit(1);
  });
