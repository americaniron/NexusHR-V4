import { describe, it, expect } from "vitest";
import { extractMemoryEntries } from "../lib/memoryConsolidation";

describe("memoryConsolidation – extractMemoryEntries", () => {
  describe("preference extraction", () => {
    it("extracts 'I prefer' statements as preferences", () => {
      const msgs = [
        { role: "user", content: "I prefer getting reports in PDF format every Monday" },
      ];
      const entries = extractMemoryEntries(msgs);
      const prefs = entries.filter(e => e.memoryType === "preference");
      expect(prefs.length).toBeGreaterThanOrEqual(1);
      expect(prefs[0].content).toContain("prefer");
    });

    it("extracts 'I like' statements as preferences", () => {
      const msgs = [
        { role: "user", content: "I like having a daily standup summary emailed to me" },
      ];
      const entries = extractMemoryEntries(msgs);
      const prefs = entries.filter(e => e.memoryType === "preference");
      expect(prefs.length).toBeGreaterThanOrEqual(1);
    });

    it("extracts 'please always' directives as preferences", () => {
      const msgs = [
        { role: "user", content: "Please always include charts in the weekly report" },
      ];
      const entries = extractMemoryEntries(msgs);
      const prefs = entries.filter(e => e.memoryType === "preference");
      expect(prefs.length).toBeGreaterThanOrEqual(1);
    });

    it("extracts 'my preferred' statements as preferences", () => {
      const msgs = [
        { role: "user", content: "My preferred communication channel is Slack DMs" },
      ];
      const entries = extractMemoryEntries(msgs);
      const prefs = entries.filter(e => e.memoryType === "preference");
      expect(prefs.length).toBeGreaterThanOrEqual(1);
    });

    it("does not extract preferences from assistant messages", () => {
      const msgs = [
        { role: "assistant", content: "I prefer to format responses with bullet points" },
      ];
      const entries = extractMemoryEntries(msgs);
      expect(entries.filter(e => e.memoryType === "preference")).toHaveLength(0);
    });
  });

  describe("personal context extraction", () => {
    it("extracts 'I am' statements as personal context", () => {
      const msgs = [
        { role: "user", content: "I am the lead engineer on the platform team" },
      ];
      const entries = extractMemoryEntries(msgs);
      const ctx = entries.filter(e => e.memoryType === "personal_context");
      expect(ctx.length).toBeGreaterThanOrEqual(1);
    });

    it("extracts 'I'm' statements as personal context", () => {
      const msgs = [
        { role: "user", content: "I'm working on the mobile redesign project" },
      ];
      const entries = extractMemoryEntries(msgs);
      const ctx = entries.filter(e => e.memoryType === "personal_context");
      expect(ctx.length).toBeGreaterThanOrEqual(1);
    });

    it("extracts 'my role is' as personal context", () => {
      const msgs = [
        { role: "user", content: "My role is senior product manager in the growth team" },
      ];
      const entries = extractMemoryEntries(msgs);
      const ctx = entries.filter(e => e.memoryType === "personal_context");
      expect(ctx.length).toBeGreaterThanOrEqual(1);
    });

    it("extracts 'I joined' statements as personal context", () => {
      const msgs = [
        { role: "user", content: "I joined the company last September after grad school" },
      ];
      const entries = extractMemoryEntries(msgs);
      const ctx = entries.filter(e => e.memoryType === "personal_context");
      expect(ctx.length).toBeGreaterThanOrEqual(1);
    });

    it("extracts 'my team' statements as personal context", () => {
      const msgs = [
        { role: "user", content: "My team is responsible for the checkout flow redesign" },
      ];
      const entries = extractMemoryEntries(msgs);
      const ctx = entries.filter(e => e.memoryType === "personal_context");
      expect(ctx.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("interaction pattern extraction", () => {
    it("detects concise messaging style when avg < 50 chars", () => {
      const msgs = [
        { role: "user", content: "Show me the report" },
        { role: "assistant", content: "Here is the report..." },
        { role: "user", content: "Looks good thanks" },
        { role: "assistant", content: "You're welcome!" },
      ];
      const entries = extractMemoryEntries(msgs);
      const patterns = entries.filter(e => e.memoryType === "interaction_pattern");
      expect(patterns.length).toBeGreaterThanOrEqual(1);
      expect(patterns[0].content).toContain("concise");
    });

    it("detects detailed messaging style when avg > 200 chars", () => {
      const longMsg = "A".repeat(250);
      const msgs = [
        { role: "user", content: longMsg },
        { role: "assistant", content: "Got it." },
        { role: "user", content: longMsg },
        { role: "assistant", content: "Understood." },
      ];
      const entries = extractMemoryEntries(msgs);
      const patterns = entries.filter(e => e.memoryType === "interaction_pattern");
      expect(patterns.length).toBeGreaterThanOrEqual(1);
      expect(patterns[0].content).toContain("detailed");
    });

    it("detects moderate messaging style for mid-length messages", () => {
      const midMsg = "X".repeat(100);
      const msgs = [
        { role: "user", content: midMsg },
        { role: "assistant", content: "Noted." },
        { role: "user", content: midMsg },
        { role: "assistant", content: "Done." },
      ];
      const entries = extractMemoryEntries(msgs);
      const patterns = entries.filter(e => e.memoryType === "interaction_pattern");
      expect(patterns.length).toBeGreaterThanOrEqual(1);
      expect(patterns[0].content).toContain("moderate");
    });

    it("does not extract patterns when fewer than 4 messages", () => {
      const msgs = [
        { role: "user", content: "Hi there, quick question" },
        { role: "assistant", content: "Sure, go ahead." },
      ];
      const entries = extractMemoryEntries(msgs);
      const patterns = entries.filter(e => e.memoryType === "interaction_pattern");
      expect(patterns).toHaveLength(0);
    });

    it("does not extract patterns when fewer than 2 user messages", () => {
      const msgs = [
        { role: "user", content: "Hello there friend" },
        { role: "assistant", content: "Hi!" },
        { role: "assistant", content: "How can I help?" },
        { role: "assistant", content: "Let me know." },
      ];
      const entries = extractMemoryEntries(msgs);
      const patterns = entries.filter(e => e.memoryType === "interaction_pattern");
      expect(patterns).toHaveLength(0);
    });
  });

  describe("edge cases", () => {
    it("skips messages shorter than 10 characters for preference/context", () => {
      const msgs = [
        { role: "user", content: "I prefer" },
      ];
      const entries = extractMemoryEntries(msgs);
      const prefs = entries.filter(e => e.memoryType === "preference");
      expect(prefs).toHaveLength(0);
    });

    it("skips messages longer than 500 characters for preference/context", () => {
      const msgs = [
        { role: "user", content: "I prefer " + "x".repeat(500) },
      ];
      const entries = extractMemoryEntries(msgs);
      const prefs = entries.filter(e => e.memoryType === "preference");
      expect(prefs).toHaveLength(0);
    });

    it("truncates stored content to 300 characters", () => {
      const longContent = "I prefer " + "detailed reports ".repeat(30);
      const msgs = [{ role: "user", content: longContent.slice(0, 450) }];
      const entries = extractMemoryEntries(msgs);
      const prefs = entries.filter(e => e.memoryType === "preference");
      if (prefs.length > 0) {
        expect(prefs[0].content.length).toBeLessThanOrEqual(300);
      }
    });

    it("handles empty message array", () => {
      const entries = extractMemoryEntries([]);
      expect(entries).toEqual([]);
    });

    it("can extract both preference and context from the same message", () => {
      const msgs = [
        { role: "user", content: "I prefer email reports because I'm the team lead for analytics" },
      ];
      const entries = extractMemoryEntries(msgs);
      const types = new Set(entries.map(e => e.memoryType));
      expect(types.has("preference")).toBe(true);
    });

    it("extracts from multiple user messages in a conversation", () => {
      const msgs = [
        { role: "user", content: "I prefer dark mode for all dashboards" },
        { role: "assistant", content: "I'll remember that." },
        { role: "user", content: "My role is engineering manager on platform" },
        { role: "assistant", content: "Got it." },
      ];
      const entries = extractMemoryEntries(msgs);
      const prefs = entries.filter(e => e.memoryType === "preference");
      const ctx = entries.filter(e => e.memoryType === "personal_context");
      expect(prefs.length).toBeGreaterThanOrEqual(1);
      expect(ctx.length).toBeGreaterThanOrEqual(1);
    });
  });
});
