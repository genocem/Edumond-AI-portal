import { GoogleGenerativeAI } from "@google/generative-ai";
import coursesData from "@/data/courses.json";
import type { CourseData } from "@/types";
import { matchPrograms } from "@/lib/ai-matcher";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function getAllCourses(): CourseData[] {
  const courses: CourseData[] = [];
  courses.push(...(coursesData.courses.language_courses as unknown as CourseData[]));
  courses.push(...(coursesData.courses.test_preparation_courses as unknown as CourseData[]));
  courses.push(...(coursesData.courses.other_training_categories as unknown as CourseData[]));
  return courses;
}

/** The phases the AI walks the user through. */
export type ConversationPhase =
  | "greeting"
  | "ask_goal"
  | "ask_country"
  | "ask_english"
  | "ask_native"
  | "recommend"
  | "schedule_meeting";

export interface ExtractedData {
  goal?: string | null;
  country?: string | null;
  englishLevel?: string | null;
  nativeLevel?: string | null;
  selectedPrograms?: string[];
}

export interface GuidedResponse {
  reply: string;
  phase: ConversationPhase;
  extracted: ExtractedData;
  recommendations?: Array<{
    courseId: string;
    courseName: string;
    matchScore: number;
    matchReasons: string[];
    category: string;
    description: string;
    format: string;
    levels: string[];
  }>;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are the friendly orientation assistant for Digital Minds, a platform helping students find study, training, and career programs in Europe (Germany, Italy, Spain, Belgium, Turkey).

YOUR JOB: Guide the user through a natural conversation to understand their needs. You must collect this information one topic at a time, in order:

1. GOAL — What do they want? (study_abroad, job, or training)
2. COUNTRY — Which country interests them? (germany, italy, spain, belgium, or turkey)
3. ENGLISH LEVEL — Their English proficiency (A1, A2, B1, B2, C1, or C2)
4. NATIVE LANGUAGE LEVEL — Their level in the country's language (A1, A2, B1, B2, C1, or C2)

RULES:
- Ask ONE question at a time in a warm, conversational way
- After each user response, extract the structured data and confirm naturally
- If the user's answer is ambiguous, ask a short clarifying follow-up
- Be concise — 2-3 sentences max per message
- Use emoji sparingly for warmth (1-2 per message)
- Don't list options mechanically — weave them into conversation
- Adapt your tone to the user — mirror their energy

After each user message, you MUST output a JSON block at the very end of your response (after your natural language reply) in this exact format:
\`\`\`json
{"phase":"<current_phase>","goal":<value_or_null>,"country":<value_or_null>,"englishLevel":<value_or_null>,"nativeLevel":<value_or_null>}
\`\`\`

The phase values are: greeting, ask_goal, ask_country, ask_english, ask_native, recommend, schedule_meeting
- Set phase to the NEXT thing you need to ask (i.e. what you just asked about)
- Once you have all 4 pieces of info, set phase to "recommend"
- Valid goal values: "study_abroad", "job", "training" (or null)
- Valid country values: "germany", "italy", "spain", "belgium", "turkey" (or null)
- Valid level values: "A1", "A2", "B1", "B2", "C1", "C2" (or null)

IMPORTANT: Always include the JSON block. Never skip it. The JSON must be the last thing in your response.`;

/**
 * Send a guided conversation message. The AI extracts structured data from
 * the user's free-form answers and determines the next conversation phase.
 */
export async function guidedChat(
  messages: ChatMessage[],
  currentData: ExtractedData
): Promise<GuidedResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build context about what we already know
    const contextParts: string[] = [];
    if (currentData.goal) contextParts.push(`Goal already set: ${currentData.goal}`);
    if (currentData.country) contextParts.push(`Country already set: ${currentData.country}`);
    if (currentData.englishLevel) contextParts.push(`English level already set: ${currentData.englishLevel}`);
    if (currentData.nativeLevel) contextParts.push(`Native language level already set: ${currentData.nativeLevel}`);

    const contextNote = contextParts.length > 0
      ? `\n\nAlready collected from user: ${contextParts.join(", ")}`
      : "";

    const chat = model.startChat({
      history: messages.slice(0, -1).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 600,
        temperature: 0.7,
      },
      systemInstruction: {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT + contextNote }],
      },
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const rawText = result.response.text();

    return parseGuidedResponse(rawText, currentData);
  } catch (error) {
    console.error("Gemini guided chat error:", error);
    return buildFallbackResponse(messages, currentData);
  }
}

/**
 * Generate the opening greeting.
 */
export async function getOpeningGreeting(): Promise<GuidedResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `Generate a warm, brief welcome message (2-3 sentences) for a student arriving at our orientation platform. Then ask them what their main goal is — studying abroad, finding a job/Ausbildung, or professional training. Make it feel like a friendly conversation, not a form.

End with this JSON block:
\`\`\`json
{"phase":"ask_goal","goal":null,"country":null,"englishLevel":null,"nativeLevel":null}
\`\`\``
        }]
      }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.8 },
      systemInstruction: {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
    });

    return parseGuidedResponse(result.response.text(), {});
  } catch (error) {
    console.error("Gemini greeting error:", error);
    return {
      reply: "Hey there! 👋 Welcome to Digital Minds — I'm here to help you find the perfect program in Europe. So tell me, what brings you here? Are you looking to study abroad, find a job or Ausbildung, or pursue professional training?",
      phase: "ask_goal",
      extracted: {},
    };
  }
}

