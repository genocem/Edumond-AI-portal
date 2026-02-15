"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Calendar, Sparkles } from "lucide-react";
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

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromChat = searchParams.get("from") === "chat";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingData, setSavingData] = useState(false);

  const store = useQuestionnaireStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = trpc.auth.register.useMutation();
  const saveResponsesMutation = trpc.questionnaire.saveResponses.useMutation();
  const meetingMutation = trpc.meetings.create.useMutation();

  /** After registration + auto-login, save the chat data if coming from questionnaire. */
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
      console.error("Error saving questionnaire data after registration:", err);
    } finally {
      setSavingData(false);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setError(null);

    try {
      // 1. Register
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // 2. Auto-login after registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed — send them to login
        router.push("/auth/login?registered=true");
        return;
      }

      // 3. If coming from chat, save questionnaire data (now we're authed)
      if (fromChat) {
        await saveQuestionnaireData();
        router.push("/profile");
      } else {
        router.push("/profile");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  // Show context about what will be saved if coming from chat
  const hasChatData = fromChat && store.extracted.goal;

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            {fromChat
              ? "Sign up to save your results & confirm your meeting"
              : "Join Digital Minds and start your journey"}
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
                  <li className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Meeting:{" "}
                    <span className="text-foreground">
                      {new Date(store.meetingDatetime).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Input
              id="name"
              label="Full Name"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register("name")}
            />

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

            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending || savingData}
            >
              {registerMutation.isPending || savingData ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {savingData
                    ? "Saving your data..."
                    : "Creating account..."}
                </>
              ) : fromChat ? (
                "Create Account & Save Results"
              ) : (
                "Create Account"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href={
                  fromChat
                    ? "/auth/login?callbackUrl=/questionnaire&from=chat"
                    : "/auth/login"
                }
                className="text-accent hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
