import { db } from "@workspace/db";
import { aiEmployeeRoles } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { educationManufacturingHospitalityRoles } from "./education-manufacturing-hospitality-roles-data";

async function seedEducationManufacturingHospitalityRoles() {
  console.log("[seed-edu-mfg-hosp] Starting role seeding...");
  console.log(`[seed-edu-mfg-hosp] ${educationManufacturingHospitalityRoles.length} roles to process`);

  let inserted = 0;
  let updated = 0;

  for (const role of educationManufacturingHospitalityRoles) {
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

  console.log(`\n[seed-edu-mfg-hosp] Complete!`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Total: ${educationManufacturingHospitalityRoles.length}`);

  process.exit(0);
}

seedEducationManufacturingHospitalityRoles().catch((err) => {
  console.error("[seed-edu-mfg-hosp] Error:", err);
  process.exit(1);
});
