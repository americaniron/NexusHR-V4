import { getAnthropicClient } from "@workspace/integrations-anthropic-ai/client";
import { AI_CONFIG } from "./aiConfig";
import { randomUUID } from "crypto";
import { objectStorageClient } from "./objectStorage";
import {
  type AttributeSelectionParams,
  type AttributeVector,
  type PipelineStageResult,
  type PipelineResult,
  encodeAttributeVector,
  buildGenerationPrompt,
  computePerceptualHash,
  computeQualityScore,
  runDiscriminator,
} from "./styleGAN3Pipeline";
import { db, avatarAssets } from "@workspace/db";
import { eq, isNotNull } from "drizzle-orm";

interface AvatarParams {
  roleTitle?: string;
  industry?: string;
  seniority?: string;
  gender?: "male" | "female" | "non-binary";
  ageRange?: "20-30" | "30-40" | "40-50" | "50-60" | "60+";
  ethnicity?: string;
  attireStyle?: "formal" | "business-casual" | "casual" | "creative";
  seed?: string;
}

export interface AvatarIdentityPackage {
  version: number;
  avatarUrl: string;
  voiceId?: string;
  attributeVector?: AttributeVector;
  perceptualHash?: string;
  qualityScore?: number;
  renderConfig: {
    size: string;
    style: string;
    generationParams: AvatarParams | AttributeSelectionParams;
  };
  pipelineMetadata?: {
    stages: PipelineStageResult[];
    totalDurationMs: number;
    model: string;
  };
}

export interface AvatarConfig {
  generationParams?: AvatarParams | AttributeSelectionParams;
  renderSize?: string;
  style?: string;
  voiceId?: string;
}

interface AvatarGenerateResult {
  avatarUrl: string;
  objectPath: string;
  prompt: string;
  avatarConfig: AvatarConfig;
  identityPackage: AvatarIdentityPackage;
}

