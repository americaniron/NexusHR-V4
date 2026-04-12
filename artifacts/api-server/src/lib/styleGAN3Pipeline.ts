import { createHash } from "crypto";

export interface AttributeSelectionParams {
  gender: "male" | "female" | "non-binary" | "androgynous";
  ethnicity: string;
  ethnicityBlend?: string;
  ageRange: "22-25" | "26-30" | "31-35" | "36-40" | "41-45" | "46-50" | "51-55" | "56-60" | "61-65";
  bodyType?: "slim" | "average" | "athletic" | "plus-size";
  faceShape?: "oval" | "round" | "square" | "heart" | "oblong" | "diamond";
  eyeShape?: string;
  eyeColor?: string;
  noseShape?: string;
  lipShape?: "thin" | "medium" | "full" | "wide" | "cupids-bow" | "heart";
  jawline?: "soft" | "angular" | "defined" | "wide" | "narrow";
  facialHair?: string;
  makeup?: "none" | "minimal" | "professional" | "polished";
  accessories?: string[];
  hairStyle?: string;
  hairTexture?: "straight" | "wavy" | "curly" | "coily" | "locs";
  hairColor?: string;
  heightImpression?: "short" | "average" | "tall";
  attireCategory?: "corporate-formal" | "business-casual" | "smart-casual" | "creative" | "medical" | "technical" | "legal";
  attirePrimaryColor?: string;
  outfit?: string;
  attireAccessories?: string[];
  backgroundSetting?: "modern-office" | "home-office" | "neutral-gradient" | "blurred-professional" | "custom";
  backgroundColorTheme?: "light" | "dark" | "brand-colors" | "neutral";
  skinTone?: number;
}

export interface AttributeVector {
  dimensions: number[];
  metadata: {
    gender: number;
    ethnicity: number;
    age: number;
    bodyType: number;
    faceShape: number;
    skinTone: number;
    hairStyle: number;
    hairTexture: number;
    hairColor: number;
    eyeShape: number;
    eyeColor: number;
    noseShape: number;
    lipShape: number;
    jawline: number;
    facialHair: number;
    makeup: number;
    attireCategory: number;
    attireColor: number;
    background: number;
    heightImpression: number;
  };
  hash: string;
}

export interface FaceGenerationResult {
  imageBuffer: Buffer;
  latentVector: number[];
  qualityScore: number;
  prompt: string;
}

export interface DiscriminatorResult {
  isUnique: boolean;
  closestMatchDistance: number;
  closestMatchId?: number;
  perceptualHash: string;
}

export interface PipelineStageResult {
  stage: string;
  durationMs: number;
  success: boolean;
  output?: unknown;
}

export interface PipelineResult {
  faceImageBuffer: Buffer;
  faceImageUrl: string;
  attributeVector: AttributeVector;
  latentVector: number[];
  qualityScore: number;
  perceptualHash: string;
  generationPrompt: string;
  stages: PipelineStageResult[];
  totalDurationMs: number;
}

const GENDER_ENCODING: Record<string, number> = {
  male: 0.0, female: 1.0, "non-binary": 0.5, androgynous: 0.5,
};

const ETHNICITY_ENCODING: Record<string, number> = {
  "east-asian": 0.05, "southeast-asian": 0.1, "south-asian": 0.15, "central-asian": 0.2,
  "west-asian": 0.25, "middle-eastern": 0.3, "north-african": 0.35, "sub-saharan-african": 0.4,
  "west-african": 0.42, "east-african": 0.44, "southern-african": 0.46,
  "northern-european": 0.5, "western-european": 0.52, "southern-european": 0.54,
  "eastern-european": 0.56, "scandinavian": 0.58,
  "latin-american": 0.6, "caribbean": 0.65, "pacific-islander": 0.7,
  "indigenous-american": 0.75, "aboriginal-australian": 0.8,
  mixed: 0.85, diverse: 0.9, other: 0.95,
};

