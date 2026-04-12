# NexsusHR — Autonomous AI Company OS

## Overview

NexsusHR is a production-grade AI workforce management platform. Businesses hire, deploy, and manage fully autonomous AI "Beings" across 20+ industries. Built as a pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TailwindCSS v4 + shadcn/ui components
- **API framework**: Express 5 with Clerk middleware
- **Database**: PostgreSQL + Drizzle ORM (12 schema modules)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- **Auth**: Clerk (ClerkProvider + requireAuth middleware)
- **AI (Primary)**: Anthropic Claude (Opus 4.6 + Sonnet 4.6) via Replit AI Integrations proxy
- **AI (Fallback)**: OpenAI GPT-4o via Replit AI Integrations proxy
- **Voice**: ElevenLabs (via Replit integration connector)
- **Build**: esbuild (CJS bundle for API server), Vite for frontend

## Artifacts

- **nexus-hr** (`artifacts/nexus-hr`): React/Vite frontend at path `/`, port from `PORT` env var (24925)
- **api-server** (`artifacts/api-server`): Express API at port 8080, all routes under `/api`
- **mockup-sandbox** (`artifacts/mockup-sandbox`): Design prototyping server

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema (12 modules)

- `organizations` — multi-tenant orgs with Clerk org ID
- `users` — users linked to Clerk user IDs
- `ai-employee-roles` — 105+ AI role catalog (title, department, category, industry, price, personality)
- `ai-employees` — hired AI employees linked to roles and orgs
- `interviews` — interview sessions, candidates (3 per session), and messages
- `tasks` — task management with status, priority, assignee
- `workflows` — multi-step workflow automation with steps
- `conversations` — real-time chat between users and AI employees
- `integrations` — tool registry (20 tools: Google Workspace, Slack, HubSpot, Jira, GitHub, Mailchimp, SendGrid, Freshdesk, Zoom, Trello, Dropbox, Pipedrive, BambooHR, etc.) and org connections
- `billing` — subscription plans (starter/growth/business/enterprise), usage tracking, billing_alerts (80% threshold), billing_invoices, dunning fields (failedPaymentCount, graceEndsAt, lastPaymentError)
- `support` — support tickets and knowledge base articles
- `notifications` — user notifications
- `relational-memory` — AI employee relational memories (preferences, context, interaction patterns)
- `prompt-templates` — Versioned prompt templates with layer assignment and variable tracking
- `prompt-audit-logs` — Audit trail for assembled prompts with PII redaction and token usage

## Production Hardening

- **CORS**: Secure host-based allowlist (parses `new URL()`, exact host match) for `REPLIT_DEV_DOMAIN` and `REPLIT_DEPLOYMENT_URL`; open in development
- **Validation**: Zod schemas on all route inputs (params, query, body) via `validate()` middleware factory in `middlewares/validate.ts`
- **Error handling**: Structured JSON errors `{ error, code, statusCode }` with codes `NOT_FOUND`, `FORBIDDEN`, `BAD_REQUEST`, `INTERNAL_ERROR`, `VALIDATION_ERROR`; global `errorHandler` + `notFoundHandler` middleware
- **User identity**: `/api/users/me` pulls real email/name from Clerk `sessionClaims` (never hardcodes placeholder emails)

## API Routes (all under `/api`)

