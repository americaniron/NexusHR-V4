# NexsusHR — Autonomous AI Company OS

## Overview

NexsusHR is a production-grade AI People platform designed for businesses to discover, onboard, and collaborate with fully autonomous AI People across various industries. The platform elevates the concept from "AI Employees/Agents" to "AI People" — each with unique identity, personality, voice, and cinematic video presence via HeyGen Seedance 2.0. It provides a comprehensive solution for integrating AI people into business operations.

## User Preferences

I prefer to receive clear, structured information. When making changes, prioritize core functionality and established architectural patterns. For any significant modifications or new features, please outline the proposed approach and rationale before implementation. Ensure all generated code adheres to best practices and maintains consistency with the existing codebase's style and conventions. I value detailed explanations for complex decisions and iterative development.

## System Architecture

NexsusHR is built as a pnpm workspace monorepo using TypeScript (v5.9).

**Frontend:**
-   **Framework:** React with Vite.
-   **Styling:** TailwindCSS v4 and shadcn/ui components.
-   **Design System:** Dark theme (charcoal) by default, with a bronze/copper primary brand color.
-   **Component Architecture:** Employs a structured approach with page components, feature hooks, shared UI components, and utility functions.
-   **State Management:**
    -   UI State: React `useState` for local component state.
    -   Client State: Zustand stores for global preferences and context with localStorage persistence.
    -   Server State: TanStack Query for data fetching, caching, and synchronization with entity-specific stale times and smart retry logic.
-   **Performance:** Utilizes `VirtualizedList` for large datasets, `useDebounce`, `useThrottle` hooks, and a `usePerformanceMonitor` for rendering optimization.
-   **Code Splitting:** Implemented with `React.lazy` and `Suspense` for route-level pages to improve loading performance.

**Backend:**
-   **API Framework:** Express 5 with Clerk middleware.
-   **Database:** PostgreSQL with Drizzle ORM (12 schema modules covering organizations, users, AI roles, employees, interviews, tasks, workflows, conversations, integrations, billing, support, notifications, relational memory, and prompt templates/audit logs).
-   **Validation:** Zod schemas for all API route inputs.
-   **API Codegen:** Orval generates React Query hooks and Zod schemas from OpenAPI specifications.
-   **Error Handling:** Structured JSON errors with specific codes and a global error handler.
-   **Real-time Communication:** Socket.io for WebSocket connections with authentication, origin-restricted CORS, and room-based subscriptions.

**Core Features & Implementations:**
-   **AI People Management:**
    -   **AI People Roles:** A catalog of 105+ AI roles with detailed attributes.
    -   **AI People:** Onboarding and management of AI people, linked to roles and organizations.
    -   **Interviews:** AI-powered interview sessions with candidates.
    -   **Conversations:** Real-time chat with AI people, including ElevenLabs audio playback.
    -   **Video Studio:** HeyGen Seedance 2.0 integration for cinematic AI person videos (requires HEYGEN_API_KEY, zero simulation).
