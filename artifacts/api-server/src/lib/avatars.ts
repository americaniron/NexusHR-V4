import OpenAI from "openai";
import { randomUUID } from "crypto";
import { objectStorageClient } from "./objectStorage";

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
  avatarUrl: string;
  voiceId?: string;
  renderConfig: {
    size: string;
    style: string;
    generationParams: AvatarParams;
  };
}

export interface AvatarConfig {
  generationParams?: AvatarParams;
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

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://ai-proxy.replit.app/v1",
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "placeholder",
    });
  }
  return _openai;
}

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

function buildPrompt(params: AvatarParams): string {
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

export async function generateAvatar(params: AvatarParams): Promise<AvatarGenerateResult> {
  const openai = getOpenAI();
  const prompt = buildPrompt(params);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        await sleep(RETRY_DELAY_MS * attempt);
        console.log(`[Avatars] Retry attempt ${attempt}/${MAX_RETRIES}`);
      }

      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "512x512",
        quality: "medium",
      });

      const imageData = response.data?.[0];
      if (!imageData?.b64_json) {
        throw new Error("No image data returned from OpenAI");
      }

      const buffer = Buffer.from(imageData.b64_json, "base64");
      const objectPath = await uploadAvatarToStorage(buffer, params.seed);

      const baseUrl = process.env.REPLIT_DEV_DOMAIN
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : process.env.REPLIT_DOMAINS
          ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
          : `http://localhost:${process.env.PORT || 8080}`;
      const avatarUrl = `${baseUrl}/api/storage/public-objects/avatars/${objectPath.split("/").pop()}`;

      const avatarConfig: AvatarConfig = {
        generationParams: params,
        renderSize: "512x512",
        style: "photorealistic",
      };

      const identityPackage: AvatarIdentityPackage = {
        avatarUrl,
        renderConfig: {
          size: "512x512",
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