- `/api/health` — health check
- `/api/dashboard/summary` — org metrics (employees, tasks, utilization)
- `/api/dashboard/activity` — recent activity feed
- `/api/analytics/overview` — charts data (tasks over time, utilization, distribution)
- `/api/organizations/current` — GET/PATCH current org
- `/api/users/me` — current user
- `/api/users` — list org users
- `/api/roles` — list/filter/sort AI roles catalog
- `/api/roles/categories` — role categories with counts
- `/api/roles/:id` — role detail
- `/api/employees` — CRUD AI employees (hire, update, deactivate)
- `/api/interviews` — create interview sessions, send messages (Claude-powered, OpenAI fallback)
- `/api/tasks` — CRUD tasks with assignment
- `/api/workflows` — CRUD workflows
- `/api/conversations` — CRUD conversations with AI chat (Claude-powered, OpenAI fallback)
- `/api/integrations` — list tools, connect/disconnect
- `/api/billing/plans` — available plan pricing
- `/api/billing/subscription` — subscription info
- `/api/billing/checkout` — Stripe checkout session creation (falls back to direct activation without Stripe)
- `/api/billing/change-plan` — upgrade/downgrade with proration
- `/api/billing/cancel` — cancel subscription at period end
- `/api/billing/portal` — Stripe customer portal
- `/api/billing/invoices` — invoice history (Stripe + local)
- `/api/billing/alerts` — 80% allocation threshold alerts
- `/api/billing/usage` — current usage summary across all dimensions
- `/api/billing/payment-method` — current payment method info
- `/api/billing/webhook` — Stripe webhook handler (dunning, invoice events)
- `/api/voices` — ElevenLabs voice list (with 12 preset fallbacks)
- `/api/notifications` — list, mark read, mark all read
- `/api/support/tickets` — list/create support tickets
- `/api/support/articles` — knowledge base articles

## Frontend Pages

- `/` — Landing page (unauthenticated) / redirect to dashboard (authenticated)
- `/sign-in`, `/sign-up` — Clerk auth pages
- `/onboarding` — 4-step onboarding wizard (welcome → marketplace → integrations → conversations)
- `/dashboard` — Command center with metrics and activity
- `/marketplace` — AI role catalog with filtering
- `/marketplace/:id` — Role detail with avatar picker, voice selection, and hire CTA
- `/team` — Hired AI employees management
- `/team/:id` — Employee detail with personality config, activity, settings tabs
- `/tasks` — Task management
- `/workflows` — Workflow automation
- `/conversations` — Chat with AI employees (ElevenLabs audio playback)
- `/analytics` — Charts and metrics
- `/integrations` — Platform integrations
- `/billing` — Pricing plans ($299/$799/$1,999/Custom), Stripe checkout, subscription management
- `/settings` — Profile and org settings
- `/help` — Knowledge base and support tickets

## Design System & Branding

NexsusHR brand identity: bronze/copper geometric "NX" logo with wireframe sphere.
Logo file: `artifacts/nexus-hr/public/nexushr-logo.png` (also at `attached_assets/NexusHR_logo_1775931812361.png`)
Dark theme by default (charcoal). CSS variables in `artifacts/nexus-hr/src/index.css`.
- Primary: `hsl(30 72% 50%)` — Bronze/Copper (brand color)
- Background: `hsl(220 20% 10%)` — Dark Charcoal
- Success: `hsl(145 63% 42%)`
- Warning: `hsl(37 91% 51%)`
- Destructive: `hsl(0 62.8% 30.6%)`
- Chart palette: Bronze → Green → Dark Copper → Amber → Burnt Orange

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk frontend key
- `CLERK_SECRET_KEY` — Clerk backend key
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — Anthropic proxy URL (primary AI)
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Anthropic proxy API key (primary AI)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI proxy URL (fallback)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI proxy API key (fallback)
- `ELEVENLABS_API_KEY` — ElevenLabs TTS (optional; graceful fallback when not set)
- `STRIPE_SECRET_KEY` — Stripe billing (optional; falls back to direct DB activation)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook verification (optional)

## Phase 1 Status (Complete)

All Phase 1 requirements verified complete:
1. 105 AI roles seeded across 12 categories, 22 industries, 16 departments
2. 20 integration tools seeded in tool_registry
3. ElevenLabs TTS wired into conversations and interviews with audio playback UI
4. Avatar customization (DiceBear API, 12 styles) + voice selection in hiring flow
5. Self-serve onboarding wizard at /onboarding (4-step flow with localStorage tracking)
6. Stripe billing checkout flows (checkout, portal, webhook, plans endpoints)
7. Plan pricing display on billing page ($299/$799/$1,999/Custom with annual toggle)
8. Real LLM conversations via Claude Sonnet (Anthropic proxy), GPT-4o fallback
9. Clerk authentication with protected routes, sign-in/sign-up
10. PostgreSQL with 22 tables, Drizzle ORM, full schema
11. Pre-hire interview room with 3 AI candidates per session
12. OpenAPI spec with 46 generated hooks, TypeScript declarations

