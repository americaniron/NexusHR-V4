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
-   **Validation:** Zod schemas for all API inputs. Query schemas use `.passthrough()` in the validate middleware to allow unknown proxy parameters.
-   **Testing:** Vitest + Supertest for integration tests. Query schemas shared via `src/schemas/query.ts`.
-   **API Codegen:** Orval generates React Query hooks and Zod schemas from OpenAPI.
-   **Error Handling:** Structured JSON errors with a global handler.
-   **Real-time Communication:** Socket.io for WebSocket connections with authentication and room-based subscriptions.

**Core Features & Implementations:**
-   **AI-Guided Setup Wizard:** Multi-step onboarding wizard (Welcome → Org Profile → Browse Talent → Customize → Integrations → Deploy) guided by Aria Lawson (Admin & Onboarding Director) — a live video-call-style AI presence. Aria plays her intro video on welcome, then appears as a live avatar with speaking animations on every step. She speaks all guidance through ElevenLabs voice synthesis and responds to customer questions in real-time via Claude AI (`/api/aria/ask` endpoint). The "Ask Aria" input accepts free-form questions contextually aware of the current step, org details, selected role, etc. No chatbot-style text — Aria is a real AI professional. Located at `/onboarding`, accessible after signup.
-   **AI People Management:** Catalog of 105+ AI roles, onboarding and management of AI people, AI-powered interview sessions, real-time chat with ElevenLabs audio playback, HeyGen Seedance 2.0 integration for cinematic AI person videos.
-   **AI Avatar System:** Photorealistic headshots (Claude Opus 4.6 prompt refinement + Replit image proxy, DiceBear fallback), `AIAvatar` component supporting `idle`, `speaking`, `thinking`, `listening` states.
    -   **Emotion Engine:** Detects 7 emotion states from AI response text, mapping to ElevenLabs voice parameters and avatar visual cues (ring glows, indicator dots, waveform bars).
    -   **Avatar Animator:** `AvatarAnimator` component for viseme-driven mouth animation, idle cycles, and emotion-driven facial expressions.
    -   **Rich Chat Messages:** 8 types including text, voice transcription, data cards, file attachments, action confirmations, status updates, quick replies, and escalation notices.
    -   **ElevenLabs Alignment API:** Used for character-level timing data to drive lip sync.
    -   **Collaboration Visibility Panel:** Real-time inter-professional workflow progress with dependency graphs and assignments.