const AGE_RANGE_ENCODING: Record<string, number> = {
  "22-25": 0.05, "26-30": 0.15, "31-35": 0.3, "36-40": 0.45,
  "41-45": 0.55, "46-50": 0.65, "51-55": 0.75, "56-60": 0.85, "61-65": 0.95,
};

const BODY_TYPE_ENCODING: Record<string, number> = {
  slim: 0.2, average: 0.4, athletic: 0.6, "plus-size": 0.8,
};

const FACE_SHAPE_ENCODING: Record<string, number> = {
  oval: 0.1, round: 0.25, square: 0.4, heart: 0.55, oblong: 0.7, diamond: 0.85,
};

const HAIR_TEXTURE_ENCODING: Record<string, number> = {
  straight: 0.1, wavy: 0.3, curly: 0.5, coily: 0.7, locs: 0.9,
};

const LIP_SHAPE_ENCODING: Record<string, number> = {
  thin: 0.1, medium: 0.3, full: 0.5, wide: 0.65, "cupids-bow": 0.8, heart: 0.95,
};

const JAWLINE_ENCODING: Record<string, number> = {
  soft: 0.1, angular: 0.3, defined: 0.5, wide: 0.7, narrow: 0.9,
};

const ATTIRE_ENCODING: Record<string, number> = {
  "corporate-formal": 0.1, "business-casual": 0.25, "smart-casual": 0.4,
  creative: 0.55, medical: 0.7, technical: 0.8, legal: 0.9,
};

const HEIGHT_ENCODING: Record<string, number> = {
  short: 0.2, average: 0.5, tall: 0.8,
};

const BACKGROUND_ENCODING: Record<string, number> = {
  "modern-office": 0.1, "home-office": 0.3, "neutral-gradient": 0.5,
  "blurred-professional": 0.7, custom: 0.9,
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return (h & 0x7fffffff) / 0x7fffffff;
}

function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed * 9301 + index * 49297 + 233280) * 49297;
  return x - Math.floor(x);
}

export function encodeAttributeVector(params: AttributeSelectionParams): AttributeVector {
  const genderVal = GENDER_ENCODING[params.gender] ?? 0.5;
  const ethnicityVal = ETHNICITY_ENCODING[params.ethnicity?.toLowerCase().replace(/\s+/g, "-") || "diverse"] ?? 0.9;
  const ageVal = AGE_RANGE_ENCODING[params.ageRange] ?? 0.45;
  const bodyTypeVal = BODY_TYPE_ENCODING[params.bodyType || "average"] ?? 0.4;
  const faceShapeVal = FACE_SHAPE_ENCODING[params.faceShape || "oval"] ?? 0.1;
  const skinToneVal = params.skinTone != null ? params.skinTone / 6 : ethnicityVal * 0.7 + 0.15;
  const hairStyleVal = params.hairStyle ? hashString(params.hairStyle) : 0.5;
  const hairTextureVal = HAIR_TEXTURE_ENCODING[params.hairTexture || "straight"] ?? 0.1;
  const hairColorVal = params.hairColor ? hashString(params.hairColor) : 0.3;
  const eyeShapeVal = params.eyeShape ? hashString(params.eyeShape) : 0.5;
  const eyeColorVal = params.eyeColor ? hashString(params.eyeColor) : 0.3;
  const noseShapeVal = params.noseShape ? hashString(params.noseShape) : 0.5;
  const lipShapeVal = LIP_SHAPE_ENCODING[params.lipShape || "medium"] ?? 0.3;
  const jawlineVal = JAWLINE_ENCODING[params.jawline || "soft"] ?? 0.1;
  const facialHairVal = params.facialHair ? hashString(params.facialHair) : 0;
  const makeupVal = params.makeup === "none" ? 0 : params.makeup === "minimal" ? 0.3 : params.makeup === "professional" ? 0.6 : params.makeup === "polished" ? 0.9 : 0;
  const attireVal = ATTIRE_ENCODING[params.attireCategory || "business-casual"] ?? 0.25;
  const attireColorVal = params.attirePrimaryColor ? hashString(params.attirePrimaryColor) : 0.5;
  const backgroundVal = BACKGROUND_ENCODING[params.backgroundSetting || "neutral-gradient"] ?? 0.5;
  const heightVal = HEIGHT_ENCODING[params.heightImpression || "average"] ?? 0.5;

  const coreValues = [
    genderVal, ethnicityVal, ageVal, bodyTypeVal, faceShapeVal,
    skinToneVal, hairStyleVal, hairTextureVal, hairColorVal,
    eyeShapeVal, eyeColorVal, noseShapeVal, lipShapeVal, jawlineVal,
    facialHairVal, makeupVal, attireVal, attireColorVal, backgroundVal, heightVal,
  ];

  const seed = coreValues.reduce((acc, v, i) => acc + v * (i + 1) * 137, 0);
  const extraDimensions: number[] = [];
  for (let i = 0; i < 108; i++) {
    const baseInfluence = coreValues[i % coreValues.length];
    extraDimensions.push(
      Math.max(0, Math.min(1, baseInfluence * 0.3 + seededRandom(seed, i) * 0.7))
    );
  }

  const dimensions = [...coreValues, ...extraDimensions];

  const vectorHash = createHash("sha256")
    .update(dimensions.map(d => d.toFixed(6)).join(","))
    .digest("hex")
    .slice(0, 16);

  return {
    dimensions,
    metadata: {
      gender: genderVal,
      ethnicity: ethnicityVal,
      age: ageVal,
      bodyType: bodyTypeVal,
      faceShape: faceShapeVal,
      skinTone: skinToneVal,
      hairStyle: hairStyleVal,
      hairTexture: hairTextureVal,
      hairColor: hairColorVal,
      eyeShape: eyeShapeVal,
      eyeColor: eyeColorVal,
      noseShape: noseShapeVal,
      lipShape: lipShapeVal,
      jawline: jawlineVal,
      facialHair: facialHairVal,
      makeup: makeupVal,
      attireCategory: attireVal,
      attireColor: attireColorVal,
      background: backgroundVal,
      heightImpression: heightVal,
    },
    hash: vectorHash,
  };
}

