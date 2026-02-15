"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useQuestionnaireStore } from "@/lib/store";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const fromChat = searchParams.get("from") === "chat";
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingData, setSavingData] = useState(false);

  const store = useQuestionnaireStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const saveResponsesMutation = trpc.questionnaire.saveResponses.useMutation();
  const meetingMutation = trpc.meetings.create.useMutation();

  /** After login, save the chat data if coming from questionnaire. */
  const saveQuestionnaireData = async () => {
    if (!fromChat) return;
    if (!store.extracted.goal || !store.extracted.country) return;

    setSavingData(true);
    try {
      // Save questionnaire responses
      await saveResponsesMutation.mutateAsync({
        goal: store.extracted.goal as "study_abroad" | "job" | "training",
        country: store.extracted.country,
        englishLevel: store.extracted.englishLevel || "B1",
        nativeLevel: store.extracted.nativeLevel || undefined,
        selectedPrograms: store.selectedPrograms,
      });

      // Save meeting if one was scheduled
      if (store.meetingDatetime) {
        await meetingMutation.mutateAsync({
          datetime: store.meetingDatetime,
          notes: `Goal: ${store.extracted.goal}, Country: ${store.extracted.country}, English: ${store.extracted.englishLevel}`,
        });
      }

      // Clear the store
      store.reset();
    } catch (err) {
      console.error("Error saving questionnaire data after login:", err);
    } finally {
      setSavingData(false);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (fromChat) {
        // Coming from chat — save questionnaire data, then go to profile
        await saveQuestionnaireData();
        router.push("/profile");
        router.refresh();
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show context about what will be saved if coming from chat
  const hasChatData = fromChat && store.extracted.goal;

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            {fromChat
              ? "Sign in to save your results & confirm your meeting"
              : "Sign in to your EduBud account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Context card when coming from chat */}
          {hasChatData && (
            <div className="mb-6 p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="h-4 w-4 text-accent" />
                Your orientation results will be saved:
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                {store.extracted.goal && (
                  <li>
                    🎯 Goal:{" "}
                    <span className="text-foreground">
                      {store.extracted.goal === "study_abroad"
                        ? "Study Abroad"
                        : store.extracted.goal === "job"
                          ? "Job / Ausbildung"
                          : "Professional Training"}
                    </span>
                  </li>
                )}
                {store.extracted.country && (
                  <li>
                    🌍 Country:{" "}
                    <span className="text-foreground capitalize">
                      {store.extracted.country}
                    </span>
                  </li>
                )}
                {store.selectedPrograms.length > 0 && (
                  <li>
                    📚 Programs:{" "}
                    <span className="text-foreground">
                      {store.selectedPrograms.length} selected
                    </span>
                  </li>
                )}
                {store.meetingDatetime && (
                  <li>
                    📅 Meeting:{" "}
                    <span className="text-foreground">
                      {new Date(store.meetingDatetime).toLocaleString()}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {registered && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm">
                <CheckCircle className="h-4 w-4" />
                Account created successfully! Please sign in.
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="relative">
              <Input
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-accent hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || savingData}
            >
              {savingData ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving your results...
                </>
              ) : loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href={
                  fromChat
                    ? `/auth/register?callbackUrl=/questionnaire&from=chat`
                    : "/auth/register"
                }
                className="text-accent hover:underline font-medium"
              >
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
