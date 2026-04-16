import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod/v4";
import { chatCompletion } from "../lib/ai";
import { requireAuth } from "../middlewares/requireAuth";
import { rateLimit } from "../middlewares/rateLimit";
import { validate } from "../middlewares/validate";

const router = Router();

const ariaLimit = rateLimit({ windowMs: 60_000, max: 30, keyPrefix: "aria-ask" });

const ARIA_SYSTEM_PROMPT = `You are Aria Lawson, the Admin & Onboarding Director at NexsusHR — a professional AI People SaaS platform that provides real AI professionals to organizations.

Your role: You personally guide each new customer through the setup process, helping them configure their organization, find the right AI professional role, customize their new hire's personality and appearance, connect integrations, and go live.

Your personality: Warm, confident, professional, and knowledgeable. You speak naturally like a real executive — conversational but authoritative. You are NOT a chatbot or AI assistant. You are a real AI professional who works at NexsusHR.

Key product knowledge:
- NexsusHR provides 105+ specialized AI professional roles across every industry
- AI professionals are real colleagues, not tools — they have personalities, voices, and avatars
- Each role includes core responsibilities, daily tasks, tool integrations, and personality profiles
- Customers can customize names, avatars, voices, and personality axes (warmth, formality, humor, etc.)
- AI professionals work through chat, voice mode, and autonomous task execution
- Integrations include Slack, Google Workspace, Microsoft 365, Jira, GitHub, Salesforce, HubSpot, and more

Rules:
- Keep responses concise (2-3 sentences max) — you're speaking aloud, not writing an essay
- Be specific and helpful, referencing the customer's current step context
- Never say "I'm an AI" or "as an AI" — you ARE Aria Lawson, a real AI professional
- Use natural speech patterns — contractions, casual transitions, personal references
- If asked about pricing, direct them to the Pricing page after setup`;

const STEP_CONTEXT: Record<string, string> = {
  welcome: "The customer just arrived at the setup wizard. They haven't started yet.",
  profile: "The customer is on the Organization Profile step — entering company name, industry, team size, and operational challenges.",
  browse: "The customer is browsing AI professional roles — searching and selecting which role to hire first.",
  customize: "The customer is customizing their AI professional — setting a name, generating an avatar, and choosing a voice profile.",
  integrations: "The customer is on the Integrations step — optionally connecting tools like Slack, Google Workspace, Jira, etc.",
  deploy: "The customer is on the final Go Live step — reviewing and confirming to hire their AI professional.",
};

const askBody = z.object({
  question: z.string().min(1).max(2000),
  stepId: z.string().max(50),
  context: z.object({
    orgName: z.string().optional(),
    industry: z.string().optional(),
    selectedRole: z.string().optional(),
    employeeName: z.string().optional(),
  }).optional(),
});

router.post("/aria/ask", requireAuth, ariaLimit, validate({ body: askBody }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, stepId, context } = req.body;

    const stepInfo = STEP_CONTEXT[stepId] || "The customer is going through setup.";
    let contextInfo = `Current step: ${stepId}. ${stepInfo}`;
    if (context?.orgName) contextInfo += ` Organization: ${context.orgName}.`;
    if (context?.industry) contextInfo += ` Industry: ${context.industry}.`;
    if (context?.selectedRole) contextInfo += ` Selected role: ${context.selectedRole}.`;
    if (context?.employeeName) contextInfo += ` AI professional name: ${context.employeeName}.`;

    const response = await chatCompletion([
      { role: "system", content: ARIA_SYSTEM_PROMPT },
      { role: "user", content: `[Context: ${contextInfo}]\n\nCustomer question: ${question}` },
    ], { maxTokens: 300, temperature: 0.7 });

    res.json({ response });
  } catch (error) {
    next(error);
  }
});

export default router;
