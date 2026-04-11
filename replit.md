# NexusHR VX — AI Workforce SaaS Platform

## Overview

NexusHR VX is a production-grade AI workforce management platform. Businesses hire, deploy, and manage fully autonomous AI "Beings" across 20+ industries. Built as a pnpm workspace monorepo using TypeScript.

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
- `integrations` — tool registry (10 tools: Google Workspace, Slack, HubSpot, etc.) and org connections
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
- `/api/billing/subscription` — subscription info
- `/api/billing/usage` — usage dimensions
- `/api/notifications` — list, mark read, mark all read
- `/api/support/tickets` — list/create support tickets
- `/api/support/articles` — knowledge base articles

## Frontend Pages

- `/` — Landing page (unauthenticated) / redirect to dashboard (authenticated)
- `/sign-in`, `/sign-up` — Clerk auth pages
- `/dashboard` — Command center with metrics and activity
- `/marketplace` — AI role catalog with filtering
- `/marketplace/:id` — Role detail with hire CTA
- `/team` — Hired AI employees management
- `/tasks` — Task management
- `/workflows` — Workflow automation
- `/conversations` — Chat with AI employees
- `/analytics` — Charts and metrics
- `/integrations` — Platform integrations
- `/billing` — Subscription and usage
- `/settings` — Profile and org settings
- `/help` — Knowledge base and support tickets

## Design System

Dark theme by default (deep navy). CSS variables in `artifacts/nexus-hr/src/index.css`.
- Primary: `hsl(199 89% 48%)` — Professional Blue
- Background: `hsl(222 47% 11%)` — Deep Navy
- Success: `hsl(145 63% 42%)`
- Warning: `hsl(37 91% 51%)`
- Destructive: `hsl(0 62.8% 30.6%)`

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk frontend key
- `CLERK_SECRET_KEY` — Clerk backend key
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — Anthropic proxy URL (primary AI)
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Anthropic proxy API key (primary AI)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI proxy URL (fallback)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI proxy API key (fallback)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