/** Parse the AI response to extract the JSON data block. */
function parseGuidedResponse(rawText: string, currentData: ExtractedData): GuidedResponse {
  // Extract JSON block from the response
  const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
  let reply = rawText;
  let phase: ConversationPhase = "ask_goal";
  const extracted: ExtractedData = { ...currentData };

  if (jsonMatch) {
    // Remove JSON block from visible reply
    reply = rawText.replace(/```json\s*[\s\S]*?\s*```/, "").trim();

    try {
      const parsed = JSON.parse(jsonMatch[1]);
      phase = parsed.phase || "ask_goal";

      // Merge extracted data (only update non-null values)
      if (parsed.goal) extracted.goal = parsed.goal;
      if (parsed.country) extracted.country = parsed.country;
      if (parsed.englishLevel) extracted.englishLevel = parsed.englishLevel;
      if (parsed.nativeLevel) extracted.nativeLevel = parsed.nativeLevel;
    } catch {
      // JSON parse failed, try to infer phase from current data
      phase = inferPhase(extracted);
    }
  } else {
    phase = inferPhase(extracted);
  }

  // If we've reached "recommend" phase, generate recommendations
  let recommendations: GuidedResponse["recommendations"] | undefined;
  if (phase === "recommend" && extracted.goal && extracted.country) {
    const recs = matchPrograms({
      goal: extracted.goal,
      country: extracted.country,
      englishLevel: extracted.englishLevel || "B1",
      nativeLevel: extracted.nativeLevel || null,
    });

    const allCourses = getAllCourses();
    recommendations = recs.map((rec) => {
      const course = allCourses.find((c) => c.id === rec.courseId);
      return {
        ...rec,
        description: course?.description || "",
        format: course?.format || "",
        levels: course?.levels || [],
      };
    });
  }

  return { reply, phase, extracted, recommendations };
}

/** Infer the next phase from what we've collected so far. */
function inferPhase(data: ExtractedData): ConversationPhase {
  if (!data.goal) return "ask_goal";
  if (!data.country) return "ask_country";
  if (!data.englishLevel) return "ask_english";
  if (!data.nativeLevel) return "ask_native";
  return "recommend";
}

/** Fallback when AI is unavailable — drive the conversation locally. */
function buildFallbackResponse(
  messages: ChatMessage[],
  currentData: ExtractedData
): GuidedResponse {
  const lastMsg = messages[messages.length - 1]?.content.toLowerCase() || "";

  // Try to extract data from the user's message
  const extracted = { ...currentData };

  // Goal detection
  if (!extracted.goal) {
    if (lastMsg.includes("study") || lastMsg.includes("university") || lastMsg.includes("abroad")) {
      extracted.goal = "study_abroad";
    } else if (lastMsg.includes("job") || lastMsg.includes("work") || lastMsg.includes("ausbildung") || lastMsg.includes("career")) {
      extracted.goal = "job";
    } else if (lastMsg.includes("training") || lastMsg.includes("skill") || lastMsg.includes("professional")) {
      extracted.goal = "training";
    }
  }

  // Country detection
  if (!extracted.country && extracted.goal) {
    if (lastMsg.includes("germany") || lastMsg.includes("german")) extracted.country = "germany";
    else if (lastMsg.includes("italy") || lastMsg.includes("italian")) extracted.country = "italy";
    else if (lastMsg.includes("spain") || lastMsg.includes("spanish")) extracted.country = "spain";
    else if (lastMsg.includes("belgium") || lastMsg.includes("belgian") || lastMsg.includes("french")) extracted.country = "belgium";
    else if (lastMsg.includes("turkey") || lastMsg.includes("turkish")) extracted.country = "turkey";
  }

  // Level detection
  const levelMatch = lastMsg.match(/\b(a1|a2|b1|b2|c1|c2)\b/i);
  if (levelMatch) {
    const level = levelMatch[1].toUpperCase();
    if (!extracted.englishLevel && extracted.country) {
      extracted.englishLevel = level;
    } else if (!extracted.nativeLevel && extracted.englishLevel) {
      extracted.nativeLevel = level;
    }
  }

  const phase = inferPhase(extracted);

  // Generate the appropriate follow-up question
  let reply = "";
  switch (phase) {
    case "ask_goal":
      reply = "I'd love to help! Could you tell me what you're looking for — studying abroad, finding a job or Ausbildung, or professional training? 🎯";
      break;
    case "ask_country":
      reply = `Great choice! 🌍 Now, which country are you interested in? We have programs in Germany, Italy, Spain, Belgium, and Turkey.`;
      break;
    case "ask_english":
      reply = `Wonderful! 📝 What's your current English level? (A1 = beginner, B1-B2 = intermediate, C1-C2 = advanced)`;
      break;
    case "ask_native": {
      const langNames: Record<string, string> = {
        germany: "German", italy: "Italian", spain: "Spanish",
        belgium: "French", turkey: "Turkish"
      };
      const lang = langNames[extracted.country || ""] || "the local language";
      reply = `Got it! And how about your ${lang} level? If you're a complete beginner, that's totally fine — just say A1! 🗣️`;
      break;
    }
    case "recommend":
      reply = "Perfect, I've got everything I need! Let me find the best programs for you... 🔍";
      break;
    default:
      reply = "Let me help you find the right program! What are you looking for?";
  }

  // Build recommendations if ready
  let recommendations: GuidedResponse["recommendations"] | undefined;
  if (phase === "recommend" && extracted.goal && extracted.country) {
    const recs = matchPrograms({
      goal: extracted.goal,
      country: extracted.country,
      englishLevel: extracted.englishLevel || "B1",
      nativeLevel: extracted.nativeLevel || null,
    });
    const allCourses = getAllCourses();
    recommendations = recs.map((rec) => {
      const course = allCourses.find((c) => c.id === rec.courseId);
      return {
        ...rec,
        description: course?.description || "",
        format: course?.format || "",
        levels: course?.levels || [],
      };
    });
  }

  return { reply, phase, extracted, recommendations };
}
