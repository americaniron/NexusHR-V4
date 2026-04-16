# NexsusHR — Autonomous AI Company OS

## Overview

NexsusHR is a production-grade AI People platform designed to help businesses discover, onboard, and collaborate with fully autonomous AI People. It differentiates itself by giving each AI a unique identity, personality, voice, and cinematic video presence. The platform aims to seamlessly integrate AI into business operations, significantly enhancing productivity and operational efficiency.

## User Preferences

I prefer to receive clear, structured information. When making changes, prioritize core functionality and established architectural patterns. For any significant modifications or new features, please outline the proposed approach and rationale before implementation. Ensure all generated code adheres to best practices and maintains consistency with the existing codebase's style and conventions. I value detailed explanations for complex decisions and iterative development.

## System Architecture

NexsusHR is built as a pnpm workspace monorepo using TypeScript.

**Frontend:**
-   **Framework:** React with Vite.
-   **Styling:** TailwindCSS v4 and shadcn/ui components, using a dark theme (charcoal) with bronze/copper branding.
-   **State Management:** React `useState` for local UI, Zustand for global client state, and TanStack Query for server state.
-   **Performance:** `VirtualizedList`, debouncing, throttling, and code splitting.

**Backend:**
-   **API Framework:** Express 5 with Clerk middleware.
-   **Database:** PostgreSQL with Drizzle ORM, covering comprehensive schemas for all platform functionalities.
-   **Validation:** Zod schemas for all API inputs.
-   **API Codegen:** Orval generates React Query hooks and Zod schemas from OpenAPI.
-   **Real-time Communication:** Socket.io for WebSocket connections with authentication.

**Core Features & Implementations:**
-   **AI-Guided Setup Wizard:** Multi-step onboarding guided by a live video-call-style AI presence (Aria Lawson), utilizing ElevenLabs for voice and Claude AI for real-time responses.
-   **AI People Management:** Catalog of 105+ AI roles, AI-powered interview sessions, real-time chat with ElevenLabs audio, and HeyGen Seedance 2.0 integration for cinematic AI videos.
-   **AI Avatar System:** Photorealistic headshots, `AIAvatar` component with `idle`, `speaking`, `thinking`, `listening` states. Includes an Emotion Engine mapping text to visual/voice parameters, and an `AvatarAnimator` for viseme-driven mouth animation and facial expressions. Rich chat messages support 8 types.
-   **WebRTC Video Call System:** Real-time video calls with AI employees via WebRTC over Socket.IO. Features canvas-based animated avatars (`VideoAvatar`) with real-time lip sync, emotion-driven facial expressions, eye movement, and head gestures. Includes session recording and playback to GCS. Photorealistic avatar animation is supported via D-ID or HeyGen integration.
-   **Voice & Visual States:** ElevenLabs TTS with personality-mapped voice settings and emotion-aware modulation (multilingual support). OpenAI Whisper for audio transcription. Voice cloning capabilities are integrated.
-   **AI Personality Engine:** 7-Axis personality system with customizable sliders, dynamic tone control, culture alignment, and relational memory.
-   **Semantic Memory (pgvector):** Vector-based semantic search for long-term conversation memory using pgvector and `all-MiniLM-L6-v2` embeddings. Includes hybrid retrieval and a background memory consolidation job. A UI is provided for memory management.
-   **Prompt Architecture:** 9-layer prompt assembly pipeline with context injection, token management, PII redaction, and audit logging.
-   **AI Orchestration Layer:** Task router, assignment engine, progress tracker, dependency manager, and workflow execution engine.
-   **Proactive AI Behaviors:** Infrastructure for autonomous AI actions based on scheduled or event-triggered rules.
-   **Secure Tool Access Framework:** RBAC for tool permissions, secure execution engine, and audit trails.
-   **Real Integration Adapters:** Pluggable `ToolAdapter` pattern for Slack, Google Workspace, HubSpot, Jira, and GitHub, with OAuth2 flows and encrypted token storage.
-   **Deep Analytics & Performance Metrics:** Comprehensive system including response ratings, SLA tracking, CSAT surveys, quality metrics dashboard, trend analysis, and exportable reports.
-   **Enterprise Compliance & Data Residency:** Data residency preferences, GDPR management (data export/deletion), consent management, configurable data retention policies, and a compliance posture dashboard.

## External Dependencies

-   **Authentication:** Clerk
-   **AI:** Anthropic Claude Opus 4.6 (reasoning, chat, prompt refinement) via Replit AI Integrations.
-   **Speech-to-Text:** ElevenLabs Scribe v2 Realtime (WebSocket-based, ~150ms latency, client-side streaming with single-use tokens). Fallback: OpenAI Whisper via Replit AI Integrations.
-   **Voice Synthesis:** ElevenLabs (TTS, voice cloning, alignment API) via Replit integration connector.
-   **Image Generation:** Replit AI proxy (Claude Opus 4.6 for prompt refinement).
-   **Database:** PostgreSQL (with pgvector extension).
-   **ORM:** Drizzle ORM.
-   **Validation:** Zod.
-   **UI Components:** shadcn/ui.
-   **HTTP Client/State Management:** TanStack Query.
-   **Real-time Communication:** Socket.io.
-   **Object Storage:** Google Cloud Storage (GCS).
-   **Payment Processing:** Stripe, PayPal.
-   **Avatar Animation:** D-ID Interactive Streams or HeyGen Streaming API (optional).
-   **Avatar Placeholders:** DiceBear API.
-   **Integration Tools:** Google Workspace, Slack, HubSpot, Jira, GitHub.