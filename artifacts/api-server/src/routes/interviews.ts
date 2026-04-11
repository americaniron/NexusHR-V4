import { Router } from "express";
import { db } from "@workspace/db";
import { interviewSessions, interviewCandidates, interviewMessages, aiEmployeeRoles } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { chatCompletion } from "../lib/ai";
import { textToSpeech } from "../lib/elevenlabs";
import { generateInterviewCandidateAvatars } from "../lib/avatars";
import { z } from "zod/v4";
import { validate, idParam } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";
import { logger } from "../lib/logger";

const router = Router();

const CANDIDATE_PERSONALITIES = [
  { style: "analytical", traits: { professionalism: 9, empathy: 6, creativity: 5, assertiveness: 7, humor: 3, formality: 8, detail_orientation: 9 } },
  { style: "creative", traits: { professionalism: 7, empathy: 8, creativity: 9, assertiveness: 5, humor: 7, formality: 5, detail_orientation: 6 } },
  { style: "balanced", traits: { professionalism: 8, empathy: 7, creativity: 7, assertiveness: 6, humor: 5, formality: 7, detail_orientation: 7 } },
];

const createInterviewBody = z.object({
  roleId: z.number().int().min(1),
  mode: z.enum(["text", "voice"]).default("text"),
});

const sendInterviewMessageBody = z.object({
  candidateId: z.number().int().min(1),
  content: z.string().min(1).max(10000),
});

router.post("/interviews", requireAuth, validate({ body: createInterviewBody }), async (req, res, next) => {
  try {
    const { orgId, userId } = await getAuthContext(req);
    if (!orgId || !userId) throw AppError.badRequest("Missing org or user");

    const { roleId, mode } = req.body;

    const [role] = await db.select().from(aiEmployeeRoles).where(eq(aiEmployeeRoles.id, roleId));
    if (!role) throw AppError.notFound("Role not found");

    const [session] = await db.insert(interviewSessions).values({
      orgId, userId, roleId, mode: mode || "text",
    }).returning();

    let candidateAvatars: { avatarUrl: string }[] = [];
    try {
      candidateAvatars = await generateInterviewCandidateAvatars(role.title, role.industry, 3);
    } catch (err) {
      logger.warn({ err }, "Failed to generate interview candidate avatars, using role avatar");
    }

    const candidates = [];
    for (let i = 0; i < 3; i++) {
      const personality = CANDIDATE_PERSONALITIES[i];
      const firstName = ["Alex", "Jordan", "Morgan"][i];
      const avatarUrl = candidateAvatars[i]?.avatarUrl || role.avatarUrl;
      const [candidate] = await db.insert(interviewCandidates).values({
        sessionId: session.id,
        candidateName: `${firstName} ${role.title.split(" ")[0]}`,
        personalityProfile: personality,
        avatarUrl,
      }).returning();
      candidates.push(candidate);
    }

    res.status(201).json({ ...session, candidates });
  } catch (error) {
    next(error);
  }
});

router.get("/interviews/:id", requireAuth, validate({ params: idParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const id = parseInt(String(req.params.id));
    const [session] = await db.select().from(interviewSessions).where(
      and(eq(interviewSessions.id, id), eq(interviewSessions.orgId, orgId))
    );
    if (!session) throw AppError.notFound("Session not found");

    const candidates = await db.select().from(interviewCandidates).where(eq(interviewCandidates.sessionId, id));
    res.json({ ...session, candidates });
  } catch (error) {
    next(error);
  }
});

router.post("/interviews/:id/messages", requireAuth, validate({ params: idParam, body: sendInterviewMessageBody }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.forbidden();

    const sessionId = parseInt(String(req.params.id));
    const { candidateId, content } = req.body;

    const [session] = await db.select().from(interviewSessions).where(
      and(eq(interviewSessions.id, sessionId), eq(interviewSessions.orgId, orgId))
    );
    if (!session) throw AppError.notFound("Session not found");

    const [candidate] = await db.select().from(interviewCandidates).where(
      and(eq(interviewCandidates.id, candidateId), eq(interviewCandidates.sessionId, sessionId))
    );
    if (!candidate) throw AppError.notFound("Candidate not found");

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

    let audioUrl: string | null = null;
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const voiceId = candidate.voiceId || "21m00Tcm4TlvDq8ikWAM";
        const audioBuffer = await textToSpeech(aiResponse.slice(0, 5000), { voiceId });
        const base64Audio = audioBuffer.toString("base64");
        audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
      } catch (ttsErr) {
        logger.warn({ err: ttsErr }, "Interview TTS generation failed, continuing without audio");
      }
    }

    const [aiMsg] = await db.insert(interviewMessages).values({
      sessionId, candidateId, role: "assistant", content: aiResponse, audioUrl,
    }).returning();

    res.json({
      userMessage: { id: userMsg.id, content: userMsg.content, role: userMsg.role },
      aiMessage: { id: aiMsg.id, content: aiResponse, role: "assistant", audioUrl },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
