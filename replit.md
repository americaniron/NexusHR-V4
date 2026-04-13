# NexsusHR — Autonomous AI Company OS

## Overview

NexsusHR is a production-grade AI People platform for businesses to discover, onboard, and collaborate with fully autonomous AI People. It elevates the concept from "AI Employees/Agents" to "AI People" by providing each with a unique identity, personality, voice, and cinematic video presence. The platform offers a comprehensive solution for integrating AI into business operations, aiming to enhance productivity and operational efficiency.

## User Preferences

I prefer to receive clear, structured information. When making changes, prioritize core functionality and established architectural patterns. For any significant modifications or new features, please outline the proposed approach and rationale before implementation. Ensure all generated code adheres to best practices and maintains consistency with the existing codebase's style and conventions. I value detailed explanations for complex decisions and iterative development.

## System Architecture

NexsusHR is built as a pnpm workspace monorepo using TypeScript.

**Frontend:**
-   **Framework:** React with Vite.
-   **Styling:** TailwindCSS v4 and shadcn/ui components.
-   **Design System:** Dark theme (charcoal) with bronze/copper as the primary brand color.
-   **Component Architecture:** Structured with page components, feature hooks, shared UI, and utilities.
-   **State Management:** React `useState` for local UI state, Zustand for global client state (with localStorage), and TanStack Query for server state management (data fetching, caching, synchronization).
-   **Performance:** Utilizes `VirtualizedList`, debouncing, throttling, and code splitting with `React.lazy`/`Suspense`.

**Backend:**
-   **API Framework:** Express 5 with Clerk middleware.
-   **Database:** PostgreSQL with Drizzle ORM (comprehensive schema covering organizations, users, AI roles, employees, interviews, tasks, workflows, conversations, integrations, billing, support, notifications, relational memory, and prompt templates/audit logs).
-   **Validation:** Zod schemas for all API inputs.
-   **API Codegen:** Orval generates React Query hooks and Zod schemas from OpenAPI.
-   **Error Handling:** Structured JSON errors with a global handler.
-   **Real-time Communication:** Socket.io for WebSocket connections with authentication and room-based subscriptions.

**Core Features & Implementations:**
-   **AI People Management:** Catalog of 105+ AI roles, onboarding and management of AI people, AI-powered interview sessions, real-time chat with ElevenLabs audio playback, HeyGen Seedance 2.0 integration for cinematic AI person videos.
-   **AI Avatar System:** Photorealistic headshots (OpenAI `gpt-image-1` or DiceBear fallback), `AIAvatar` component supporting `idle`, `speaking`, `thinking`, `listening` states.
    -   **Emotion Engine:** Detects 7 emotion states from AI response text, mapping to ElevenLabs voice parameters and avatar visual cues (ring glows, indicator dots, waveform bars).
    -   **Avatar Animator:** `AvatarAnimator` component for viseme-driven mouth animation, idle cycles, and emotion-driven facial expressions.
    -   **Rich Chat Messages:** 8 types including text, voice transcription, data cards, file attachments, action confirmations, status updates, quick replies, and escalation notices.
    -   **ElevenLabs Alignment API:** Used for character-level timing data to drive lip sync.
    -   **Collaboration Visibility Panel:** Real-time inter-professional workflow progress with dependency graphs and assignments.
-   **Voice & Visual States:** ElevenLabs TTS with personality-mapped voice settings and emotion-aware modulation. OpenAI Whisper STT for transcription. `useVoiceMode` hook for managing the full voice pipeline.
-   **AI Personality Engine:** 7-Axis personality system with customizable sliders, dynamic tone control, culture alignment, and a relational memory engine.
-   **Prompt Architecture & Assembly Pipeline:** 9-layer prompt assembly, 7-stage assembly pipeline for context injection and token management, PII redaction, audit logging, and template versioning.
-   **AI Orchestration Layer:** Task router for AI employee assignment, assignment engine, progress tracker, dependency manager, and workflow execution engine.
-   **Secure Tool Access Framework:** RBAC for tool permissions, secure execution engine with pre-flight checks and audit trails, and security hardening.
-   **Production Security & Performance:** Helmet.js for security headers, gzip compression, global and route-specific rate limiting, UUID-based request ID tracking, enhanced health checks, database indexing, and frontend build optimizations.

## External Dependencies

-   **Authentication:** Clerk
-   **AI (Primary):** Anthropic Claude (Opus 4.6, Sonnet 4.6) via Replit AI Integrations
-   **AI (Fallback):** OpenAI GPT-4o via Replit AI Integrations
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