## Phase 2: AI Avatar System (Complete)

- **Object Storage**: GCS-backed via Replit Object Storage (provisioned bucket, `@google-cloud/storage`)
- **Avatar Generation**: OpenAI `gpt-image-1` for photorealistic professional headshots
  - Params: role title, industry, seniority, gender, ethnicity, attire style
  - Generated images stored in GCS bucket, served via `/api/storage/public-objects/avatars/`
  - DiceBear fallback when OpenAI is unavailable
- **Avatar Gallery**: `GET /api/avatars/gallery` — 24 DiceBear quick-select avatars
- **Avatar Generate**: `POST /api/avatars/generate` — real AI-generated headshot
- **Avatar Regenerate**: `POST /api/avatars/regenerate/:employeeId` — regenerate for existing employee
- **Storage Routes**: Upload URL generation, public asset serving, private object serving
- **Reusable AIAvatar Component**: `artifacts/nexus-hr/src/components/ai-avatar.tsx` — responsive sizes (sm/md/lg/xl), visual states (idle/speaking/thinking/listening)
- **Frontend Integration**: Marketplace detail page has "Style Picker" + "AI Generate" avatar modes; team, conversations, and marketplace pages use AIAvatar component
- **Environment Variables**: `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR`

## Phase 3: Voice & Visual States (Complete)

- **Voice Synthesis**: `POST /api/voice/synthesize` — ElevenLabs TTS with personality-mapped voice settings
  - Personality axes: Energy→speed, Formality→stability, Warmth→similarity_boost
  - Role-based voice profiles: warm (counseling/HR), authoritative (executive/legal), technical (engineering/data), creative (design/marketing), neutral (default)
  - Voice config resolver: `lib/voiceConfig.ts` — `personalityToVoiceSettings()`, `resolveVoiceProfile()`
- **Speech Recognition**: `POST /api/voice/transcribe` — OpenAI Whisper STT, accepts base64 audio
- **Voice Profiles**: `GET /api/voice/profiles` — lists role-category voice profiles
- **Avatar Visual States**: AIAvatar component enhanced with `visualState` prop
  - `idle` — static professional headshot (default)
  - `speaking` — animated waveform border glow + waveform bars below avatar
  - `thinking` — pulsing yellow dots + slow glow border
  - `listening` — green mic indicator with ping animation, audio level meter
- **Audio Waveform Player**: `AudioWaveformPlayer` component with canvas-based waveform visualization, seek, mute, progress tracking, compact mode
- **Voice Mode**: `useVoiceMode` hook manages full voice pipeline
  - Mic permissions, MediaRecorder, audio capture (WebM/Opus)
  - STT → AI response → TTS → playback coordination
  - Audio level monitoring for listening state
- **Conversations Page**: Voice Mode toggle in chat header, push-to-talk mic button, avatar state indicators during voice interaction
- **CSS Animations**: `animate-avatar-speaking`, `animate-avatar-thinking`, `animate-avatar-listening`, `animate-waveform-bar`, `animate-thinking-dot`
- **Rate Limits**: synthesize 20/min, transcribe 15/min

## Phase 4: AI Personality Engine (Complete)

- **7-Axis Personality System**: warmth, formality, assertiveness, energy, empathy, detailOrientation, humor — each 0..1 continuous scale
- **Personality Engine** (`personalityEngine.ts`): Axis definitions, presets (8 types: analytical-expert, warm-counselor, direct-leader, creative-collaborator, executive-strategist, supportive-mentor, compliance-officer, friendly-assistant), communication style mapper, prompt generator, preview text generator
- **Dynamic Tone Controller** (`toneController.ts`): Real-time sentiment analysis of user messages (positive/neutral/negative/frustrated), urgency-based tone adjustment, interaction-count familiarity scaling, voice parameter offsets
- **Culture Alignment** (`cultureAlignment.ts`): Organization-level culture profile (formality baseline, industry terminology, values emphasis, communication norms, tone preference), culture-aware prompt generation, validation
- **Priority Intelligence** (`priorityIntelligence.ts`): Task queue scoring (priority + deadline + org matrix), urgency assessment (low/medium/high/critical), SLA awareness, role-specific priority weighting
- **Relational Memory Engine** (`relationalMemory.ts`): `relational_memories` DB table, memory types (preference, personal_context, interaction_pattern), combined recency+relevance scoring, deduplication, prompt formatting
- **Personality API Routes** (`routes/personality.ts`):
  - `GET /api/personality/presets` — list presets + axis labels
  - `GET /api/personality/employee/:id` — get personality config
  - `PUT /api/personality/employee/:id` — update personality axes
  - `POST /api/personality/generate-style` — preview style with context
  - `POST /api/personality/analyze-sentiment` — analyze message sentiment
  - `GET /api/personality/culture` — get org culture profile
  - `PUT /api/personality/culture` — update org culture
  - `POST /api/personality/memories` — store relational memory
  - `GET /api/personality/memories/:aiEmployeeId` — retrieve memories
  - `DELETE /api/personality/memories/:memoryId` — delete memory
  - `POST /api/personality/assess-priority` — assess task priority