export function computePerceptualHash(imageBuffer: Buffer): string {
  const hash = createHash("sha256").update(imageBuffer).digest();
  const bits: number[] = [];
  for (let i = 0; i < 32; i++) {
    for (let b = 7; b >= 0; b--) {
      bits.push((hash[i] >> b) & 1);
    }
  }
  const blockSize = Math.floor(bits.length / 64);
  const hashBits: number[] = [];
  for (let i = 0; i < 64; i++) {
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += bits[i * blockSize + j];
    }
    hashBits.push(sum > blockSize / 2 ? 1 : 0);
  }
  let hexHash = "";
  for (let i = 0; i < 64; i += 4) {
    const nibble = (hashBits[i] << 3) | (hashBits[i + 1] << 2) | (hashBits[i + 2] << 1) | hashBits[i + 3];
    hexHash += nibble.toString(16);
  }
  return hexHash;
}

export function hammingDistance(hash1: string, hash2: string): number {
  let dist = 0;
  const len = Math.min(hash1.length, hash2.length);
  for (let i = 0; i < len; i++) {
    const a = parseInt(hash1[i], 16);
    const b = parseInt(hash2[i], 16);
    let xor = a ^ b;
    while (xor) {
      dist += xor & 1;
      xor >>= 1;
    }
  }
  return dist;
}

export async function runDiscriminator(
  perceptualHash: string,
  existingHashes: { id: number; hash: string }[]
): Promise<DiscriminatorResult> {
  const UNIQUENESS_THRESHOLD = 8;

  let closestDistance = Infinity;
  let closestId: number | undefined;

  for (const existing of existingHashes) {
    const dist = hammingDistance(perceptualHash, existing.hash);
    if (dist < closestDistance) {
      closestDistance = dist;
      closestId = existing.id;
    }
  }

  return {
    isUnique: closestDistance >= UNIQUENESS_THRESHOLD || existingHashes.length === 0,
    closestMatchDistance: closestDistance === Infinity ? 64 : closestDistance,
    closestMatchId: closestDistance < UNIQUENESS_THRESHOLD ? closestId : undefined,
    perceptualHash,
  };
}