-   **AI Avatar System (Phase 2):**
    -   **Generation:** OpenAI `gpt-image-1` for photorealistic headshots, stored in GCS-backed Replit Object Storage. DiceBear as a fallback.
    -   **Visual States:** `AIAvatar` component supports `idle`, `speaking`, `thinking`, and `listening` states with CSS animations.
    -   **Emotion Engine:** 7 emotion states (neutral, enthusiastic, empathetic, focused, reassuring, apologetic, thoughtful) detected from AI response text via keyword/phrase pattern matching. Each emotion maps to specific ElevenLabs voice parameters (stability, style, speed). Backend: `lib/emotionEngine.ts`.
    -   **Emotion-Aware Avatar:** Avatar component shows emotion-colored ring glows, emotion indicator dots, and emotion-tinted waveform bars during speech. Smooth 500ms cubic-bezier transitions between emotion states.
    -   **Avatar Animator:** `AvatarAnimator` component provides viseme-driven mouth animation overlay (15 viseme shapes), idle breathing/blink cycles, and emotion-driven facial expression hints. Uses `requestAnimationFrame` for smooth 60fps animation.
    -   **Rich Chat Messages (8 types):** Text, Voice Transcription, Data Card (expandable table), File Attachment (download link), Action Confirmation (Approve/Reject buttons), Status Update (progress bar), Quick Reply (pill buttons), Escalation Notice (4 priority levels). Components in `components/chat-messages/`.
    -   **ElevenLabs Alignment API:** `textToSpeechWithAlignment()` calls ElevenLabs `/with-timestamps` endpoint to extract character-level timing data, converted to viseme sequences via `alignmentToVisemes()` for lip sync.
    -   **Collaboration Visibility Panel:** Dashboard panel showing real-time inter-professional workflow progress with step-by-step dependency graphs, professional assignments, estimated completion times, and approval gates. Live-updating with 5s intervals.
-   **Voice & Visual States:**
    -   **Voice Synthesis:** ElevenLabs TTS with personality-mapped voice settings based on personality axes (Energy, Formality, Warmth, etc.). Emotion-aware voice parameter modulation.
    -   **Voice Synthesis with Alignment:** `/api/voice/synthesize-aligned` endpoint returns audio + character alignment data + viseme sequence + detected emotion for synchronized avatar animation.
    -   **Speech Recognition:** OpenAI Whisper STT for transcribing audio.
    -   **Voice Mode:** `useVoiceMode` hook for managing the full voice pipeline (mic permissions, audio capture, STT, AI response, TTS, playback).
-   **AI Personality Engine:**
    -   **7-Axis Personality System:** Customizable personality sliders (warmth, formality, assertiveness, energy, empathy, detailOrientation, humor) with presets.
    -   **Dynamic Tone Controller:** Adjusts AI tone based on user sentiment and interaction frequency.
    -   **Culture Alignment:** Organization-level culture profiles influence prompt generation.
    -   **Relational Memory Engine:** Stores and retrieves AI employee preferences, context, and interaction patterns.
-   **Prompt Architecture & Assembly Pipeline:**
    -   **9-Layer Prompt Assembly:** A structured approach combining system, role, task, memory, user, company, tool, and compliance contexts.
    -   **7-Stage Assembly Pipeline:** Manages template resolution, context injection, personality overlay, and token budget allocation.
    -   **Token Budget Manager:** Prioritizes prompt layers for truncation.
    -   **PII Redaction:** Automatic redaction of sensitive information before audit logging.
    -   **Audit Logging:** Tracks assembled prompts, token usage, and validation results.
    -   **Template Versioning:** Manages prompt templates with version tracking and variable support.
-   **AI Orchestration Layer:**
    -   **Task Router:** Multi-factor scoring engine for assigning tasks to the best AI employee based on skill, capacity, and performance.
    -   **Assignment Engine:** State machine for managing task assignment lifecycle (QUEUED, ACCEPTED, IN_PROGRESS, etc.).
    -   **Progress Tracker:** Monitors real-time execution with phases, checkpoints, and stall detection.
    -   **Dependency Manager:** Manages task sequencing with topological sorting and automatic unblocking.
    -   **Workflow Execution Engine:** Executes multi-step automation workflows with output passing and conditional branching.
-   **Secure Tool Access Framework:**
    -   **RBAC:** Multi-level Role-Based Access Control for tool permissions with temporal constraints and rate limiting.
    -   **Execution Engine:** Secure invocation of external tools with pre-flight checks, timeout mechanisms, and full audit trails.
    -   **Audit Logger:** Provides queryable logs and aggregated summaries of tool usage.
    -   **Security Hardening:** IDOR prevention and org-scoped queries for data access.

## External Dependencies

