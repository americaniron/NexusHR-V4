export type PlanId = "trial" | "starter" | "growth" | "business" | "enterprise";
export type BillingDimension =
  | "ai_employees"
  | "voice_hours"
  | "messages"
  | "workflows"
  | "tasks"
  | "integrations"
  | "storage_gb"
  | "ai_memory_gb"
  | "avatars"
  | "users";

export interface PlanAllocation {
  ai_employees: number;
  voice_hours: number;
  messages: number;
  workflows: number;
  tasks: number;
  integrations: number;
  storage_gb: number;
  ai_memory_gb: number;
  avatars: number;
  users: number;
}

export interface OverageRate {
  ai_employees: number;
  voice_hours: number;
  messages: number;
  workflows: number;
  tasks: number;
  integrations: number;
  storage_gb: number;
  ai_memory_gb: number;
  avatars: number;
  users: number;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  monthly: number;
  annual: number;
  allocations: PlanAllocation;
  overageRates: OverageRate;
  features: string[];
  sla: string;
  supportLevel: string;
}

const UNLIMITED = 999_999;

export const PLAN_DEFINITIONS: Record<PlanId, PlanDefinition> = {
  trial: {
    id: "trial",
    name: "Free Trial",
    description: "14-day trial with Growth-tier features — no credit card required",
    monthly: 0,
    annual: 0,
    allocations: {
      ai_employees: 10,
      voice_hours: 200,
      messages: 25_000,
      workflows: 50,
      tasks: 15_000,
      integrations: 7,
      storage_gb: 50,
      ai_memory_gb: 25,
      avatars: 10,
      users: 10,
    },
    overageRates: {
      ai_employees: 0, voice_hours: 0, messages: 0, workflows: 0, tasks: 0,
      integrations: 0, storage_gb: 0, ai_memory_gb: 0, avatars: 0, users: 0,
    },
    features: ["Growth-tier AI professionals", "Premium voices", "Priority email support", "Advanced analytics", "All usage metered, not billed"],
    sla: "24hr",
    supportLevel: "premium_email",
  },

  starter: {
    id: "starter",
    name: "Starter",
    description: "Perfect for small teams getting started with AI employees",
    monthly: 299,
    annual: 249,
    allocations: {
      ai_employees: 2,
      voice_hours: 40,
      messages: 5_000,
      workflows: 10,
      tasks: 2_000,
      integrations: 3,
      storage_gb: 10,
      ai_memory_gb: 5,
      avatars: 2,
      users: 3,
    },
    overageRates: {
      ai_employees: 149, voice_hours: 2.50, messages: 0.008, workflows: 15,
      tasks: 0.05, integrations: 49, storage_gb: 2, ai_memory_gb: 3, avatars: 25, users: 29,
    },
    features: ["Basic AI employees", "Standard voices", "Email support", "48hr SLA"],
    sla: "48hr",
    supportLevel: "email",
  },

  growth: {
    id: "growth",
    name: "Growth",
    description: "Scale your AI workforce with more capacity and integrations",
    monthly: 799,
    annual: 649,
    allocations: {
      ai_employees: 10,
      voice_hours: 200,
      messages: 25_000,
      workflows: 50,
      tasks: 15_000,
      integrations: 7,
      storage_gb: 50,
      ai_memory_gb: 25,
      avatars: 10,
      users: 10,
    },
    overageRates: {
      ai_employees: 99, voice_hours: 1.80, messages: 0.005, workflows: 10,
      tasks: 0.03, integrations: 39, storage_gb: 1.50, ai_memory_gb: 2, avatars: 20, users: 25,
    },
    features: [
      "Premium voices", "Bidirectional integrations", "Priority email support",
      "24hr SLA", "Advanced analytics",
    ],
    sla: "24hr",
    supportLevel: "premium_email",
  },

  business: {
    id: "business",
    name: "Business",
    description: "Enterprise-grade features for larger organizations",
    monthly: 1_999,
    annual: 1_599,
    allocations: {
      ai_employees: 50,
      voice_hours: 1_000,
      messages: UNLIMITED,
      workflows: 200,
      tasks: 100_000,
      integrations: UNLIMITED,
      storage_gb: 500,
      ai_memory_gb: 100,
      avatars: 50,
      users: 50,
    },
    overageRates: {
      ai_employees: 79, voice_hours: 1.20, messages: 0, workflows: 8,
      tasks: 0.02, integrations: 0, storage_gb: 1, ai_memory_gb: 1.50, avatars: 15, users: 20,
    },
    features: [
      "Orchestration", "Conditional workflows", "API access", "Phone support",
      "4hr SLA", "Unlimited messages", "Unlimited integrations",
    ],
    sla: "4hr",
    supportLevel: "phone",
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom pricing with unlimited resources and dedicated support",
    monthly: 0,
    annual: 0,
    allocations: {
      ai_employees: UNLIMITED,
      voice_hours: UNLIMITED,
      messages: UNLIMITED,
      workflows: UNLIMITED,
      tasks: UNLIMITED,
      integrations: UNLIMITED,
      storage_gb: UNLIMITED,
      ai_memory_gb: UNLIMITED,
      avatars: UNLIMITED,
      users: UNLIMITED,
    },
    overageRates: {
      ai_employees: 0, voice_hours: 0, messages: 0, workflows: 0, tasks: 0,
      integrations: 0, storage_gb: 0, ai_memory_gb: 0, avatars: 0, users: 0,
    },
    features: [
      "Custom voice cloning", "White-label", "Dedicated support", "Custom SLA",
      "Unlimited everything", "On-premise option", "SSO/SAML",
    ],
    sla: "custom",
    supportLevel: "dedicated",
  },
};

export const REVENUE_STREAMS = [
  "subscription_fees",
  "overage_charges",
  "voice_video_minutes",
  "task_execution",
  "addon_modules",
  "professional_services",
] as const;

export type RevenueStream = (typeof REVENUE_STREAMS)[number];

export function getZeroAllocations(): PlanAllocation {
  return {
    ai_employees: 0, voice_hours: 0, messages: 0, workflows: 0, tasks: 0,
    integrations: 0, storage_gb: 0, ai_memory_gb: 0, avatars: 0, users: 0,
  };
}

export function getPlanLimits(planId: string): PlanAllocation {
  const plan = PLAN_DEFINITIONS[planId as PlanId];
  return plan?.allocations ?? PLAN_DEFINITIONS.trial.allocations;
}

export function getPlanOverageRates(planId: string): OverageRate {
  const plan = PLAN_DEFINITIONS[planId as PlanId];
  return plan?.overageRates ?? PLAN_DEFINITIONS.trial.overageRates;
}

export function isUnlimited(value: number): boolean {
  return value >= UNLIMITED;
}

export const ALERT_THRESHOLD_PERCENT = 80;

export const DUNNING_CONFIG = {
  retryScheduleDays: [1, 3, 7, 14],
  gracePeriodDays: 7,
  maxRetries: 4,
};

export const TRIAL_DURATION_DAYS = 14;
export const TRIAL_DATA_RETENTION_DAYS = 30;