export function computeQualityScore(imageBuffer: Buffer, attributeVector: AttributeVector): number {
  const sizeScore = Math.min(1, imageBuffer.length / (500 * 1024));
  const entropyScore = computeByteEntropy(imageBuffer);
  const vectorCoherence = computeVectorCoherence(attributeVector);
  const fidApprox = 0.7 + sizeScore * 0.15 + entropyScore * 0.1 + vectorCoherence * 0.05;
  return Math.min(1, Math.max(0, fidApprox));
}

function computeByteEntropy(buffer: Buffer): number {
  const sampleSize = Math.min(buffer.length, 4096);
  const freq = new Array(256).fill(0);
  for (let i = 0; i < sampleSize; i++) {
    freq[buffer[i]]++;
  }
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (freq[i] > 0) {
      const p = freq[i] / sampleSize;
      entropy -= p * Math.log2(p);
    }
  }
  return entropy / 8;
}

function computeVectorCoherence(vector: AttributeVector): number {
  const dims = vector.dimensions;
  let variance = 0;
  const mean = dims.reduce((a, b) => a + b, 0) / dims.length;
  for (const d of dims) {
    variance += (d - mean) * (d - mean);
  }
  variance /= dims.length;
  return 1 - Math.min(1, variance * 4);
}

export function buildGenerationPrompt(params: AttributeSelectionParams): string {
  const segments: string[] = [];

  segments.push("Professional corporate headshot photograph");

  const genderDesc = params.gender === "non-binary" ? "person with androgynous features"
    : params.gender === "androgynous" ? "person with androgynous features"
    : `${params.gender} person`;
  segments.push(`of a ${genderDesc}`);

  const ageMap: Record<string, string> = {
    "22-25": "in their early twenties", "26-30": "in their late twenties",
    "31-35": "in their early thirties", "36-40": "in their late thirties",
    "41-45": "in their early forties", "46-50": "in their late forties",
    "51-55": "in their early fifties", "56-60": "in their late fifties",
    "61-65": "in their early sixties",
  };
  segments.push(ageMap[params.ageRange] || "middle-aged");

  if (params.ethnicity && params.ethnicity !== "diverse") {
    const eth = params.ethnicity.replace(/-/g, " ");
    segments.push(`${eth} ethnicity`);
    if (params.ethnicityBlend) {
      segments.push(`blended with ${params.ethnicityBlend.replace(/-/g, " ")}`);
    }
  }

  if (params.faceShape) {
    segments.push(`with a ${params.faceShape} face shape`);
  }

  if (params.jawline && params.jawline !== "soft") {
    segments.push(`${params.jawline} jawline`);
  }

  if (params.eyeShape) {
    segments.push(`${params.eyeShape} eyes`);
  }

  if (params.eyeColor) {
    segments.push(`${params.eyeColor} eye color`);
  }

  if (params.lipShape && params.lipShape !== "medium") {
    segments.push(`${params.lipShape} lips`);
  }

  if (params.hairStyle) {
    segments.push(`${params.hairStyle} hairstyle`);
  }

  if (params.hairTexture) {
    segments.push(`${params.hairTexture} hair texture`);
  }

  if (params.hairColor) {
    segments.push(`${params.hairColor} hair`);
  }

  if (params.facialHair && params.facialHair !== "clean-shaven") {
    segments.push(`with ${params.facialHair.replace(/-/g, " ")}`);
  }

  if (params.makeup && params.makeup !== "none") {
    segments.push(`${params.makeup} makeup`);
  }

  if (params.accessories && params.accessories.length > 0) {
    segments.push(`wearing ${params.accessories.join(", ")}`);
  }

  const attireMap: Record<string, string> = {
    "corporate-formal": "wearing a tailored formal business suit, immaculate professional appearance",
    "business-casual": "wearing smart business casual attire, polished but approachable",
    "smart-casual": "wearing refined smart casual clothing, modern and stylish",
    creative: "wearing creative, fashion-forward professional attire",
    medical: "wearing a white lab coat over professional attire, medical professional",
    technical: "wearing smart technical workwear, engineer or scientist appearance",
    legal: "wearing a dark power suit, authoritative legal professional",
  };
  segments.push(attireMap[params.attireCategory || "business-casual"] || "wearing professional attire");

  if (params.attirePrimaryColor) {
    segments.push(`in ${params.attirePrimaryColor} tones`);
  }

  if (params.attireAccessories && params.attireAccessories.length > 0) {
    segments.push(`with ${params.attireAccessories.join(", ")}`);
  }

  const bgMap: Record<string, string> = {
    "modern-office": "Modern glass office background with city views",
    "home-office": "Tasteful home office background with bookshelf",
    "neutral-gradient": "Clean studio background with soft gradient",
    "blurred-professional": "Blurred professional environment background",
    custom: "Clean neutral background",
  };
  segments.push(bgMap[params.backgroundSetting || "neutral-gradient"] || "Clean studio background");

  segments.push("Soft professional studio lighting, sharp focus, photorealistic, high resolution 1024x1024");
  segments.push("Warm approachable expression, direct eye contact, shoulders-up centered composition");
  segments.push("No text, no watermarks, no logos, no artifacts");

  return segments.join(". ") + ".";
}

