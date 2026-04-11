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
- `billing` — subscription plans (trial/starter/growth/business/enterprise) and usage tracking
- `support` — support tickets and knowledge base articles
- `notifications` — user notifications

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
- `/api/billing/portal` — Stripe customer portal
- `/api/billing/webhook` — Stripe webhook handler
- `/api/billing/usage` — usage dimensions
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

All 6 Phase 1 gaps closed:
1. 20 integration tools seeded in tool_registry
2. ElevenLabs TTS wired into conversations and interviews with audio playback UI
3. Avatar customization (DiceBear API, 12 styles) + voice selection in hiring flow
4. Self-serve onboarding wizard at /onboarding (4-step flow with localStorage tracking)
5. Stripe billing checkout flows (checkout, portal, webhook, plans endpoints)
6. Plan pricing display on billing page ($299/$799/$1,999/Custom with annual toggle)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