- **Personality Configuration UI** (`personality-config.tsx`): 7 sliders with tooltips, 8 preset buttons, live preview text, axis overview visualization
- **Employee Detail Page** (`employee-detail.tsx`): Route `/team/:id`, tabs (Personality/Activity/Settings), integrated personality config with save/reset

## Phase 5: Prompt Architecture & Assembly Pipeline (Complete)

- **9-Layer Prompt Assembly**:
  - Layer 1 (System): Identity, safety protocols, operational standards, escalation triggers
  - Layer 2 (Role Definition): Title, department, seniority, reporting, core responsibilities from `ai_employee_roles`
  - Layer 3 (Job Instructions): Task catalog, standard workflows, use cases from role data
  - Layer 4 (Task Instructions): Active task context with steps, outputs, success criteria
  - Layer 5 (Memory Context): Relational memories from Phase 4 engine (preferences, context, patterns)
  - Layer 6 (User Context): User profile + recent conversation history
  - Layer 7 (Company Context): Org name, industry, timezone, culture profile from Phase 4
  - Layer 8 (Tool Access): Connected integrations with permissions, capabilities, rate limits
  - Layer 9 (Compliance): Regulatory requirements, data classifications, audit requirements from role metadata
- **7-Stage Assembly Pipeline** (`promptAssembler.ts`): Template resolution → context injection → memory hydration → personality overlay → tone adjustment → tool binding → token budget allocation
- **Token Budget Manager** (`tokenBudget.ts`): Priority-based truncation hierarchy — critical (system/compliance: never cut) → high (role/job: trim_end) → medium (company/user: summarize) → low (memory: trim_old). Default 128k budget.
- **Prompt Validation** (`promptValidator.ts`): Required layer presence checks, token budget enforcement, safety protocol verification, truncation warnings
- **PII Redaction**: Email, SSN, credit card, phone, address, API key, password patterns redacted before audit logging
- **Audit Logging**: `prompt_audit_logs` table with SHA-256 hash, redacted prompt, token counts, truncation details, validation results, assembly duration
- **Template Versioning**: `prompt_templates` table with version tracking, layer assignment, variable support, active/inactive state
- **Prompt API Routes** (`routes/prompts.ts`):
  - `GET /api/prompts/templates` — list templates (filter by layer, roleId)
  - `GET /api/prompts/templates/:id` — get template detail
  - `POST /api/prompts/templates` — create template with auto-versioning
  - `PUT /api/prompts/templates/:id` — update template
  - `POST /api/prompts/assemble` — assemble full 9-layer prompt for AI employee
  - `POST /api/prompts/preview` — preview assembled layers with PII redaction
  - `GET /api/prompts/audit-logs` — list audit logs (filter by aiEmployeeId)
  - `GET /api/prompts/audit-logs/:id` — get audit log detail

## Phase 13: AI Orchestration Layer (Complete)

- **Schema**: `task_assignments` table — assignment tracking with routing decisions, SLA, capacity, progress, checkpoints
- **Task Router** (`services/orchestration/taskRouter.ts`): Multi-factor scoring engine
  - 3-stage routing: filter (active employees) → rank (weighted scoring) → assign (top candidate)
  - Scoring factors: skill match (0.45), capacity (0.30), performance history (0.25)
  - Skill matching: term overlap between task description and role skills/category
  - Capacity: tracks concurrent active tasks per employee (max 5)
  - Performance: success rate weighted by confidence (task history volume)
  - Capability map: full availability matrix for all org AI employees
