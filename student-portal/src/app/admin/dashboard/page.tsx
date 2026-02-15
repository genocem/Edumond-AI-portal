"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  BarChart3,
  FileText,
  Search,
  ChevronDown,
  Eye,
  Download,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [meetingFilter, setMeetingFilter] = useState<string | undefined>(undefined);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && !isAdmin) {
      router.push("/");
    }
  }, [status, isAdmin, router]);

  const statsQuery = trpc.admin.getStats.useQuery(undefined, {
    enabled: isAdmin,
  });

  const meetingsQuery = trpc.meetings.getAll.useQuery(
    meetingFilter
      ? { status: meetingFilter as "SCHEDULED" | "COMPLETED" | "CANCELLED" }
      : undefined,
    { enabled: isAdmin }
  );

  const usersQuery = trpc.admin.getUsers.useQuery(
    { search: userSearch || undefined },
    { enabled: isAdmin }
  );

  const userDetailQuery = trpc.admin.getUserDetail.useQuery(
    { userId: selectedUser! },
    { enabled: !!selectedUser && isAdmin }
  );

  const updateStatusMutation = trpc.meetings.updateStatus.useMutation({
    onSuccess: () => {
      meetingsQuery.refetch();
      statsQuery.refetch();
    },
  });

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
    },
  });

  if (status === "loading" || !isAdmin) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const stats = statsQuery.data;

  const exportData = () => {
    if (!meetingsQuery.data?.meetings) return;
    const csv = [
      "ID,User,Email,Date,Status,Notes",
      ...meetingsQuery.data.meetings.map((m) =>
        [
          m.id,
          m.user.name || "",
          m.user.email,
          new Date(m.datetime).toISOString(),
          m.status,
          m.notes || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meetings-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] py-8 px-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users, meetings, and view analytics
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Users,
              label: "Total Users",
              value: stats?.totalUsers || 0,
              color: "text-blue-500",
            },
            {
              icon: Calendar,
              label: "Total Meetings",
              value: stats?.totalMeetings || 0,
              color: "text-accent",
            },
            {
              icon: Clock,
              label: "Scheduled",
              value: stats?.scheduledMeetings || 0,
              color: "text-success",
            },
            {
              icon: FileText,
              label: "Responses",
              value: stats?.totalResponses || 0,
              color: "text-warning",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`${stat.color}`}>
                      <stat.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Distribution Charts */}
        {stats && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Goal Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.goalDistribution).map(([goal, count]) => (
                    <div key={goal} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-28 capitalize">
                        {goal.replace(/_/g, " ")}
                      </span>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{
                            width: `${((count as number) / stats.totalResponses) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {count as number}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Country Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.countryDistribution).map(([country, count]) => (
                    <div key={country} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-28 capitalize">
                        {country}
                      </span>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-light rounded-full transition-all"
                          style={{
                            width: `${((count as number) / stats.totalResponses) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {count as number}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Meetings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-accent" />
                  Meetings
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      className="appearance-none bg-card border border-border rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={meetingFilter || ""}
                      onChange={(e) => setMeetingFilter(e.target.value || undefined)}
                    >
                      <option value="">All Status</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <Button variant="outline" size="sm" onClick={exportData}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetingsQuery.data?.meetings?.map((meeting) => (
                      <tr
                        key={meeting.id}
                        className="border-b border-border hover:bg-muted/30"
                      >
                        <td className="py-3 px-2 font-medium">
                          {meeting.user.name || "—"}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {meeting.user.email}
                        </td>
                        <td className="py-3 px-2">
                          {formatDate(meeting.datetime)}
                        </td>
                        <td className="py-3 px-2">
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
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            {meeting.status === "SCHEDULED" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      meetingId: meeting.id,
                                      status: "COMPLETED",
                                    })
                                  }
                                  title="Mark completed"
                                >
                                  <CheckCircle className="h-4 w-4 text-success" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      meetingId: meeting.id,
                                      status: "CANCELLED",
                                    })
                                  }
                                  title="Cancel"
                                >
                                  <XCircle className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setSelectedUser(meeting.user.id)
                              }
                              title="View user"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {meetingsQuery.data?.meetings?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No meetings found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-accent" />
                  User Management
                </CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Responses</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Meetings</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Joined</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersQuery.data?.users?.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-border hover:bg-muted/30"
                      >
                        <td className="py-3 px-2 font-medium">
                          {user.name || "—"}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            variant={
                              user.role === "ADMIN" ? "default" : "outline"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">{user._count.responses}</td>
                        <td className="py-3 px-2">{user._count.meetings}</td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedUser(user.id)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                updateRoleMutation.mutate({
                                  userId: user.id,
                                  role: user.role === "ADMIN" ? "USER" : "ADMIN",
                                })
                              }
                              title={`Make ${user.role === "ADMIN" ? "user" : "admin"}`}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {usersQuery.data?.users?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Detail Modal */}
        {selectedUser && userDetailQuery.data && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {userDetailQuery.data.name || "User Details"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {userDetailQuery.data.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Role</h4>
                  <Badge
                    variant={
                      userDetailQuery.data.role === "ADMIN"
                        ? "default"
                        : "outline"
                    }
                  >
                    {userDetailQuery.data.role}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Responses ({userDetailQuery.data.responses.length})
                  </h4>
                  {userDetailQuery.data.responses.map((r) => (
                    <div
                      key={r.id}
                      className="p-2 rounded-lg bg-muted/50 mb-2 text-sm"
                    >
                      <div className="flex gap-2">
                        <Badge variant="outline">{r.goal}</Badge>
                        <Badge variant="secondary">{r.country}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        English: {r.englishLevel} | Created:{" "}
                        {formatDate(r.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Meetings ({userDetailQuery.data.meetings.length})
                  </h4>
                  {userDetailQuery.data.meetings.map((m) => (
                    <div
                      key={m.id}
                      className="p-2 rounded-lg bg-muted/50 mb-2 text-sm flex justify-between items-center"
                    >
                      <span>{formatDate(m.datetime)}</span>
                      <Badge
                        variant={
                          m.status === "SCHEDULED"
                            ? "success"
                            : m.status === "COMPLETED"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {m.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