-   **Authentication:** Clerk (ClerkProvider, requireAuth middleware)
-   **AI (Primary):** Anthropic Claude (Opus 4.6, Sonnet 4.6) via Replit AI Integrations proxy
-   **AI (Fallback):** OpenAI GPT-4o via Replit AI Integrations proxy
-   **Voice Synthesis:** ElevenLabs (via Replit integration connector)
-   **Image Generation:** OpenAI `gpt-image-1`
-   **Speech-to-Text:** OpenAI Whisper
-   **Database:** PostgreSQL
-   **ORM:** Drizzle ORM
-   **Validation:** Zod
-   **UI Components:** shadcn/ui
-   **HTTP Client/State Management:** TanStack Query
-   **Real-time Communication:** Socket.io
-   **Object Storage:** Google Cloud Storage (GCS)
-   **Payment Processing:** Stripe
-   **Avatar Placeholders:** DiceBear API
-   **Integration Tools:** Google Workspace, Slack, HubSpot, Jira, GitHub, Mailchimp, SendGrid, Freshdesk, Zoom, Trello, Dropbox, Pipedrive, BambooHR, Microsoft 365, Salesforce, Zendesk, QuickBooks, Notion, Asana.

## Frontend Pages (Phase 17)

All platform pages are fully implemented with production-quality UI:

-   **Landing Page** (`/`): Hero section with gradient CTAs, stats counter, problem statement cards (3 pain-points), solution showcase with interactive role carousel (6 roles), trust bar (SOC2/GDPR/ISO badges), 8-feature grid, how-it-works steps, testimonials, pricing cards (4 plans), interactive FAQ accordion, CTA banner, full footer with nav links.
-   **Dashboard** (`/dashboard`): 4 KPI metric cards, system activity feed, department utilization bars.
-   **AI Marketplace** (`/marketplace`): Search + filters sidebar, category navigation, sort options, virtualized role card grid, role detail page with customize & hire flow.
-   **My AI Team** (`/team`): Employee card grid with status indicators, utilization bars, chat/settings quick actions, dropdown menus.
-   **Employee Detail** (`/team/:id`): Profile header with stats cards (completed/in-progress/failed/rate), activity tab with task history, personality tuning tab, settings tab with custom instructions + danger zone for deactivation.
-   **Task Management** (`/tasks`): Task table with search filter, create dialog, inline status transitions (start/done/fail), priority/status badges.
-   **Conversations** (`/conversations`): Split-panel chat UI, conversation sidebar, voice mode with waveform visualization, thinking/speaking/listening states, emotion-aware avatar with 7 emotion states, 8 rich message types (text, voice transcription, data card, file attachment, action confirmation with approve/reject, status update with progress, quick reply pills, escalation notice), emotion badges on AI messages.
-   **Workflows** (`/workflows`): KPI summary cards, search + status filter, create dialog with trigger type selector (manual/scheduled/event/webhook), edit dialog, status toggling, visual workflow builder dialog with node palette (7 node types), edge drawing with conditional branches, node configuration panel, and workflow execution simulation with status display.
-   **Analytics** (`/analytics`): 4 KPI cards, area chart (tasks over time), bar chart (utilization by dept), pie chart (task status distribution), bar chart (agents by dept), agent leaderboard table.
-   **Billing** (`/billing`): Current plan banner, monthly/annual toggle, 4-plan comparison grid, usage progress bars per dimension.
-   **Settings** (`/settings`): Organization tab (name/industry/slug + danger zone), profile tab, notifications tab (task/billing/agent toggles), team members tab (role assignment + invite + remove), security tab (MFA setup, active sessions, password management), API keys tab (show/copy key, webhooks).
-   **Integrations** (`/integrations`): Search + status filter, category-grouped cards with connect/disconnect toggles, connection status indicators, custom integration CTA.
-   **Help & Support** (`/help`): Support channel cards, tabbed interface (knowledge base with search, support tickets with form + recent list, FAQ accordion, changelog with versioned release notes).