- **Assignment Engine** (`services/orchestration/assignmentEngine.ts`): State machine lifecycle
  - States: QUEUED → ACCEPTED → IN_PROGRESS → PAUSED → WAITING_DEPENDENCY → COMPLETED / FAILED / ESCALATED / CANCELLED
  - Enforced transition validation — only valid state changes allowed
  - Capacity reservation on assign, release on complete/fail/cancel
  - SLA deadline tracking with status (on_track/at_risk/breached)
  - Syncs assignment status → task status automatically
- **Progress Tracker** (`services/orchestration/progressTracker.ts`): Real-time execution monitoring
  - Execution phases (default: initialization → processing → validation → delivery)
  - Per-phase progress (0-100%), automatic phase advancement on completion
  - Named checkpoints with timestamps and data
  - Stall detection: configurable timeout (default 30min), marks stallDetectedAt
  - SLA monitoring: remaining time, at-risk (< 1hr), breached
  - Active assignment dashboard with overall progress calculation
- **Dependency Manager** (`services/orchestration/dependencyManager.ts`): Task sequencing
  - Topological sort with layer-based parallel execution groups
  - Blocking status: which tasks block/are blocked by a given task
  - Automatic unblocking: when a task completes, transitions dependents from waiting_dependency → in_progress
- **Workflow Execution Engine** (`services/orchestration/workflowEngine.ts`): Multi-step automation
  - Sequential step execution through workflow_steps (ordered by stepOrder)
  - Output passing: step N output available as input to step N+1
  - Conditional branch evaluation (skipIf conditions on step config)
  - Per-step status tracking in workflow_instances.stepResults
  - Automatic AI employee routing per step via assigneeRoleId
  - Instance lifecycle: running → completed / failed
- **Orchestration API Routes** (all under `/api/orchestration/`):
  - `POST /route` — route a task to best AI employee
  - `GET /capability-map` — full employee availability matrix
  - `POST /auto-assign` — route + assign in one call
  - `POST /assignments` — create assignment
  - `GET /assignments` — list by taskId or aiEmployeeId
  - `GET /assignments/:id` — get assignment
  - `PATCH /assignments/:id/transition` — state machine transition
  - `GET /assignments/:id/transitions` — valid next states
  - `PATCH /assignments/:id/progress` — update progress/phase/checkpoint
  - `GET /assignments/:id/progress` — full progress snapshot
  - `GET /progress` — all active assignment progress
  - `POST /stalls/detect` — detect stalled assignments
  - `POST /dependencies/resolve` — topological sort task set
  - `GET /dependencies/:id` — blocking status for task
  - `POST /dependencies/:id/unblock` — unblock dependents
  - `POST /workflows/start` — start workflow instance
  - `POST /workflows/:id/execute-step` — execute next step
  - `POST /workflows/:id/complete-step` — complete current step with output
  - `POST /workflows/:id/fail-step` — fail current step
  - `GET /workflows/:id/status` — instance status with step results

## Phase 14: Secure Tool Access Framework (Complete)

- **Schema**: Enhanced `integrations.ts` with `toolRegistry` (provider, healthEndpoint, documentationUrl, metadata, updatedAt), `integrations` (connectionConfig, updatedAt), `toolAuditLogs` (resultData, permissionDetails, executionDurationMs, errorMessage, requestId). New `tool-permissions.ts` with RBAC tables (toolRoles, toolRoleAssignments, toolPermissionOverrides with temporal constraints and rate limit overrides).
- **Seed**: 10 integrations (Google Workspace, Microsoft 365, Slack, HubSpot, Salesforce, Zendesk, QuickBooks, Stripe, Notion, Asana) + 6 system roles (admin, manager, operator, data-analyst, finance, support) with granular per-tool permission matrices.
- **Permission Engine** (`services/tools/permissionEngine.ts`): Multi-level RBAC evaluation
  - 3-tier check: permission overrides → role-based evaluation → deny by default
  - Temporal constraints: day-of-week and hour-range access windows
  - In-memory sliding window rate limiter: per-minute and per-day counters with automatic cleanup
  - Role assignment/removal, employee permission summary
