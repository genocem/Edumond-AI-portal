"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Loader2,
  Bot,
  User,
  CheckCircle2,
  Calendar,
  UserPlus,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AssistantAvatar } from "@/components/avatars/AssistantAvatar";
import { ProgramCard } from "@/components/questionnaire/ProgramCard";
import { TimeSlotPicker } from "@/components/questionnaire/TimeSlotPicker";
import { useQuestionnaireStore } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { COUNTRIES } from "@/types";
import type { AvatarCountry } from "@/types";

export default function QuestionnairePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const store = useQuestionnaireStore();
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.ai.chat.useMutation();
  const greetingQuery = trpc.ai.greeting.useQuery(undefined, {
    enabled: store.messages.length === 0,
    refetchOnWindowFocus: false,
  });

  const meetingMutation = trpc.meetings.create.useMutation();
  const saveResponsesMutation = trpc.questionnaire.saveResponses.useMutation();

  const avatarCountry: AvatarCountry =
    (store.extracted.country as AvatarCountry) || "default";

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [store.messages, store.phase, store.isLoading]);

  // Load the AI greeting when first visiting
  useEffect(() => {
    if (greetingQuery.data && store.messages.length === 0) {
      store.addMessage({ role: "assistant", content: greetingQuery.data.reply });
      store.setPhase(greetingQuery.data.phase);
      if (greetingQuery.data.extracted) {
        store.setExtracted(greetingQuery.data.extracted);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [greetingQuery.data]);

  // Focus input when phase changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [store.phase]);

  /** Send a user message and get the AI's guided response. */
  const sendMessage = useCallback(async () => {
    if (!input.trim() || store.isLoading) return;

    const userMsg = input.trim();
    setInput("");
    store.addMessage({ role: "user", content: userMsg });
    store.setIsLoading(true);

    try {
      // Build messages array for the API (only role + content)
      const apiMessages = [
        ...store.messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: userMsg },
      ];

      const result = await chatMutation.mutateAsync({
        messages: apiMessages,
        currentData: store.extracted,
      });

      store.addMessage({ role: "assistant", content: result.reply });
      store.setPhase(result.phase);
      store.setExtracted(result.extracted);

      // If we got recommendations, store them
      if (result.recommendations && result.recommendations.length > 0) {
        store.setRecommendations(result.recommendations);
      }
    } catch (error) {
      console.error("Chat error:", error);
      store.addMessage({
        role: "assistant",
        content:
          "Sorry, I had a hiccup! Could you try that again? 😅",
      });
    } finally {
      store.setIsLoading(false);
    }
  }, [input, store, chatMutation]);

  /** Handle pressing Enter in the input. */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /** When user clicks "Schedule Meeting" after picking a time slot. */
  const handleScheduleMeeting = async () => {
    if (!store.meetingDatetime) return;

    if (session?.user) {
      // User is logged in — save everything to DB immediately
      setSaving(true);
      try {
        // Save questionnaire responses
        if (store.extracted.goal && store.extracted.country) {
          await saveResponsesMutation.mutateAsync({
            goal: store.extracted.goal as "study_abroad" | "job" | "training",
            country: store.extracted.country,
            englishLevel: store.extracted.englishLevel || "B1",
            nativeLevel: store.extracted.nativeLevel || undefined,
            selectedPrograms: store.selectedPrograms,
          });
        }

        // Save meeting
        await meetingMutation.mutateAsync({
          datetime: store.meetingDatetime,
          notes: `Goal: ${store.extracted.goal}, Country: ${store.extracted.country}, English: ${store.extracted.englishLevel}`,
        });

        store.addMessage({
          role: "assistant",
          content:
            "Your meeting is booked! 🎉 Head to your profile to see all the details. We're excited to help you on your journey!",
        });
        store.setPhase("schedule_meeting");

        // Redirect to profile after a moment
        setTimeout(() => {
          store.reset();
          router.push("/profile");
        }, 2000);
      } catch (err) {
        console.error("Error saving:", err);
        store.addMessage({
          role: "assistant",
          content: "Something went wrong saving your meeting. Please try again!",
        });
      } finally {
        setSaving(false);
      }
    } else {
      // Not logged in — prompt to create an account
      store.setPhase("schedule_meeting");
      store.addMessage({
        role: "assistant",
        content:
          "Awesome, you've picked a time! 🎉 To confirm your meeting and save your personalized recommendations, let's get you set up with an account — it only takes a moment!",
      });
    }
  };

  /** The progress indicator based on what data we've collected. */
  const progressSteps = [
    { label: "Goal", done: !!store.extracted.goal },
    { label: "Country", done: !!store.extracted.country },
    { label: "English", done: !!store.extracted.englishLevel },
    { label: "Native", done: !!store.extracted.nativeLevel },
    { label: "Programs", done: store.recommendations.length > 0 },
    { label: "Meeting", done: !!store.meetingDatetime },
  ];
  const completedCount = progressSteps.filter((s) => s.done).length;

  return (
    <div className="min-h-[calc(100vh-10rem)] py-4 px-4">
      <div className="mx-auto max-w-3xl flex flex-col h-[calc(100vh-12rem)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <AssistantAvatar country={avatarCountry} size="sm" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              Your Orientation Assistant
            </h1>
            <p className="text-xs text-muted-foreground">
              Chat with me to find your perfect program
            </p>
          </div>
          {/* Mini progress dots */}
          <div className="flex items-center gap-1.5">
            {progressSteps.map((step, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step.done
                    ? "bg-accent scale-110"
                    : "bg-border"
                }`}
                title={step.label}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              {completedCount}/{progressSteps.length}
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-card border border-border rounded-2xl p-4 space-y-1"
        >
          <AnimatePresence initial={false}>
            {store.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-2.5 mb-4 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="shrink-0 mt-1">
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-accent" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-muted/50 text-foreground rounded-bl-sm"
                      : "bg-accent text-white rounded-br-sm"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="shrink-0 mt-1">
                    <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-accent" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {store.isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2.5 mb-4"
            >
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div className="bg-muted/50 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ========== RECOMMENDATIONS SECTION ========== */}
          {store.recommendations.length > 0 && store.phase === "recommend" && !store.recommendationsShown && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 mt-4"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Star className="h-4 w-4 text-accent" />
                Here are your top matches — tap to select the ones you like:
              </div>
              {store.recommendations.map((rec) => (
                <ProgramCard
                  key={rec.courseId}
                  course={{
                    id: rec.courseId,
                    name: rec.courseName,
                    description: rec.description,
                    format: rec.format,
                    levels: rec.levels,
                    price: null,
                    capacity: "",
                    duration: {},
                    curriculum_highlights: [],
                    countries: [],
                    category: rec.category,
                  }}
                  selected={store.selectedPrograms.includes(rec.courseId)}
                  onToggle={store.toggleProgram}
                  matchScore={rec.matchScore}
                />
              ))}

              {store.selectedPrograms.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-2"
                >
                  <Button
                    onClick={() => {
                      store.setRecommendationsShown(true);
                      store.addMessage({
                        role: "assistant",
                        content: `Great picks! You selected ${store.selectedPrograms.length} program${store.selectedPrograms.length > 1 ? "s" : ""}. 📅 Now let's schedule a meeting with one of our orientation experts to discuss your options and get you started!`,
                      });
                    }}
                    className="w-full"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Continue with {store.selectedPrograms.length} selected
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ========== MEETING SCHEDULER ========== */}
          {store.recommendationsShown && !store.meetingDatetime && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-3"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4 text-accent" />
                Pick a date and time that works for you:
              </div>
              <TimeSlotPicker
                onSelect={store.setMeetingDatetime}
                selected={store.meetingDatetime}
              />
            </motion.div>
          )}

          {/* Show confirm button once meeting time is selected */}
          {store.meetingDatetime && store.phase !== "schedule_meeting" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <Button
                onClick={handleScheduleMeeting}
                disabled={saving}
                className="w-full"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Confirm Meeting
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* ========== SIGN-UP PROMPT (unauthenticated) ========== */}
          {store.phase === "schedule_meeting" && !session?.user && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 space-y-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">
                    Create your account to confirm
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sign up to save your meeting, recommendations, and track
                  your progress — it takes less than a minute.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/auth/register?callbackUrl=/questionnaire&from=chat">
                    <Button size="lg">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Free Account
                    </Button>
                  </Link>
                  <Link href="/auth/login?callbackUrl=/questionnaire&from=chat">
                    <Button variant="outline" size="lg">
                      Already have an account? Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ========== INPUT BAR ========== */}
        {/* Only show chat input during the conversation phases, not during program selection / scheduling */}
        {store.phase !== "recommend" &&
          store.phase !== "schedule_meeting" &&
          !store.recommendationsShown && (
            <div className="mt-3 shrink-0">
              <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  disabled={store.isLoading}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground px-2 py-1.5"
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!input.trim() || store.isLoading}
                  className="shrink-0"
                >
                  {store.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1.5">
                Just type naturally — I&apos;ll understand! ✨
              </p>
            </div>
          )}

        {/* Start over button (always visible at bottom) */}
        {store.messages.length > 0 && (
          <div className="mt-2 text-center shrink-0">
            <button
              onClick={() => store.reset()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
