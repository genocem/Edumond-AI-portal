/**
 * Tests for AI Router (Guided conversation flow)
 * Tests the AI-driven questionnaire that asks users questions to find matching programs.
 */
import { describe, it, expect } from "vitest";
import { createCallerFactory, createTRPCContext } from "@/server/trpc";
import { appRouter } from "@/server/root";

const createCaller = createCallerFactory(appRouter);

function publicCaller() {
  return createCaller(createTRPCContext({ session: null }));
}

describe("AI Router – Guided Conversation", () => {
  it("should return an opening greeting without authentication", async () => {
    const caller = publicCaller();

    const result = await caller.ai.greeting();
    expect(result).toBeDefined();
    expect(result.reply).toBeDefined();
    expect(typeof result.reply).toBe("string");
    expect(result.reply.length).toBeGreaterThan(0);
    expect(result.phase).toBeDefined();
    expect(result.extracted).toBeDefined();
  });

  it("greeting should start at the greeting or ask_goal phase", async () => {
    const caller = publicCaller();
    const result = await caller.ai.greeting();

    // Opening greeting transitions to ask_goal
    expect(["greeting", "ask_goal"]).toContain(result.phase);
  });

  it("should handle a first user message in chat", async () => {
    const caller = publicCaller();
    const result = await caller.ai.chat({
      messages: [
        { role: "user", content: "I want to study abroad in Germany" },
      ],
    });

    expect(result).toBeDefined();
    expect(result.reply).toBeDefined();
    expect(typeof result.reply).toBe("string");
    expect(result.reply.length).toBeGreaterThan(0);
    expect(result.phase).toBeDefined();
    expect(result.extracted).toBeDefined();
  });

  it("should accept currentData with the chat mutation", async () => {
    const caller = publicCaller();
    const result = await caller.ai.chat({
      messages: [
        { role: "user", content: "My English level is B2" },
      ],
      currentData: {
        goal: "study_abroad",
        country: "germany",
      },
    });

    expect(result.reply).toBeDefined();
    expect(result.reply.length).toBeGreaterThan(0);
    expect(result.phase).toBeDefined();
  });

  it("should handle multi-turn conversations", async () => {
    const caller = publicCaller();
    const result = await caller.ai.chat({
      messages: [
        { role: "user", content: "I want to study in Germany" },
        { role: "assistant", content: "Great! What is your English proficiency level?" },
        { role: "user", content: "I have a B2 certificate" },
      ],
      currentData: {
        goal: "study_abroad",
        country: "germany",
      },
    });

    expect(result.reply).toBeDefined();
    expect(result.reply.length).toBeGreaterThan(0);
  });

  it("should handle empty currentData gracefully", async () => {
    const caller = publicCaller();
    const result = await caller.ai.chat({
      messages: [
        { role: "user", content: "Hello, I need help" },
      ],
      currentData: {},
    });

    expect(result).toBeDefined();
    expect(result.reply).toBeDefined();
  });

  it("should extract structured data from user messages", async () => {
    const caller = publicCaller();
    const result = await caller.ai.chat({
      messages: [
        { role: "user", content: "I want to find a job or Ausbildung in Germany and my English is B1" },
      ],
    });

    expect(result.extracted).toBeDefined();
    // The AI should extract some fields from the natural language input
    // (exact extraction depends on Gemini / fallback behavior)
    expect(typeof result.extracted).toBe("object");
  });

  it("should return recommendations when phase reaches recommend", async () => {
    const caller = publicCaller();
    const result = await caller.ai.chat({
      messages: [
        { role: "user", content: "I want to do professional training in Italy, my English is C1 and I speak Italian natively" },
      ],
      currentData: {
        goal: "training",
        country: "italy",
        englishLevel: "C1",
        nativeLevel: "C1",
      },
    });

    expect(result).toBeDefined();
    expect(result.reply).toBeDefined();
    // When all data is gathered, recommendations may be included
    if (result.phase === "recommend") {
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    }
  });
});
