import { Router } from "express";
import { db } from "@workspace/db";
import { interviewSessions, interviewCandidates, interviewMessages, aiEmployeeRoles } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { chatCompletion } from "../lib/openai";

const router = Router();

const CANDIDATE_PERSONALITIES = [
  { style: "analytical", traits: { professionalism: 9, empathy: 6, creativity: 5, assertiveness: 7, humor: 3, formality: 8, detail_orientation: 9 } },
  { style: "creative", traits: { professionalism: 7, empathy: 8, creativity: 9, assertiveness: 5, humor: 7, formality: 5, detail_orientation: 6 } },
  { style: "balanced", traits: { professionalism: 8, empathy: 7, creativity: 7, assertiveness: 6, humor: 5, formality: 7, detail_orientation: 7 } },
];

router.post("/interviews", requireAuth, async (req, res) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) return res.status(400).json({ error: "Missing org or user" });

    const { roleId, mode } = req.body;
    if (!roleId) return res.status(400).json({ error: "roleId required" });

    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, roleId));
    if (!role) return res.status(404).json({ error: "Role not found" });

    const [session] = await db.insert(interviewSessions).values({
      orgId, userId, roleId, mode: mode || "text",
    }).returning();

    const candidates = [];
    for (let i = 0; i < 3; i++) {
      const personality = CANDIDATE_PERSONALITIES[i];
      const firstName = ["Alex", "Jordan", "Morgan"][i];
      const [candidate] = await db.insert(interviewCandidates).values({
        sessionId: session.id,
        candidateName: `${firstName} ${role.title.split(" ")[0]}`,
        personalityProfile: personality,
        avatarUrl: role.avatarUrl,
      }).returning();
      candidates.push(candidate);
    }

    res.status(201).json({ ...session, candidates });
  } catch (error) {
    res.status(500).json({ error: "Failed to create interview" });
  }
});

router.get("/interviews/:id", requireAuth, async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden" });

    const id = parseInt(req.params.id);
    const [session] = await db.select().from(interviewSessions).where(
      and(eq(interviewSessions.id, id), eq(interviewSessions.orgId, orgId))
    );
    if (!session) return res.status(404).json({ error: "Session not found" });

    const candidates = await db.select().from(interviewCandidates).where(eq(interviewCandidates.sessionId, id));
    res.json({ ...session, candidates });
  } catch (error) {
    res.status(500).json({ error: "Failed to get interview" });
  }
});

router.post("/interviews/:id/messages", requireAuth, async (req, res) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) return res.status(403).json({ error: "Forbidden" });

    const sessionId = parseInt(req.params.id);
    const { candidateId, content } = req.body;
    if (!candidateId || !content) return res.status(400).json({ error: "candidateId and content required" });

    const [session] = await db.select().from(interviewSessions).where(
      and(eq(interviewSessions.id, sessionId), eq(interviewSessions.orgId, orgId))
    );
    if (!session) return res.status(404).json({ error: "Session not found" });

    const [candidate] = await db.select().from(interviewCandidates).where(eq(interviewCandidates.id, candidateId));
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, session.roleId));

    const [userMsg] = await db.insert(interviewMessages).values({
      sessionId, candidateId, role: "user", content,
    }).returning();

    const history = await db.select().from(interviewMessages)
      .where(eq(interviewMessages.candidateId, candidateId));

    const personality = candidate.personalityProfile as Record<string, unknown>;
    const systemPrompt = `You are ${candidate.candidateName}, an AI candidate interviewing for the role of ${role?.title || "AI Employee"}. 
Your personality style is ${(personality?.style as string) || "balanced"}.
Role description: ${role?.description || "A professional AI employee"}.
Be conversational, professional, and demonstrate competence for this role. 
Answer questions about your capabilities, experience, and approach to work.
Keep responses concise (2-3 paragraphs max).`;

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const aiResponse = await chatCompletion(chatMessages);

    const [aiMsg] = await db.insert(interviewMessages).values({
      sessionId, candidateId, role: "assistant", content: aiResponse,
    }).returning();

    res.json({
      userMessage: { id: userMsg.id, content: userMsg.content, role: userMsg.role },
      aiMessage: { id: aiMsg.id, content: aiResponse, role: "assistant", audioUrl: null },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown";
    res.status(500).json({ error: "Failed to send message: " + message });
  }
});

export default router;
