import { db } from "@workspace/db";
import { aiEmployeeRoles } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { financeLegalInsuranceRoles } from "./finance-legal-insurance-roles-data";

async function seedFinanceLegalInsuranceRoles() {
  console.log("[seed-finance-legal-insurance] Starting role seeding...");
  console.log(`[seed-finance-legal-insurance] ${financeLegalInsuranceRoles.length} roles to process`);

  let inserted = 0;
  let updated = 0;

  for (const role of financeLegalInsuranceRoles) {
    const [existing] = await db
      .select()
      .from(aiEmployeeRoles)
      .where(eq(aiEmployeeRoles.title, role.title))
      .limit(1);

    if (existing) {
      await db
        .update(aiEmployeeRoles)
        .set({
          department: role.department,
          category: role.category,
          industry: role.industry,
          reportsTo: role.reportsTo,
          seniorityLevel: role.seniorityLevel,
          description: role.description,
          coreResponsibilities: role.coreResponsibilities,
          tasks: role.tasks,
          toolsAndIntegrations: role.toolsAndIntegrations,
          dataAccessPermissions: role.dataAccessPermissions,
          communicationCapabilities: role.communicationCapabilities,
          exampleWorkflows: role.exampleWorkflows,
          performanceMetrics: role.performanceMetrics,
          useCases: role.useCases,
          personalityDefaults: role.personalityDefaults,
          complianceMetadata: role.complianceMetadata,
          skillsTags: role.skillsTags,
          priceMonthly: role.priceMonthly,
          updatedAt: new Date(),
        })
        .where(eq(aiEmployeeRoles.id, existing.id));

      console.log(`  Updated: ${role.title}`);
      updated++;
    } else {
      await db.insert(aiEmployeeRoles).values(role);
      console.log(`  Inserted: ${role.title}`);
      inserted++;
    }
  }

  console.log(`\n[seed-finance-legal-insurance] Complete!`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Total: ${financeLegalInsuranceRoles.length}`);

  process.exit(0);
}

seedFinanceLegalInsuranceRoles().catch((err) => {
  console.error("[seed-finance-legal-insurance] Error:", err);
  process.exit(1);
});
