"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  Star,
  Clock,
  Edit2,
  Save,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { formatDate, getInitials } from "@/lib/utils";
import { createGoogleCalendarUrl } from "@/lib/google-calendar";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const profileQuery = trpc.auth.getProfile.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const updateMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      profileQuery.refetch();
      setEditing(false);
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/profile");
    }
  }, [status, router]);

  useEffect(() => {
    if (profileQuery.data?.name) {
      setEditName(profileQuery.data.name);
    }
  }, [profileQuery.data]);

  if (status === "loading" || profileQuery.isLoading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading profile...
        </div>
      </div>
    );
  }

  const user = profileQuery.data;
  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-10rem)] py-8 px-4">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-accent">
                    {getInitials(user.name || "U")}
                  </span>
                </div>
                <div className="flex-1">
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="max-w-xs"
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          updateMutation.mutate({ name: editName })
                        }
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-foreground">
                        {user.name}
                      </h1>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditing(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Questionnaire Responses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-accent" />
                  Questionnaire History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.responses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No questionnaire responses yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => router.push("/questionnaire")}
                    >
                      Take Questionnaire
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user.responses.map((response) => (
                      <div
                        key={response.id}
                        className="p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{response.goal}</Badge>
                            <Badge variant="secondary">
                              {response.country}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(response.createdAt)}
                          </span>
                        </div>
                        <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
                          <span>English: {response.englishLevel}</span>
                          {response.nativeLevel && (
                            <span>• Native: {response.nativeLevel}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Meetings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-accent" />
                  Scheduled Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.meetings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No meetings scheduled.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user.meetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        className="p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-accent" />
                            <span className="text-sm font-medium">
                              {formatDate(meeting.datetime)}
                            </span>
                          </div>
                          <Badge
                            variant={
                              meeting.status === "SCHEDULED"
                                ? "success"
                                : meeting.status === "COMPLETED"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {meeting.status}
                          </Badge>
                        </div>
                        {meeting.status === "SCHEDULED" && (
                          <div className="mt-2">
                            <a
                              href={createGoogleCalendarUrl({
                                summary: "EduBud Orientation Meeting",
                                description:
                                  "Your orientation consultation with EduBud advisors",
                                startTime: new Date(
                                  meeting.datetime,
                                ).toISOString(),
                                endTime: new Date(
                                  new Date(meeting.datetime).getTime() +
                                    60 * 60 * 1000,
                                ).toISOString(),
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Add to Google Calendar
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Saved Programs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-accent" />
                  Saved Programs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.savedPrograms.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No saved programs yet.</p>
                    <p className="text-xs mt-1">
                      Complete the questionnaire to get program recommendations.
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {user.savedPrograms.map((sp) => (
                      <div
                        key={sp.id}
                        className="p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {sp.programId}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Saved on {formatDate(sp.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Account Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-accent" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="text-sm font-medium">Email Verification</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Badge variant={user.emailVerified ? "success" : "warning"}>
                    {user.emailVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div>
                    <p className="text-sm font-medium">Change Password</p>
                    <p className="text-xs text-muted-foreground">
                      Update your account password
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
