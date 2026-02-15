"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, UserPlus, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AssistantAvatar } from "@/components/avatars/AssistantAvatar";
import { ChatMessage } from "@/components/questionnaire/ChatMessage";
import { WorldMap } from "@/components/questionnaire/WorldMap";
import { LanguageSelector } from "@/components/questionnaire/LanguageSelector";
import { ProgramCard } from "@/components/questionnaire/ProgramCard";
import { TimeSlotPicker } from "@/components/questionnaire/TimeSlotPicker";
import { useQuestionnaireStore } from "@/lib/store";
import { GOALS, COUNTRIES } from "@/types";
import type { AvatarCountry, Goal, Country, CEFRLevel } from "@/types";
import coursesData from "@/data/courses.json";
import type { CourseData } from "@/types";
import { trpc } from "@/lib/trpc";

const TOTAL_STEPS = 6;

function getAllCourses(): CourseData[] {
  const courses: CourseData[] = [];
  courses.push(...(coursesData.courses.language_courses as unknown as CourseData[]));
  courses.push(...(coursesData.courses.test_preparation_courses as unknown as CourseData[]));
  courses.push(...(coursesData.courses.other_training_categories as unknown as CourseData[]));
  return courses;
}

export default function QuestionnairePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const store = useQuestionnaireStore();
  const [saving, setSaving] = useState(false);

  const meetingMutation = trpc.meetings.create.useMutation();
  const [completed, setCompleted] = useState(false);

  const avatarCountry: AvatarCountry = store.country || "default";

  const getCountryLanguageName = useCallback(() => {
    const country = COUNTRIES.find((c) => c.code === store.country);
    return country?.nativeLanguage || "the local language";
  }, [store.country]);

  const getFilteredCourses = useCallback(() => {
    if (!store.country) return [];
    return getAllCourses().filter((c) =>
      c.countries.includes(store.country!)
    );
  }, [store.country]);

  const canProceed = () => {
    switch (store.currentStep) {
      case 0: return !!store.goal;
      case 1: return !!store.country;
      case 2: return !!store.englishLevel;
      case 3: return !!store.nativeLevel;
      case 4: return store.selectedPrograms.length > 0;
      case 5: return !!store.meetingDatetime;
      default: return false;
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      if (session?.user) {
        // Authenticated: save meeting to database
        if (store.meetingDatetime) {
          await meetingMutation.mutateAsync({
            datetime: store.meetingDatetime,
            notes: `Goal: ${store.goal}, Country: ${store.country}, English: ${store.englishLevel}`,
          });
        }
        router.push("/profile");
        store.reset();
      } else {
        // Unauthenticated: show completion summary with sign-up prompt
        setCompleted(true);
      }
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  // Completion screen for unauthenticated users
  if (completed && !session?.user) {
    return (
      <div className="min-h-[calc(100vh-10rem)] py-8 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="bg-card border border-border rounded-2xl p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <AssistantAvatar country={avatarCountry} size="lg" />
              </div>

              <div>
                <div className="flex justify-center mb-3">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Great job! Your orientation is complete 🎉
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Here&apos;s a summary of what we found for you.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2 text-left">
                <div className="bg-background border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    <h3 className="font-semibold text-foreground">Your Profile</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>🎯 Goal: <span className="text-foreground">{GOALS.find(g => g.value === store.goal)?.label}</span></li>
                    <li>🌍 Country: <span className="text-foreground">{COUNTRIES.find(c => c.code === store.country)?.name}</span></li>
                    <li>🇬🇧 English: <span className="text-foreground">{store.englishLevel?.toUpperCase()}</span></li>
                    <li>🗣️ Local Language: <span className="text-foreground">{store.nativeLevel?.toUpperCase()}</span></li>
                  </ul>
                </div>

                <div className="bg-background border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-accent" />
                    <h3 className="font-semibold text-foreground">Selected</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>📚 Programs: <span className="text-foreground">{store.selectedPrograms.length} selected</span></li>
                    {store.meetingDatetime && (
                      <li>📅 Meeting: <span className="text-foreground">{new Date(store.meetingDatetime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span></li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Sign Up Prompt */}
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Save your results &amp; book your meeting</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Create a free account to save your recommendations, book your orientation meeting, and track your progress.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/auth/register?callbackUrl=/questionnaire">
                    <Button size="lg">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Free Account
                    </Button>
                  </Link>
                  <Link href="/auth/login?callbackUrl=/questionnaire">
                    <Button variant="outline" size="lg">
                      Already have an account? Sign In
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Restart option */}
              <Button
                variant="ghost"
                onClick={() => {
                  setCompleted(false);
                  store.reset();
                }}
                className="text-muted-foreground"
              >
                ← Start Over
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] py-8 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header with avatar and progress */}
        <div className="flex items-center gap-4 mb-6">
          <AssistantAvatar country={avatarCountry} size="sm" />
          <div className="flex-1">
            <ProgressBar current={store.currentStep + 1} total={TOTAL_STEPS} />
          </div>
        </div>

        {/* Chat-style questionnaire */}
        <div className="bg-card border border-border rounded-2xl p-6 min-h-[500px] flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={store.currentStep}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Step 0: Goal Selection */}
                {store.currentStep === 0 && (
                  <>
                    <ChatMessage type="assistant">
                      <p className="font-medium">
                        Welcome! 👋 I&apos;m your orientation assistant.
                      </p>
                      <p className="mt-2 text-sm opacity-90">
                        What are you looking for? Select the option that best
                        describes your goal.
                      </p>
                    </ChatMessage>

                    <div className="grid gap-3 mt-4">
                      {GOALS.map((goal) => (
                        <motion.button
                          key={goal.value}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => store.setGoal(goal.value as Goal)}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                            store.goal === goal.value
                              ? "border-accent bg-accent/5 shadow-sm"
                              : "border-border bg-card hover:border-accent-light"
                          }`}
                        >
                          <span className="text-2xl">{goal.icon}</span>
                          <div>
                            <p className="font-semibold text-foreground">
                              {goal.label}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {goal.description}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 1: Country Selection */}
                {store.currentStep === 1 && (
                  <>
                    <ChatMessage type="assistant">
                      <p className="font-medium">Great choice! 🌍</p>
                      <p className="mt-2 text-sm opacity-90">
                        Which country interests you the most? Select one to continue.
                      </p>
                    </ChatMessage>

                    {store.goal && (
                      <ChatMessage type="user">
                        <p className="text-sm">
                          {GOALS.find((g) => g.value === store.goal)?.icon}{" "}
                          {GOALS.find((g) => g.value === store.goal)?.label}
                        </p>
                      </ChatMessage>
                    )}

                    <WorldMap
                      onSelect={(country) => store.setCountry(country as Country)}
                      selected={store.country}
                    />
                  </>
                )}

                {/* Step 2: English Level */}
                {store.currentStep === 2 && (
                  <>
                    <ChatMessage type="assistant">
                      <p className="font-medium">
                        {COUNTRIES.find((c) => c.code === store.country)?.flag}{" "}
                        Excellent choice!
                      </p>
                      <p className="mt-2 text-sm opacity-90">
                        What is your current English proficiency level?
                      </p>
                    </ChatMessage>

                    <LanguageSelector
                      label="Your English Level"
                      value={store.englishLevel}
                      onChange={(level) => store.setEnglishLevel(level as CEFRLevel)}
                    />
                  </>
                )}

                {/* Step 3: Native Language Level */}
                {store.currentStep === 3 && (
                  <>
                    <ChatMessage type="assistant">
                      <p className="font-medium">Perfect! 📝</p>
                      <p className="mt-2 text-sm opacity-90">
                        What is your current level in {getCountryLanguageName()}?
                        If you&apos;re a complete beginner, select A1.
                      </p>
                    </ChatMessage>

                    <LanguageSelector
                      label={`Your ${getCountryLanguageName()} Level`}
                      value={store.nativeLevel}
                      onChange={(level) => store.setNativeLevel(level as CEFRLevel)}
                    />
                  </>
                )}

                {/* Step 4: Program Selection */}
                {store.currentStep === 4 && (
                  <>
                    <ChatMessage type="assistant">
                      <p className="font-medium">Here are programs for you! 🎯</p>
                      <p className="mt-2 text-sm opacity-90">
                        Based on your profile, these programs are available.
                        Select the ones that interest you.
                      </p>
                    </ChatMessage>

                    <div className="space-y-3 mt-4">
                      {getFilteredCourses().map((course) => (
                        <ProgramCard
                          key={course.id}
                          course={course}
                          selected={store.selectedPrograms.includes(course.id)}
                          onToggle={store.toggleProgram}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Step 5: Meeting Scheduling */}
                {store.currentStep === 5 && (
                  <>
                    <ChatMessage type="assistant">
                      <p className="font-medium">Almost done! 📅</p>
                      <p className="mt-2 text-sm opacity-90">
                        Let&apos;s schedule a meeting with our orientation experts to
                        discuss your options in detail.
                      </p>
                    </ChatMessage>

                    <TimeSlotPicker
                      onSelect={store.setMeetingDatetime}
                      selected={store.meetingDatetime}
                    />
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={store.prevStep}
              disabled={store.currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            {store.currentStep < TOTAL_STEPS - 1 ? (
              <Button onClick={store.nextStep} disabled={!canProceed()}>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={!canProceed() || saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Finishing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    See My Results
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
