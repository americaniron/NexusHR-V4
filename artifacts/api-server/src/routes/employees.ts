import { Router } from "express";
import { db } from "@workspace/db";
import { aiEmployees, aiEmployeeRoles, organizations } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuth } from "@clerk/express";

const router = Router();

async function getOrgId(req: any): Promise<number | null> {
  const auth = getAuth(req);
  const clerkOrgId = auth?.orgId;
  if (!clerkOrgId) return null;
  const [org] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, clerkOrgId));
  return org?.id || null;
}

router.get("/employees", requireAuth, async (req, res) => {
  try {
    const orgId = await getOrgId(req);
    if (!orgId) return res.json({ data: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;
    const { status, department } = req.query;

    let conditions: any[] = [eq(aiEmployees.orgId, orgId)];
    if (status) conditions.push(eq(aiEmployees.status, status as string));
    if (department) conditions.push(eq(aiEmployees.department, department as string));

    const where = and(...conditions);
    const data = await db.select().from(aiEmployees).where(where).limit(limit).offset(offset);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(aiEmployees).where(where);

    const enriched = await Promise.all(data.map(async (emp) => {
      const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, emp.roleId));
      return { ...emp, role };
    }));

    res.json({
      data: enriched,
      pagination: { page, limit, total: Number(count), totalPages: Math.ceil(Number(count) / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to list employees" });
  }
});

router.post("/employees", requireAuth, async (req, res) => {
  try {
    const orgId = await getOrgId(req);
    if (!orgId) return res.status(400).json({ error: "No organization" });

    const { roleId, name, department, team, personality, customInstructions } = req.body;
    if (!roleId || !name) return res.status(400).json({ error: "roleId and name are required" });

    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, roleId));
    if (!role) return res.status(404).json({ error: "Role not found" });

    const [employee] = await db.insert(aiEmployees).values({
      orgId,
      roleId,
      name,
      department: department || role.department,
      team,
      personality: personality || role.personalityDefaults,
      customInstructions,
      avatarUrl: role.avatarUrl,
      voiceId: null,
    }).returning();

    res.status(201).json({ ...employee, role });
  } catch (error) {
    res.status(500).json({ error: "Failed to hire employee" });
  }
});

router.get("/employees/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [employee] = await db.select().from(aiEmployees).where(eq(aiEmployees.id, id));
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, employee.roleId));
    res.json({ ...employee, role });
  } catch (error) {
    res.status(500).json({ error: "Failed to get employee" });
  }
});

router.patch("/employees/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, department, team, status, personality, customInstructions } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (department !== undefined) updates.department = department;
    if (team !== undefined) updates.team = team;
    if (status) updates.status = status;
    if (personality !== undefined) updates.personality = personality;
    if (customInstructions !== undefined) updates.customInstructions = customInstructions;

    const [updated] = await db.update(aiEmployees).set(updates).where(eq(aiEmployees.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Employee not found" });

    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, updated.roleId));
    res.json({ ...updated, role });
  } catch (error) {
    res.status(500).json({ error: "Failed to update employee" });
  }
});

router.delete("/employees/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(aiEmployees)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(aiEmployees.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Employee not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to deactivate employee" });
  }
});

export default router;
