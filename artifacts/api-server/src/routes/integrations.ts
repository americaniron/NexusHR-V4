import { Router } from "express";
import { db } from "@workspace/db";
import { toolRegistry, integrations } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { z } from "zod/v4";
import { validate } from "../middlewares/validate";
import { AppError } from "../middlewares/errorHandler";
import { requirePlanLimit } from "../middlewares/planLimits";
import { recordUsage, checkAllCountBasedLimits } from "../lib/billing/metering";
import crypto from "crypto";

const router = Router();

function redactIntegration(record: typeof integrations.$inferSelect) {
  const { connectionConfig: _cc, ...safe } = record;
  return safe;
}

const toolIdParam = z.object({
  toolId: z.coerce.number().int().min(1),
});

router.get("/integrations", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    const tools = await db.select().from(toolRegistry).where(eq(toolRegistry.isActive, 1));

    const data = await Promise.all(tools.map(async (tool) => {
      let isConnected = false;
      let connectedAt = null;
      if (orgId) {
        const [integration] = await db.select().from(integrations)
          .where(and(eq(integrations.orgId, orgId), eq(integrations.toolId, tool.id)));
        if (integration && integration.status === "connected") {
          isConnected = true;
          connectedAt = integration.connectedAt;
        }
      }
      return {
        id: tool.id,
        name: tool.name,
        displayName: tool.displayName,
        category: tool.category,
        description: tool.description,
        iconUrl: tool.iconUrl,
        isConnected,
        connectedAt,
      };
    }));

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

const OAUTH_CONFIGS: Record<string, {
  authUrl: string;
  tokenUrl: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  scopes: string[];
}> = {
  slack: {
    authUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    clientIdEnv: "SLACK_CLIENT_ID",
    clientSecretEnv: "SLACK_CLIENT_SECRET",
    scopes: [
      "channels:read", "channels:history", "chat:write",
      "users:read", "groups:read", "groups:history",
    ],
  },
  "google-workspace": {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    scopes: [
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/drive",
    ],
  },
};

const OAUTH_REQUIRED_TOOLS = new Set(Object.keys(OAUTH_CONFIGS));

router.post("/integrations/:toolId/connect", requireAuth, requirePlanLimit("integrations"), validate({ params: toolIdParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const toolId = parseInt(String(req.params.toolId));

    const [tool] = await db.select().from(toolRegistry).where(eq(toolRegistry.id, toolId));
    if (!tool) throw AppError.notFound("Tool not found");

    if (OAUTH_REQUIRED_TOOLS.has(tool.name)) {
      const oauthCfg = OAUTH_CONFIGS[tool.name];
      const clientId = process.env[oauthCfg.clientIdEnv];
      const clientSecret = process.env[oauthCfg.clientSecretEnv];
      if (!clientId || !clientSecret) {
        throw AppError.badRequest(`${tool.displayName} requires OAuth configuration. Set ${oauthCfg.clientIdEnv} and ${oauthCfg.clientSecretEnv} environment variables.`);
      }
      res.json({ requiresOAuth: true, provider: tool.name, authorizeUrl: `/api/integrations/oauth/${tool.name}/authorize` });
      return;
    }

    const [existing] = await db.select().from(integrations)
      .where(and(eq(integrations.orgId, orgId), eq(integrations.toolId, toolId)));

    if (existing) {
      const [updated] = await db.update(integrations)
        .set({ status: "connected", connectedAt: new Date() })
        .where(eq(integrations.id, existing.id))
        .returning();
      res.json(redactIntegration(updated));
      return;
    }

    const [created] = await db.insert(integrations).values({
      orgId, toolId, status: "connected", connectedAt: new Date(),
    }).returning();

    await recordUsage(orgId, "integrations", 1, { toolId, action: "connect" });
    await checkAllCountBasedLimits(orgId);
    res.json(redactIntegration(created));
  } catch (error) {
    next(error);
  }
});

router.post("/integrations/:toolId/disconnect", requireAuth, validate({ params: toolIdParam }), async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const toolId = parseInt(String(req.params.toolId));
    const [updated] = await db.update(integrations)
      .set({ status: "disconnected" })
      .where(and(eq(integrations.orgId, orgId), eq(integrations.toolId, toolId)))
      .returning();

    if (!updated) throw AppError.notFound("Integration not found");
    res.json(redactIntegration(updated));
  } catch (error) {
    next(error);
  }
});