-   **WebRTC Video Call System:** Real-time video calls with AI employees via WebRTC signaling (RTCPeerConnection + SDP offer/answer + ICE candidates) over Socket.IO. Canvas-based animated avatar (`VideoAvatar`) with real-time lip sync driven by TTS audio via Web Audio API analyser, facial expressions from the emotion engine (7 states), eye movement/blinking, and head gestures. `useVideoCall` hook manages full session lifecycle including RTCPeerConnection negotiation, media capture with audio-only fallback, push-to-talk STT from mic via MediaRecorder + transcription API, latency monitoring, reconnection (max 3 attempts), and graceful fallback to voice mode. `VideoCallSession` component displays user camera feed alongside animated avatar with call controls (mute, camera toggle, push-to-talk mic recording, fullscreen). Video call sessions created via `/api/video-call/session` with conversation ownership validation. Server-side session authorization binds sessionId to the creating user's org+clerkUserId — only authorized sockets can join. Entry points on both conversations page (Video Call button) and employee detail page (Video Call button linking with `?videoCall=true`). Graceful fallback to voice mode on WebRTC failure.
-   **Voice & Visual States:** ElevenLabs TTS with personality-mapped voice settings, emotion-aware modulation, and multilingual support (29 languages via `eleven_multilingual_v2`). OpenAI Whisper (`gpt-4o-mini-transcribe`) for audio transcription. Voice cloning via ElevenLabs `POST /voice/clone`. Per-employee `voiceLanguage` column for language selection. `useVoiceMode` hook for managing the full voice pipeline.
-   **AI Personality Engine:** 7-Axis personality system with customizable sliders, dynamic tone control, culture alignment, and a relational memory engine.
-   **Semantic Memory (pgvector):** Vector-based semantic search for long-term conversation memory using pgvector (PostgreSQL extension). Hash-based 384-dimensional embeddings stored alongside relational memories. Hybrid retrieval combines cosine similarity with time-decay relevance scoring. Background memory consolidation job runs every 30 minutes to extract and embed key insights from conversations. Admin API endpoints for semantic search, embedding backfill, and manual consolidation (`/api/memory/search`, `/api/memory/backfill`, `/api/memory/consolidate`).
-   **Prompt Architecture & Assembly Pipeline:** 9-layer prompt assembly, 7-stage assembly pipeline for context injection and token management, PII redaction, audit logging, and template versioning.
-   **AI Orchestration Layer:** Task router for AI employee assignment, assignment engine, progress tracker, dependency manager, and workflow execution engine.
-   **Secure Tool Access Framework:** RBAC for tool permissions, secure execution engine with pre-flight checks and audit trails, and security hardening.
-   **Real Integration Adapters:** ToolAdapter pattern (`adapters/types.ts`) with pluggable adapters for Slack (channels, messages, threads) and Google Workspace (Gmail, Calendar, Drive). Adapter registry (`adapters/registry.ts`) dispatches by tool name. OAuth2 flows for Slack and Google with CSRF-safe state, provider-aware token validation, and credential redaction from API responses. Execution engine auto-routes through adapters when available, with token refresh support.
-   **Production Security & Performance:** Helmet.js for security headers, gzip compression, global and route-specific rate limiting, UUID-based request ID tracking, enhanced health checks, database indexing, and frontend build optimizations.

## External Dependencies

-   **Authentication:** Clerk
-   **AI:** Anthropic Claude Opus 4.6 via Replit AI Integrations (reasoning, chat, prompt refinement). OpenAI Whisper (`gpt-4o-mini-transcribe`) via Replit AI Integrations for speech-to-text. Model, provider, and token limits are configurable via env vars (`AI_PROVIDER`, `AI_MODEL`, `AI_DEFAULT_MAX_TOKENS`, `AI_REFINEMENT_MAX_TOKENS`) in `artifacts/api-server/src/lib/aiConfig.ts`.
-   **Voice Synthesis:** ElevenLabs (via Replit integration connector) — multilingual TTS (`eleven_multilingual_v2`), voice cloning, and alignment API
-   **Speech-to-Text:** OpenAI Whisper (`gpt-4o-mini-transcribe`) via `@workspace/integrations-openai-ai-server`
-   **Image Generation:** Replit AI proxy (Claude Opus 4.6 prompt refinement)
-   **Database:** PostgreSQL (with pgvector extension for semantic search)
-   **ORM:** Drizzle ORM
-   **Validation:** Zod
-   **UI Components:** shadcn/ui
-   **HTTP Client/State Management:** TanStack Query
-   **Real-time Communication:** Socket.io
-   **Object Storage:** Google Cloud Storage (GCS)
-   **Payment Processing:** Stripe (primary, card payments) + PayPal (international, 200+ countries). Dual-provider billing with payment method selector modal. PayPal uses direct REST API v2 (OAuth2 token + orders). Stripe uses direct `STRIPE_SECRET_KEY` env var (Replit OAuth declined). Owner emails (`OWNER_EMAILS` env var) get permanent enterprise access with no expiry or billing limits.
-   **Avatar Placeholders:** DiceBear API
-   **Integration Tools:** Google Workspace, Slack, HubSpot, Jira, GitHub, Mailchimp, SendGrid, Freshdesk, Zoom, Trello, Dropbox, Pipedrive, BambooHR, Microsoft 365, Salesforce, Zendesk, QuickBooks, Notion, Asana.
