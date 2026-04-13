/**
 * Route Authentication & Validation Audit (Phase 20)
 *
 * Public (no auth required):
 *   - GET /api/healthz — Health check (health.ts)
 *   - GET /api/roles — Marketplace catalog, public read (roles.ts)
 *   - POST /api/billing/webhook — Stripe webhook (billing.ts, verified via Stripe signature)
 *
 * Protected (requireAuth + Zod validation on all inputs):
 *   - /api/organizations — requireAuth (organizations.ts)
 *   - /api/users — requireAuth (users.ts)
 *   - /api/employees — requireAuth (employees.ts)
 *   - /api/interviews — requireAuth (interviews.ts)
 *   - /api/tasks — requireAuth (tasks.ts)
 *   - /api/workflows — requireAuth (workflows.ts)
 *   - /api/conversations — requireAuth (conversations.ts)
 *   - /api/integrations — requireAuth (integrations.ts)
 *   - /api/billing — requireAuth (billing.ts, except webhook)
 *   - /api/notifications — requireAuth (notifications.ts)
 *   - /api/support — requireAuth (support.ts)
 *   - /api/dashboard — requireAuth (dashboard.ts)
 *   - /api/voices — requireAuth (voices.ts)
 *   - /api/storage — requireAuth (storage.ts)
 *   - /api/avatars — requireAuth + rate limit (avatars.ts)
 *   - /api/voice — requireAuth + rate limit (voice.ts)
 *   - /api/personality — requireAuth (personality.ts)
 *   - /api/prompts — requireAuth (prompts.ts)
 *   - /api/orchestration — requireAuth (orchestration.ts)
 *   - /api/tools — requireAuth (tools.ts)
 *   - /api/video-studio — requireAuth (video-studio.ts)
 */
import { Router, type IRouter } from "express";
import healthRouter from "./health";
import organizationsRouter from "./organizations";
import usersRouter from "./users";
import rolesRouter from "./roles";
import employeesRouter from "./employees";
import interviewsRouter from "./interviews";
import tasksRouter from "./tasks";
import workflowsRouter from "./workflows";
import conversationsRouter from "./conversations";
import integrationsRouter from "./integrations";
import billingRouter from "./billing";
import notificationsRouter from "./notifications";
import supportRouter from "./support";
import dashboardRouter from "./dashboard";
import voicesRouter from "./voices";
import storageRouter from "./storage";
import avatarsRouter from "./avatars";
import voiceRouter from "./voice";
import personalityRouter from "./personality";
import promptsRouter from "./prompts";
import orchestrationRouter from "./orchestration";
import toolsRouter from "./tools";
import videoStudioRouter from "./video-studio";

const router: IRouter = Router();

router.use(healthRouter);
router.use(organizationsRouter);
router.use(usersRouter);
router.use(rolesRouter);
router.use(employeesRouter);
router.use(interviewsRouter);
router.use(tasksRouter);
router.use(workflowsRouter);
router.use(conversationsRouter);
router.use(integrationsRouter);
router.use(billingRouter);
router.use(notificationsRouter);
router.use(supportRouter);
router.use(dashboardRouter);
router.use(voicesRouter);
router.use(storageRouter);
router.use(avatarsRouter);
router.use(voiceRouter);
router.use(personalityRouter);
router.use(promptsRouter);
router.use(orchestrationRouter);
router.use(toolsRouter);
router.use(videoStudioRouter);

export default router;