const oauthStateStore = new Map<string, { orgId: number; toolName: string; expiresAt: number }>();

router.get("/integrations/oauth/:provider/authorize", requireAuth, async (req, res, next) => {
  try {
    const { orgId } = await getAuthContext(req);
    if (!orgId) throw AppError.badRequest("No organization");

    const provider = req.params.provider;
    const config = OAUTH_CONFIGS[provider];
    if (!config) throw AppError.badRequest(`Unsupported OAuth provider: ${provider}`);

    const clientId = process.env[config.clientIdEnv];
    if (!clientId) throw AppError.badRequest(`${provider} OAuth is not configured`);

    const state = crypto.randomBytes(32).toString("hex");
    oauthStateStore.set(state, {
      orgId,
      toolName: provider,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    const redirectUri = `${process.env.API_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`}/api/integrations/oauth/${provider}/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: config.scopes.join(provider === "slack" ? "," : " "),
      state,
      response_type: "code",
      ...(provider === "google-workspace" ? { access_type: "offline", prompt: "consent" } : {}),
    });

    res.json({ url: `${config.authUrl}?${params.toString()}` });
  } catch (error) {
    next(error);
  }
});

router.get("/integrations/oauth/:provider/callback", async (req, res, next) => {
  try {
    const provider = req.params.provider;
    const config = OAUTH_CONFIGS[provider];
    if (!config) throw AppError.badRequest(`Unsupported OAuth provider: ${provider}`);

    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || !state) throw AppError.badRequest("Missing code or state");

    const storedState = oauthStateStore.get(state);
    if (!storedState || storedState.expiresAt < Date.now()) {
      oauthStateStore.delete(state || "");
      throw AppError.badRequest("Invalid or expired state");
    }
    oauthStateStore.delete(state);

    const clientId = process.env[config.clientIdEnv]!;
    const clientSecret = process.env[config.clientSecretEnv]!;
    const redirectUri = `${process.env.API_BASE_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`}/api/integrations/oauth/${provider}/callback`;

    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (provider === "slack" && tokenData.ok === false) {
      throw AppError.internal(`Slack token exchange failed: ${tokenData.error || "unknown error"}`);
    }
    if (provider !== "slack" && !tokenResponse.ok) {
      throw AppError.internal(`OAuth token exchange failed: ${tokenData.error?.message || tokenData.error || "unknown error"}`);
    }

    const accessToken = provider === "slack"
      ? tokenData.access_token || tokenData.authed_user?.access_token
      : tokenData.access_token;

    if (!accessToken) {
      throw AppError.internal("OAuth token exchange returned no access token");
    }

    const connectionConfig = {
      accessToken,
      refreshToken: tokenData.refresh_token,
      tokenType: tokenData.token_type || "Bearer",
      expiresAt: tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : undefined,
      scope: tokenData.scope,
      ...(provider === "slack" ? { teamId: tokenData.team?.id, teamName: tokenData.team?.name } : {}),
    };

    const [tool] = await db.select().from(toolRegistry).where(eq(toolRegistry.name, storedState.toolName));
    if (!tool) throw AppError.notFound("Tool not found in registry");

    const [existing] = await db.select().from(integrations)
      .where(and(eq(integrations.orgId, storedState.orgId), eq(integrations.toolId, tool.id)));

    if (existing) {
      await db.update(integrations)
        .set({
          status: "connected",
          connectedAt: new Date(),
          connectionConfig,
          connectedScopes: config.scopes,
        })
        .where(eq(integrations.id, existing.id));
    } else {
      await db.insert(integrations).values({
        orgId: storedState.orgId,
        toolId: tool.id,
        status: "connected",
        connectedAt: new Date(),
        connectionConfig,
        connectedScopes: config.scopes,
      });
      await recordUsage(storedState.orgId, "integrations", 1, { toolId: tool.id, action: "oauth_connect" });
      await checkAllCountBasedLimits(storedState.orgId);
    }

    const frontendUrl = process.env.FRONTEND_URL || `https://${process.env.REPLIT_DEV_DOMAIN}`;
    res.redirect(`${frontendUrl}/integrations?connected=${provider}`);
  } catch (error) {
    next(error);
  }
});

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of oauthStateStore) {
    if (value.expiresAt < now) oauthStateStore.delete(key);
  }
}, 60_000);

export default router;