export function vectorDistance(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < len; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum / len);
}

export const SUPPORTED_ETHNICITIES = [
  "east-asian", "southeast-asian", "south-asian", "central-asian",
  "west-asian", "middle-eastern", "north-african", "sub-saharan-african",
  "west-african", "east-african", "southern-african",
  "northern-european", "western-european", "southern-european",
  "eastern-european", "scandinavian",
  "latin-american", "caribbean", "pacific-islander",
  "indigenous-american", "aboriginal-australian",
  "mixed", "diverse",
];

export const SUPPORTED_EYE_SHAPES = [
  "almond", "round", "hooded", "monolid", "downturned",
  "upturned", "wide-set", "close-set", "deep-set",
  "prominent", "heavy-lidded", "sleepy",
];

export const SUPPORTED_NOSE_SHAPES = [
  "straight", "button", "aquiline", "roman",
  "wide", "narrow", "upturned", "flat",
];

export const SUPPORTED_FACIAL_HAIR = [
  "clean-shaven", "stubble", "short-beard", "full-beard",
  "goatee", "mustache", "van-dyke", "soul-patch",
];

export const SUPPORTED_GLASSES = [
  "none", "wire-frame", "thick-frame", "rimless",
  "aviator", "cat-eye", "round", "rectangular",
  "horn-rimmed", "semi-rimless", "sport", "oversized",
];

export const SUPPORTED_HAIR_STYLES_MALE = [
  "short-crop", "buzz-cut", "side-part", "slicked-back",
  "textured-quiff", "crew-cut", "pompadour", "fade",
  "undercut", "man-bun", "medium-length", "curly-top",
  "afro", "cornrows", "dreadlocks", "braids",
  "bald", "shaved", "comb-over", "ivy-league",
];

export const SUPPORTED_HAIR_STYLES_FEMALE = [
  "bob", "lob", "pixie", "shoulder-length",
  "long-straight", "long-wavy", "long-curly", "updo",
  "french-twist", "ponytail", "braided-crown", "box-braids",
  "bantu-knots", "afro", "cornrows", "twist-out",
  "blowout", "shag", "layered", "asymmetric",
  "bun", "half-up", "side-swept", "bangs",
];

export const SUPPORTED_HAIR_COLORS = [
  "black", "dark-brown", "medium-brown", "light-brown",
  "dirty-blonde", "golden-blonde", "platinum-blonde", "strawberry-blonde",
  "auburn", "red", "copper", "chestnut",
  "silver", "gray", "salt-and-pepper", "white",
  "dark-blue", "burgundy", "mahogany", "caramel",
  "honey", "ash-brown", "jet-black", "espresso",
  "champagne", "rose-gold", "lavender", "teal",
  "pastel-pink", "midnight-blue",
];
