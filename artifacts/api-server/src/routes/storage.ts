import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";
import { ObjectPermission } from "../lib/objectAcl";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthContext } from "../lib/auth-helpers";
import { AppError } from "../middlewares/errorHandler";
import { recordUsage } from "../lib/billing/metering";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

const pendingUploads = new Map<string, { orgId: number; name: string; estimatedSizeMb: number; contentType: string; createdAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of pendingUploads) {
    if (now - val.createdAt > 15 * 60 * 1000) pendingUploads.delete(key);
  }
}, 5 * 60 * 1000);

router.post("/storage/uploads/request-url", requireAuth, async (req: Request, res: Response) => {
  const { name, size, contentType } = req.body || {};
  if (!name || !size || !contentType) {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }

  try {
    const { orgId } = await getAuthContext(req);

    const sizeBytes = Number(size);
    const sizeMb = Math.max(1, Math.ceil(sizeBytes / (1024 * 1024)));
    const sizeGb = sizeMb / 1024;

    if (orgId) {
      const { checkPlanLimit } = await import("../lib/billing/metering");
      const { allowed, used, limit } = await checkPlanLimit(orgId, "storage_gb", sizeGb);
      if (!allowed) {
        res.status(403).json({
          error: "Storage limit exceeded",
          code: "PLAN_LIMIT_EXCEEDED",
          details: { dimension: "storage_gb", used, limit, requested: sizeGb },
          upgradeUrl: "/billing",
          message: `You've reached your storage limit (${used} GB / ${limit} GB). Upgrade your plan to continue.`,
        });
        return;
      }
    }

    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    if (orgId) {
      pendingUploads.set(objectPath, { orgId, name, estimatedSizeMb: sizeMb, contentType, createdAt: Date.now() });
    }

    res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
  } catch (error) {
    console.error("[Storage] Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

router.post("/storage/uploads/confirm", requireAuth, async (req: Request, res: Response) => {
  const { objectPath, actualSize } = req.body || {};
  if (!objectPath) {
    res.status(400).json({ error: "Missing objectPath" });
    return;
  }

  try {
    const { orgId } = await getAuthContext(req);
    const pending = pendingUploads.get(objectPath);

    if (!pending || !orgId) {
      res.json({ confirmed: true });
      return;
    }

    const verifiedSizeMb = actualSize
      ? Math.max(1, Math.ceil(Number(actualSize) / (1024 * 1024)))
      : pending.estimatedSizeMb;

    await recordUsage(orgId, "storage_gb", verifiedSizeMb, {
      name: pending.name,
      size: verifiedSizeMb * 1024 * 1024,
      contentType: pending.contentType,
      objectPath,
    });

    pendingUploads.delete(objectPath);
    res.json({ confirmed: true, recordedSizeMb: verifiedSizeMb });
  } catch (error) {
    console.error("[Storage] Error confirming upload:", error);
    res.status(500).json({ error: "Failed to confirm upload" });
  }
});

router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const response = await objectStorageService.downloadObject(file);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error("[Storage] Error serving public object:", error);
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

router.get("/storage/objects/*path", requireAuth, async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);

    const { userId } = await getAuthContext(req);
    const hasAccess = await objectStorageService.canAccessObjectEntity({
      userId: userId ? String(userId) : undefined,
      objectFile,
      requestedPermission: ObjectPermission.READ,
    });

    if (!hasAccess) {
      throw AppError.forbidden("You do not have permission to access this object");
    }

    const response = await objectStorageService.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error("[Storage] Error serving object:", error);
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