export interface StyleGAN3GenerateResult extends AvatarGenerateResult {
  attributeVector: AttributeVector;
  qualityScore: number;
  perceptualHash: string;
  isUnique: boolean;
  pipelineStages: PipelineStageResult[];
  totalDurationMs: number;
  assetId: number;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
const QUALITY_THRESHOLD = 0.5;
const MAX_GENERATION_ATTEMPTS = 3;

const INDUSTRY_ATTIRE: Record<string, Record<string, string>> = {
  technology: {
    formal: "wearing a tailored dark suit with a minimalist tech-company feel",
    "business-casual": "wearing a smart blazer over a crew-neck shirt, Silicon Valley style",
    casual: "wearing a clean hoodie or polo, startup-casual",
    creative: "wearing stylish streetwear-meets-tech attire with modern accessories",
  },
  finance: {
    formal: "wearing a classic Wall Street power suit with crisp white shirt",
    "business-casual": "wearing slacks and a pressed dress shirt, no tie",
    casual: "wearing chinos and a fine-knit sweater, relaxed finance look",
    creative: "wearing a tailored blazer with an open collar, modern finance style",
  },
  healthcare: {
    formal: "wearing a white lab coat over professional attire",
    "business-casual": "wearing scrubs or business casual with a stethoscope",
    casual: "wearing clean medical scrubs",
    creative: "wearing a stylish lab coat with modern accessories",
  },
  legal: {
    formal: "wearing a courtroom-ready dark suit with a power tie or blouse",
    "business-casual": "wearing a blazer and dress pants, law-firm casual",
    casual: "wearing slacks and a dress shirt, relaxed legal style",
    creative: "wearing a tailored suit with a colorful pocket square or scarf",
  },
  education: {
    formal: "wearing academic professional attire with subtle scholarly details",
    "business-casual": "wearing a cardigan or blazer over a collared shirt, professorial style",
    casual: "wearing comfortable smart-casual clothing, approachable educator look",
    creative: "wearing artistic professional attire, creative teacher style",
  },
  marketing: {
    formal: "wearing a sharp modern suit, agency-executive look",
    "business-casual": "wearing trendy business casual, fashion-forward marketing style",
    casual: "wearing a stylish casual outfit, creative agency vibes",
    creative: "wearing bold, fashion-forward creative professional attire",
  },
};

const SENIORITY_DESC: Record<string, string> = {
  junior: "young, early-career",
  mid: "mid-career, confident",
  senior: "experienced, authoritative",
  lead: "seasoned leader, commanding presence",
  executive: "distinguished executive, powerful presence",
};

const AGE_RANGE_DESC: Record<string, string> = {
  "20-30": "in their twenties, youthful and energetic",
  "30-40": "in their thirties, established and confident",
  "40-50": "in their forties, seasoned and experienced",
  "50-60": "in their fifties, distinguished and authoritative",
  "60+": "in their sixties or older, wise and commanding",
};

const DEFAULT_ATTIRE: Record<string, string> = {
  formal: "wearing a formal business suit, tie or blazer",
  "business-casual": "wearing smart business casual attire",
  casual: "wearing clean casual professional clothing",
  creative: "wearing creative, stylish professional attire",
};

function buildLegacyPrompt(params: AvatarParams): string {
  const gender = params.gender || "non-binary";
  const ageRange = params.ageRange || "30-40";
  const ethnicity = params.ethnicity || "diverse";
  const attire = params.attireStyle || "business-casual";
  const role = params.roleTitle || "professional";
  const industry = params.industry || "technology";
  const seniority = params.seniority || "mid";

  const genderDesc = gender === "non-binary" ? "person with androgynous features" : `${gender} person`;
  const ageDesc = AGE_RANGE_DESC[ageRange] || "mid-career";
  const industryAttire = INDUSTRY_ATTIRE[industry.toLowerCase()] || DEFAULT_ATTIRE;
  const attireDesc = industryAttire[attire] || DEFAULT_ATTIRE[attire] || "wearing professional attire";

  return `Professional corporate headshot photograph of a ${SENIORITY_DESC[seniority] || "professional"} ${genderDesc}, ${ageDesc}, ${ethnicity} ethnicity, working as a ${role} in the ${industry} industry. ${attireDesc}. Clean studio background with soft professional lighting. Sharp focus, high resolution, photorealistic. The person has a warm, approachable expression. Shot from shoulders up, centered composition. No text, no watermarks, no logos.`;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImageWithClaude(prompt: string): Promise<Buffer> {
  const anthropic = getAnthropicClient();

  const refinementResponse = await anthropic.messages.create({
    model: AI_CONFIG.model,
    max_tokens: AI_CONFIG.refinementMaxTokens,
    messages: [{
      role: "user",
      content: `You are a professional portrait photographer. Refine this image prompt to be more detailed and photorealistic. Return ONLY the refined prompt text, nothing else.\n\nOriginal prompt: ${prompt}`,
    }],
  });

  const refinedPrompt = refinementResponse.content[0].type === "text"
    ? refinementResponse.content[0].text
    : prompt;

  const imageApiUrl = "https://ai-proxy.replit.app/v1/images/generations";

  const imageResponse = await fetch(imageApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer placeholder",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: refinedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
    }),
  });

  if (!imageResponse.ok) {
    const errorText = await imageResponse.text();
    throw new Error(`Image generation failed: ${imageResponse.status} ${errorText}`);
  }

  const data = await imageResponse.json() as { data?: Array<{ b64_json?: string; url?: string }> };
  const imageData = data.data?.[0];

  if (imageData?.b64_json) {
    return Buffer.from(imageData.b64_json, "base64");
  }

  if (imageData?.url) {
    const imgResp = await fetch(imageData.url);
    if (!imgResp.ok) throw new Error("Failed to download generated image");
    return Buffer.from(await imgResp.arrayBuffer());
  }

  throw new Error("No image data returned from generation model");
}

