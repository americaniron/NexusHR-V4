import { db } from "@workspace/db";
import { aiEmployeeRoles } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";
import rolesData from "../scripts/roles-seed-data.json";

export async function seedRolesIfEmpty() {
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(aiEmployeeRoles);
    if (Number(count) > 0) {
      logger.info({ count: Number(count) }, "Roles already seeded, skipping");
      return;
    }

    logger.info("No roles found, seeding AI employee roles...");

    const roles = rolesData as Array<Record<string, unknown>>;

    const BATCH_SIZE = 50;
    let inserted = 0;
    for (let i = 0; i < roles.length; i += BATCH_SIZE) {
      const batch = roles.slice(i, i + BATCH_SIZE).map((r) => ({
        title: r.title as string,
        department: r.department as string,
        category: r.category as string,
        industry: r.industry as string,
        reportsTo: r.reports_to as string | null,
        seniorityLevel: r.seniority_level as string,
        description: r.description as string,
        coreResponsibilities: r.core_responsibilities ?? null,
        tasks: r.tasks ?? null,
        toolsAndIntegrations: r.tools_and_integrations ?? null,
        dataAccessPermissions: r.data_access_permissions ?? null,
        communicationCapabilities: r.communication_capabilities ?? null,
        exampleWorkflows: r.example_workflows ?? null,
        performanceMetrics: r.performance_metrics ?? null,
        useCases: r.use_cases ?? null,
        personalityDefaults: r.personality_defaults ?? null,
        complianceMetadata: r.compliance_metadata ?? null,
        skillsTags: r.skills_tags ?? null,
        priceMonthly: r.price_monthly as number,
        avatarUrl: r.avatar_url as string | null,
        rating: r.rating as number | null,
        isActive: r.is_active as number,
        avatarConfig: r.avatar_config ?? null,
      }));
      await db.insert(aiEmployeeRoles).values(batch);
      inserted += batch.length;
    }

    logger.info({ inserted }, "Roles seeded successfully");
  } catch (err) {
    logger.error({ err }, "Failed to seed roles");
  }
}
