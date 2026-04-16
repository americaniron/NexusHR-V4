import { createServer } from "http";
import app from "./app";
import { AI_CONFIG, AI_CONFIG_ALL_DEFAULTS } from "./lib/aiConfig";
import { logger } from "./lib/logger";
import { initWebSocket } from "./lib/websocket";
import { initializeEmailTransport } from "./lib/email";
import { startBillingScheduler } from "./lib/billing/scheduler";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);

initWebSocket(httpServer);
initializeEmailTransport();
startBillingScheduler();

httpServer.listen(port, () => {
  logger.info(
    {
      ai: {
        provider: AI_CONFIG.provider,
        model: AI_CONFIG.model,
        defaultMaxTokens: AI_CONFIG.defaultMaxTokens,
        refinementMaxTokens: AI_CONFIG.refinementMaxTokens,
      },
    },
    "AI configuration loaded",
  );
  if (AI_CONFIG_ALL_DEFAULTS) {
    logger.warn(
      "AI configuration is using all default values. Set AI_PROVIDER, AI_MODEL, AI_DEFAULT_MAX_TOKENS, or AI_REFINEMENT_MAX_TOKENS environment variables to customize.",
    );
  }
  logger.info({ port }, "Server listening");
});

httpServer.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});