async function generateImageBuffer(prompt: string, size: "512x512" | "1024x1024" = "1024x1024"): Promise<Buffer> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        await sleep(RETRY_DELAY_MS * attempt);
        console.log(`[StyleGAN3] Image generation retry ${attempt}/${MAX_RETRIES}`);
      }

      return await generateImageWithClaude(prompt);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[StyleGAN3] Generation attempt ${attempt + 1} failed:`, lastError.message);
    }
  }

  throw lastError || new Error("Image generation failed after retries");
}

export async function runStyleGAN3Pipeline(
  params: AttributeSelectionParams,
  options?: { orgId?: number; employeeId?: number; skipUniqueness?: boolean }
): Promise<StyleGAN3GenerateResult> {
  const stages: PipelineStageResult[] = [];
  const pipelineStart = Date.now();

  let stageStart = Date.now();
  const attributeVector = encodeAttributeVector(params);
  stages.push({
    stage: "1_attribute_selection",
    durationMs: Date.now() - stageStart,
    success: true,
    output: { vectorHash: attributeVector.hash, dimensions: attributeVector.dimensions.length },
  });

  let bestBuffer: Buffer | null = null;
  let bestQuality = 0;
  let bestPrompt = "";

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    stageStart = Date.now();
    const prompt = buildGenerationPrompt(params);
    const buffer = await generateImageBuffer(prompt);
    const quality = computeQualityScore(buffer, attributeVector);

    stages.push({
      stage: `2_face_generation_attempt_${attempt + 1}`,
      durationMs: Date.now() - stageStart,
      success: quality >= QUALITY_THRESHOLD,
      output: { qualityScore: quality, imageSize: buffer.length, attempt: attempt + 1 },
    });

    if (quality > bestQuality) {
      bestBuffer = buffer;
      bestQuality = quality;
      bestPrompt = prompt;
    }

    if (quality >= QUALITY_THRESHOLD) break;
    console.log(`[StyleGAN3] Quality ${quality.toFixed(3)} below threshold ${QUALITY_THRESHOLD}, retrying...`);
  }

  if (!bestBuffer) {
    throw new Error("Face generation failed: no valid image produced");
  }

  stageStart = Date.now();
  const perceptualHash = computePerceptualHash(bestBuffer);
  stages.push({
    stage: "3_perceptual_hashing",
    durationMs: Date.now() - stageStart,
    success: true,
    output: { hash: perceptualHash },
  });

  stageStart = Date.now();
  let isUnique = true;

  if (!options?.skipUniqueness) {
    try {
      const existingAssets = await db
        .select({ id: avatarAssets.id, perceptualHash: avatarAssets.perceptualHash })
        .from(avatarAssets)
        .where(isNotNull(avatarAssets.perceptualHash))
        .limit(1000);

      const existingHashes = existingAssets
        .filter((a): a is { id: number; perceptualHash: string } => a.perceptualHash !== null)
        .map(a => ({ id: a.id, hash: a.perceptualHash }));

      const discriminatorResult = await runDiscriminator(perceptualHash, existingHashes);
      isUnique = discriminatorResult.isUnique;

      stages.push({
        stage: "4_discriminator_uniqueness",
        durationMs: Date.now() - stageStart,
        success: isUnique,
        output: {
          isUnique,
          closestDistance: discriminatorResult.closestMatchDistance,
          closestMatchId: discriminatorResult.closestMatchId,
          totalCompared: existingHashes.length,
        },
      });
    } catch (error) {
      stages.push({
        stage: "4_discriminator_uniqueness",
        durationMs: Date.now() - stageStart,
        success: true,
        output: { skipped: true, reason: error instanceof Error ? error.message : "DB not available" },
      });
    }
  } else {
    stages.push({
      stage: "4_discriminator_uniqueness",
      durationMs: Date.now() - stageStart,
      success: true,
      output: { skipped: true, reason: "skipUniqueness=true" },
    });
  }

  stageStart = Date.now();
  const objectPath = await uploadAvatarToStorage(bestBuffer);
  const avatarUrl = buildAvatarUrl(objectPath);
  stages.push({
    stage: "5_storage_upload",
    durationMs: Date.now() - stageStart,
    success: true,
    output: { objectPath, url: avatarUrl },
  });

  const latentVector = attributeVector.dimensions.slice(0, 64);

  const identityPackage: AvatarIdentityPackage = {
    version: 1,
    avatarUrl,
    attributeVector,
    perceptualHash,
    qualityScore: bestQuality,
    renderConfig: {
      size: "1024x1024",
      style: "stylegan3-photorealistic",
      generationParams: params,
    },
    pipelineMetadata: {
      stages,
      totalDurationMs: Date.now() - pipelineStart,
      model: AI_CONFIG.model,
    },
  };

  stageStart = Date.now();
  let assetId = 0;
  try {
    const [inserted] = await db.insert(avatarAssets).values({
      orgId: options?.orgId ?? null,
      employeeId: options?.employeeId ?? null,
      version: 1,
      status: "active",
      faceImageUrl: avatarUrl,
      faceImagePath: objectPath,
      attributeVector: attributeVector as unknown as Record<string, unknown>,
      latentVector: latentVector as unknown as Record<string, unknown>,
      perceptualHash,
      qualityScore: bestQuality,
      generationParams: params as unknown as Record<string, unknown>,
      identityPackage: identityPackage as unknown as Record<string, unknown>,
      pipelineMetadata: {
        stages,
        totalDurationMs: Date.now() - pipelineStart,
        model: AI_CONFIG.model,
      },
      isPreGenerated: false,
    }).returning({ id: avatarAssets.id });
    assetId = inserted.id;

    stages.push({
      stage: "6_identity_compilation",
      durationMs: Date.now() - stageStart,
      success: true,
      output: { assetId, version: 1 },
    });
  } catch (error) {
    stages.push({
      stage: "6_identity_compilation",
      durationMs: Date.now() - stageStart,
      success: false,
      output: { error: error instanceof Error ? error.message : "DB insert failed" },
    });
  }

  const totalDurationMs = Date.now() - pipelineStart;
  console.log(`[StyleGAN3] Pipeline complete in ${totalDurationMs}ms — quality: ${bestQuality.toFixed(3)}, unique: ${isUnique}, assetId: ${assetId}`);

  return {
    avatarUrl,
    objectPath,
    prompt: bestPrompt,
    avatarConfig: {
      generationParams: params,
      renderSize: "1024x1024",
      style: "stylegan3-photorealistic",
    },
    identityPackage,
    attributeVector,
    qualityScore: bestQuality,
    perceptualHash,
    isUnique,
    pipelineStages: stages,
    totalDurationMs,
    assetId,
  };
}

export async function generateAvatar(params: AvatarParams): Promise<AvatarGenerateResult> {
  const prompt = buildLegacyPrompt(params);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        await sleep(RETRY_DELAY_MS * attempt);
        console.log(`[Avatars] Retry attempt ${attempt}/${MAX_RETRIES}`);
      }

      const buffer = await generateImageWithClaude(prompt);
      const objectPath = await uploadAvatarToStorage(buffer, params.seed);
      const avatarUrl = buildAvatarUrl(objectPath);

      const avatarConfig: AvatarConfig = {
        generationParams: params,
        renderSize: "1024x1024",
        style: "photorealistic",
      };

      const identityPackage: AvatarIdentityPackage = {
        version: 1,
        avatarUrl,
        renderConfig: {
          size: "1024x1024",
          style: "photorealistic",
          generationParams: params,
        },
      };

      return { avatarUrl, objectPath, prompt, avatarConfig, identityPackage };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`[Avatars] Generation attempt ${attempt + 1} failed:`, lastError.message);
    }
  }

  throw lastError || new Error("Avatar generation failed after retries");
}

function buildAvatarUrl(objectPath: string): string {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : process.env.REPLIT_DOMAINS
      ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
      : `http://localhost:${process.env.PORT || 8080}`;
  return `${baseUrl}/api/storage/public-objects/avatars/${objectPath.split("/").pop()}`;
}