- **Execution Engine** (`services/tools/executionEngine.ts`): Secure tool invocation
  - 5-minute execution timeout with `executeWithTimeout` wrapper
  - Pre-flight checks: permission evaluation → rate limit → org connection verification
  - Full audit trail on every execution (success, denied, error, timeout, rate_limited)
  - Request validation with operation whitelist
- **Audit Logger** (`services/tools/auditLogger.ts`): Query + summary endpoints
  - Filterable log queries (orgId, aiEmployeeId, toolId, operation, result, date range)
  - Summary aggregations by result, tool, and employee
- **Security Hardening** (post code review):
  - IDOR prevention: `verifyEmployeeOwnership()` validates aiEmployeeId belongs to caller's org on all mutating endpoints
  - Org-scoped queries: all connection/override operations filtered by orgId from auth context
- **Tool Access API Routes** (all under `/api/tools/`):
  - `GET /registry` — list active tools
  - `GET /registry/:id` — tool detail
  - `POST /connections` — connect org to tool
  - `DELETE /connections/:id` — disconnect
  - `GET /connections` — list org connections
  - `POST /connections/:id/health` — health check
  - `GET /roles` — list tool roles
  - `POST /role-assignments` — assign role to AI employee
  - `DELETE /role-assignments` — remove role assignment
  - `GET /permissions/:aiEmployeeId` — employee permission summary
  - `POST /permissions/check` — evaluate specific permission
  - `POST /permission-overrides` — create override
  - `DELETE /permission-overrides/:id` — remove override
  - `POST /execute` — execute tool with full security pipeline
  - `GET /audit-logs` — query audit logs
  - `GET /audit-summary` — aggregated audit summary

## Phase 15: Technical System Architecture (Complete)

- **State Management (3-tier)**:
  - UI State: React `useState` for component-local (modals, form fields)
  - Client State: Zustand stores with localStorage persistence (`useAppStore` for theme/sidebar/preferences/navigation, `useAuthStore` for user/org context)
  - Server State: TanStack Query with entity-specific stale times (realtime 0s, fast 10s, standard 30s, slow 60s, static 5min), retry logic (skip 401/403/404), background refetch
- **Real-time WebSocket Layer**: Socket.io server attached to HTTP server with:
  - Origin-restricted CORS (allowed origins from REPLIT_DEV_DOMAIN/REPLIT_DEPLOYMENT_URL; permissive in dev)
  - Auth middleware requiring orgId + userId on handshake
  - Room-based subscriptions (tasks, employees, notifications, conversations, workflows, integrations)
  - Domain event publisher (`publishEvent`, `publishToOrg`) for server-side broadcasting
  - Client hook (`useSocket`) with auto-connect, room subscriptions, TanStack Query cache invalidation on events, offline message queue with sync on reconnect
  - Optimistic update utility (`useOptimisticUpdate`) with rollback on failure
- **Code Splitting**: React.lazy + Suspense for 13 route-level pages (marketplace, team, tasks, workflows, conversations, analytics, integrations, billing, settings, help, onboarding, employee-detail, marketplace-detail). Dashboard and landing page eagerly loaded.
- **Component Architecture**: Page components (route-level), feature hooks (`useEmployeeState`, `useTaskState` with query key alignment to generated API client `/api/...` keys), shared UI components (shadcn/radix), utilities (`utils/transforms.ts` with formatCurrency, formatNumber, formatRelativeTime, groupBy, sortBy, uniqueBy)
- **Performance Infrastructure**:
  - `VirtualizedList` component (react-virtuoso) for large datasets with infinite scroll, empty state, loading indicator
  - `usePerformanceMonitor` hook for render tracking with slow-render warnings
  - `useDebounce` and `useThrottle` hooks for input optimization
- **Query Client Configuration** (`lib/queryClient.ts`): `createQueryClient()` factory with entity-specific stale times, smart retry (skip auth errors), exponential backoff, window-focus refetch, helper functions for cache invalidation

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