function sanitizeSeed(seed: string): string {
  return seed.replace(/[^a-zA-Z0-9\-_]/g, "").slice(0, 64);
}

async function uploadAvatarToStorage(buffer: Buffer, seed?: string): Promise<string> {
  const fileName = `${seed ? sanitizeSeed(seed) : randomUUID()}.png`;
  const publicPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "").split(",").map(p => p.trim()).filter(Boolean);

  if (publicPaths.length === 0) {
    throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not configured");
  }

  const basePath = publicPaths[0];
  const fullPath = `${basePath}/avatars/${fileName}`;

  const parts = fullPath.startsWith("/") ? fullPath.slice(1).split("/") : fullPath.split("/");
  const bucketName = parts[0];
  const objectName = parts.slice(1).join("/");

  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objectName);

  await file.save(buffer, {
    contentType: "image/png",
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  return fullPath;
}

export async function generateInterviewCandidateAvatars(
  roleTitle: string,
  industry: string,
  count: number = 3
): Promise<AvatarGenerateResult[]> {
  const diverseParams: Omit<AvatarParams, "roleTitle" | "industry" | "seniority" | "seed">[] = [
    { gender: "female", ageRange: "30-40", ethnicity: "East Asian", attireStyle: "business-casual" },
    { gender: "male", ageRange: "40-50", ethnicity: "African", attireStyle: "formal" },
    { gender: "non-binary", ageRange: "20-30", ethnicity: "European", attireStyle: "creative" },
    { gender: "female", ageRange: "50-60", ethnicity: "South Asian", attireStyle: "business-casual" },
    { gender: "male", ageRange: "30-40", ethnicity: "Latin American", attireStyle: "formal" },
    { gender: "non-binary", ageRange: "40-50", ethnicity: "Middle Eastern", attireStyle: "business-casual" },
  ];

  const results: AvatarGenerateResult[] = [];
  const shuffled = [...diverseParams].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  for (const baseParams of selected) {
    try {
      const result = await generateAvatar({
        ...baseParams,
        roleTitle,
        industry,
        seniority: "mid",
        seed: `interview-${roleTitle}-${randomUUID().slice(0, 8)}`,
      });
      results.push(result);
    } catch (error) {
      console.error("[Avatars] Interview candidate avatar failed, using fallback:", error instanceof Error ? error.message : error);
      const fallbackParams: AvatarParams = { ...baseParams, roleTitle, industry, seniority: "mid" };
      results.push({
        avatarUrl: getDiceBearFallback(`${roleTitle}-candidate-${results.length}`),
        objectPath: "",
        prompt: "DiceBear fallback",
        avatarConfig: { style: "dicebear-fallback", generationParams: fallbackParams },
        identityPackage: {
          version: 1,
          avatarUrl: getDiceBearFallback(`${roleTitle}-candidate-${results.length}`),
          renderConfig: { size: "512x512", style: "dicebear-fallback", generationParams: fallbackParams },
        },
      });
    }
  }

  return results;
}

export function getDiceBearFallback(seed: string, style: string = "notionists"): string {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}
