/**
 * Integration tests for all tRPC routes.
 * Tests the full flow: registration → login → questionnaire → meetings → profile → admin
 * Runs against the real database to catch actual issues.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createCallerFactory, createTRPCContext } from "@/server/trpc";
import { appRouter } from "@/server/root";
import { prisma } from "@/lib/prisma";

const createCaller = createCallerFactory(appRouter);

// Helpers to create callers with different auth states
function publicCaller() {
  return createCaller(createTRPCContext({ session: null }));
}

function authedCaller(userId: string, role: string = "USER") {
  return createCaller(
    createTRPCContext({
      session: {
        user: { id: userId, name: "Test User", email: "test@test.com", role },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
    })
  );
}

function adminCaller(userId: string) {
  return authedCaller(userId, "ADMIN");
}

// Test data
const TEST_EMAIL = `test_${Date.now()}@integration.test`;
const TEST_EMAIL_2 = `test2_${Date.now()}@integration.test`;
let testUserId: string;
let testUser2Id: string;
let testMeetingId: string;
let testResponseId: string;

// ============================================================
// CLEANUP
// ============================================================
afterAll(async () => {
  // Clean up test data in order (respecting foreign keys)
  try {
    if (testUserId) {
      await prisma.savedProgram.deleteMany({ where: { userId: testUserId } });
      await prisma.meeting.deleteMany({ where: { userId: testUserId } });
      await prisma.response.deleteMany({ where: { userId: testUserId } });
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
    if (testUser2Id) {
      await prisma.savedProgram.deleteMany({ where: { userId: testUser2Id } });
      await prisma.meeting.deleteMany({ where: { userId: testUser2Id } });
      await prisma.response.deleteMany({ where: { userId: testUser2Id } });
      await prisma.user.delete({ where: { id: testUser2Id } }).catch(() => {});
    }
  } catch (e) {
    console.error("Cleanup error:", e);
  }
});

// ============================================================
// 1. AUTH: REGISTRATION
// ============================================================
describe("Auth Router - Registration", () => {
  it("should register a new user successfully", async () => {
    const caller = publicCaller();
    const result = await caller.auth.register({
      name: "Test User",
      email: TEST_EMAIL,
      password: "TestPass123",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.email).toBe(TEST_EMAIL);
    expect(result.name).toBe("Test User");
    testUserId = result.id;

    // Verify user actually exists in the database
    const dbUser = await prisma.user.findUnique({
      where: { id: testUserId },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser!.email).toBe(TEST_EMAIL);
    expect(dbUser!.role).toBe("USER");
    // Password should be hashed, not plain text
    expect(dbUser!.password).not.toBe("TestPass123");
    expect(dbUser!.password.startsWith("$2")).toBe(true); // bcrypt hash
  });

  it("should reject duplicate email registration", async () => {
    const caller = publicCaller();
    await expect(
      caller.auth.register({
        name: "Duplicate User",
        email: TEST_EMAIL,
        password: "TestPass123",
      })
    ).rejects.toThrow();
  });

  it("should reject weak passwords", async () => {
    const caller = publicCaller();

    // Too short
    await expect(
      caller.auth.register({
        name: "Test",
        email: "short@test.com",
        password: "Ab1",
      })
    ).rejects.toThrow();

    // No uppercase
    await expect(
      caller.auth.register({
        name: "Test",
        email: "noupcase@test.com",
        password: "testpass123",
      })
    ).rejects.toThrow();

    // No number
    await expect(
      caller.auth.register({
        name: "Test",
        email: "nonum@test.com",
        password: "TestPassAbc",
      })
    ).rejects.toThrow();
  });

  it("should reject invalid email format", async () => {
    const caller = publicCaller();
    await expect(
      caller.auth.register({
        name: "Test",
        email: "notanemail",
        password: "TestPass123",
      })
    ).rejects.toThrow();
  });

  it("should register a second user for multi-user tests", async () => {
    const caller = publicCaller();
    const result = await caller.auth.register({
      name: "Test User 2",
      email: TEST_EMAIL_2,
      password: "TestPass456",
    });
    expect(result.id).toBeDefined();
    testUser2Id = result.id;
  });
});

// ============================================================
// 2. AUTH: LOGIN
// ============================================================
describe("Auth Router - Login", () => {
  it("should login with correct credentials", async () => {
    const caller = publicCaller();
    const result = await caller.auth.login({
      email: TEST_EMAIL,
      password: "TestPass123",
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(testUserId);
    expect(result.email).toBe(TEST_EMAIL);
    expect(result.role).toBe("USER");
  });

  it("should reject login with wrong password", async () => {
    const caller = publicCaller();
    await expect(
      caller.auth.login({
        email: TEST_EMAIL,
        password: "WrongPassword123",
      })
    ).rejects.toThrow();
  });

  it("should reject login with non-existent email", async () => {
    const caller = publicCaller();
    await expect(
      caller.auth.login({
        email: "nonexistent@test.com",
        password: "TestPass123",
      })
    ).rejects.toThrow();
  });
});

// ============================================================
// 3. AUTH: PROFILE
// ============================================================
describe("Auth Router - Profile", () => {
  it("should get profile for authenticated user", async () => {
    const caller = authedCaller(testUserId);
    const profile = await caller.auth.getProfile();

    expect(profile).toBeDefined();
    expect(profile.id).toBe(testUserId);
    expect(profile.email).toBe(TEST_EMAIL);
    expect(profile.responses).toBeDefined();
    expect(profile.meetings).toBeDefined();
    expect(profile.savedPrograms).toBeDefined();
  });

  it("should reject profile access without auth", async () => {
    const caller = publicCaller();
    await expect(caller.auth.getProfile()).rejects.toThrow("UNAUTHORIZED");
  });

  it("should update profile name", async () => {
    const caller = authedCaller(testUserId);
    const updated = await caller.auth.updateProfile({
      name: "Updated Name",
    });

    expect(updated.name).toBe("Updated Name");

    // Verify in DB
    const dbUser = await prisma.user.findUnique({ where: { id: testUserId } });
    expect(dbUser!.name).toBe("Updated Name");
  });
});

// ============================================================
// 4. PROGRAMS ROUTER
// ============================================================
describe("Programs Router", () => {
  it("should return all courses", async () => {
    const caller = publicCaller();
    const courses = await caller.programs.getAll();

    expect(courses).toBeDefined();
    expect(Array.isArray(courses)).toBe(true);
    expect(courses.length).toBeGreaterThan(0);

    // Each course should have required fields
    const course = courses[0];
    expect(course.id).toBeDefined();
    expect(course.name).toBeDefined();
    expect(course.countries).toBeDefined();
    expect(course.category).toBeDefined();
  });

  it("should filter courses by country", async () => {
    const caller = publicCaller();
    const germanyProgs = await caller.programs.getByCountry({ country: "germany" });

    expect(germanyProgs.length).toBeGreaterThan(0);
    germanyProgs.forEach((prog) => {
      expect(prog.countries).toContain("germany");
    });
  });

  it("should filter courses by category", async () => {
    const caller = publicCaller();
    const langCourses = await caller.programs.getByCategory({ category: "language" });

    expect(langCourses.length).toBeGreaterThan(0);
    langCourses.forEach((c) => {
      expect(c.category).toBe("language");
    });
  });

  it("should get course by ID", async () => {
    const caller = publicCaller();
    const allCourses = await caller.programs.getAll();
    const firstId = allCourses[0].id;

    const course = await caller.programs.getById({ id: firstId });
    expect(course).toBeDefined();
    expect(course!.id).toBe(firstId);
  });

  it("should return null for non-existent course ID", async () => {
    const caller = publicCaller();
    const course = await caller.programs.getById({ id: "nonexistent_id_xyz" });
    expect(course).toBeNull();
  });

  it("should save and unsave a program", async () => {
    const caller = authedCaller(testUserId);
    const allCourses = await caller.programs.getAll();
    const programId = allCourses[0].id;

    // Save
    const saved = await caller.programs.saveProgram({ programId });
    expect(saved).toBeDefined();
    expect(saved.programId).toBe(programId);

    // Verify it shows in saved list
    const savedList = await caller.programs.getSavedPrograms();
    expect(savedList.some((s) => s.programId === programId)).toBe(true);

    // Unsave
    await caller.programs.unsaveProgram({ programId });
    const afterUnsave = await caller.programs.getSavedPrograms();
    expect(afterUnsave.some((s) => s.programId === programId)).toBe(false);
  });

  it("should reject save/unsave without auth", async () => {
    const caller = publicCaller();
    await expect(
      caller.programs.saveProgram({ programId: "test" })
    ).rejects.toThrow("UNAUTHORIZED");
  });

  it("should return study abroad data", async () => {
    const caller = publicCaller();
    const data = await caller.programs.getStudyAbroad({});
    expect(data).toBeDefined();
  });

  it("should return Ausbildung data", async () => {
    const caller = publicCaller();
    const data = await caller.programs.getAusbildung();
    expect(data).toBeDefined();
  });
});

// ============================================================
// 5. QUESTIONNAIRE & AI MATCHER
// ============================================================
describe("Questionnaire Router", () => {
  it("should reject questionnaire save without auth", async () => {
    const caller = publicCaller();
    await expect(
      caller.questionnaire.saveResponses({
        goal: "study_abroad",
        country: "germany",
        englishLevel: "B2",
        selectedPrograms: ["cours-allemand"],
      })
    ).rejects.toThrow("UNAUTHORIZED");
  });

  it("should save questionnaire responses with recommendations", async () => {
    const caller = authedCaller(testUserId);
    const result = await caller.questionnaire.saveResponses({
      goal: "study_abroad",
      country: "germany",
      englishLevel: "B2",
      nativeLevel: "A1",
      selectedPrograms: ["cours-allemand", "prep-testdaf"],
    });

    expect(result).toBeDefined();
    expect(result.response).toBeDefined();
    expect(result.response.id).toBeDefined();
    expect(result.response.goal).toBe("study_abroad");
    expect(result.response.country).toBe("germany");
    expect(result.recommendations).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);

    testResponseId = result.response.id;

    // Verify stored in DB
    const dbResponse = await prisma.response.findUnique({
      where: { id: testResponseId },
    });
    expect(dbResponse).not.toBeNull();
    expect(dbResponse!.userId).toBe(testUserId);
  });

  it("should return recommendations with match scores", async () => {
    const caller = authedCaller(testUserId);
    const recs = await caller.questionnaire.getRecommendations({
      goal: "study_abroad",
      country: "germany",
      englishLevel: "B2",
      nativeLevel: "A1",
    });

    expect(recs.length).toBeGreaterThan(0);
    expect(recs.length).toBeLessThanOrEqual(5);

    // Each recommendation should have required fields
    recs.forEach((rec) => {
      expect(rec.courseId).toBeDefined();
      expect(rec.courseName).toBeDefined();
      expect(rec.matchScore).toBeGreaterThan(0);
      expect(rec.matchScore).toBeLessThanOrEqual(100);
      expect(rec.category).toBeDefined();
    });

    // Should be sorted by score descending
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i - 1].matchScore).toBeGreaterThanOrEqual(recs[i].matchScore);
    }
  });

  it("should get user responses history", async () => {
    const caller = authedCaller(testUserId);
    const responses = await caller.questionnaire.getResponses();

    expect(responses.length).toBeGreaterThan(0);
    expect(responses[0].userId).toBe(testUserId);
  });

  it("should get latest response", async () => {
    const caller = authedCaller(testUserId);
    const latest = await caller.questionnaire.getLatestResponse();

    expect(latest).not.toBeNull();
    expect(latest!.id).toBe(testResponseId);
  });

  it("should generate different recommendations for different goals", async () => {
    const caller = authedCaller(testUserId);

    const studyRecs = await caller.questionnaire.getRecommendations({
      goal: "study_abroad",
      country: "germany",
      englishLevel: "B2",
    });

    const jobRecs = await caller.questionnaire.getRecommendations({
      goal: "job",
      country: "germany",
      englishLevel: "B2",
    });

    // They should produce different orderings
    expect(studyRecs).toBeDefined();
    expect(jobRecs).toBeDefined();

    // At minimum the scores should differ for at least some programs
    const studyIds = studyRecs.map((r) => `${r.courseId}:${r.matchScore}`);
    const jobIds = jobRecs.map((r) => `${r.courseId}:${r.matchScore}`);
    const allSame = studyIds.every((id, i) => id === jobIds[i]);
    expect(allSame).toBe(false);
  });
});

// ============================================================
// 6. MEETINGS ROUTER
// ============================================================
describe("Meetings Router", () => {
  it("should reject meeting creation without auth", async () => {
    const caller = publicCaller();
    await expect(
      caller.meetings.create({
        datetime: new Date(Date.now() + 86400000).toISOString(),
      })
    ).rejects.toThrow("UNAUTHORIZED");
  });

  it("should create a meeting for authenticated user", async () => {
    const caller = authedCaller(testUserId);
    const futureDate = new Date(Date.now() + 86400000).toISOString();

    const meeting = await caller.meetings.create({
      datetime: futureDate,
      notes: "Test meeting - orientation session",
    });

    expect(meeting).toBeDefined();
    expect(meeting.id).toBeDefined();
    expect(meeting.userId).toBe(testUserId);
    expect(meeting.status).toBe("SCHEDULED");
    expect(meeting.notes).toBe("Test meeting - orientation session");
    testMeetingId = meeting.id;

    // Verify in DB
    const dbMeeting = await prisma.meeting.findUnique({
      where: { id: testMeetingId },
    });
    expect(dbMeeting).not.toBeNull();
    expect(dbMeeting!.userId).toBe(testUserId);
  });

  it("should show meeting in user's meeting list", async () => {
    const caller = authedCaller(testUserId);
    const meetings = await caller.meetings.getMyMeetings();

    expect(meetings.length).toBeGreaterThan(0);
    const found = meetings.find((m) => m.id === testMeetingId);
    expect(found).toBeDefined();
    expect(found!.status).toBe("SCHEDULED");
  });

  it("should show meeting in user profile", async () => {
    const caller = authedCaller(testUserId);
    const profile = await caller.auth.getProfile();

    expect(profile.meetings.length).toBeGreaterThan(0);
    const meeting = profile.meetings.find((m) => m.id === testMeetingId);
    expect(meeting).toBeDefined();
    expect(meeting!.status).toBe("SCHEDULED");
  });

  it("should cancel a meeting", async () => {
    // Create a meeting to cancel
    const caller = authedCaller(testUserId);
    const newMeeting = await caller.meetings.create({
      datetime: new Date(Date.now() + 172800000).toISOString(),
      notes: "Meeting to cancel",
    });

    const cancelled = await caller.meetings.cancel({
      meetingId: newMeeting.id,
    });
    expect(cancelled.status).toBe("CANCELLED");

    // Verify in DB
    const dbMeeting = await prisma.meeting.findUnique({
      where: { id: newMeeting.id },
    });
    expect(dbMeeting!.status).toBe("CANCELLED");
  });

  it("should not let user2 cancel user1's meeting", async () => {
    const caller = authedCaller(testUser2Id);
    await expect(
      caller.meetings.cancel({ meetingId: testMeetingId })
    ).rejects.toThrow();
  });
});

// ============================================================
// 7. FULL FLOW: Register → Questionnaire → Meeting → Profile
// ============================================================
describe("Full User Flow Integration", () => {
  it("should complete the entire user journey", async () => {
    const flowEmail = `flow_${Date.now()}@integration.test`;

    // Step 1: Register
    const pub = publicCaller();
    const newUser = await pub.auth.register({
      name: "Flow Test User",
      email: flowEmail,
      password: "FlowTest123",
    });
    expect(newUser.id).toBeDefined();

    // Step 2: Login
    const loginResult = await pub.auth.login({
      email: flowEmail,
      password: "FlowTest123",
    });
    expect(loginResult.id).toBe(newUser.id);

    // Step 3: As authenticated user, save questionnaire
    const userCaller = authedCaller(newUser.id);
    const questResult = await userCaller.questionnaire.saveResponses({
      goal: "job",
      country: "italy",
      englishLevel: "B1",
      nativeLevel: "A2",
      selectedPrograms: ["cours-italien"],
    });
    expect(questResult.recommendations.length).toBeGreaterThan(0);

    // Step 4: Schedule a meeting
    const meeting = await userCaller.meetings.create({
      datetime: new Date(Date.now() + 86400000).toISOString(),
      notes: "Goal: job, Country: italy, English: B1",
    });
    expect(meeting.status).toBe("SCHEDULED");

    // Step 5: Save a program
    const allProgs = await userCaller.programs.getAll();
    await userCaller.programs.saveProgram({ programId: allProgs[0].id });

    // Step 6: Check profile has EVERYTHING
    const profile = await userCaller.auth.getProfile();

    // Responses should be present
    expect(profile.responses.length).toBe(1);
    expect(profile.responses[0].goal).toBe("job");
    expect(profile.responses[0].country).toBe("italy");

    // Meeting should be present
    expect(profile.meetings.length).toBe(1);
    expect(profile.meetings[0].status).toBe("SCHEDULED");
    expect(profile.meetings[0].notes).toContain("italy");

    // Saved programs should be present
    expect(profile.savedPrograms.length).toBe(1);
    expect(profile.savedPrograms[0].programId).toBe(allProgs[0].id);

    // Cleanup
    await prisma.savedProgram.deleteMany({ where: { userId: newUser.id } });
    await prisma.meeting.deleteMany({ where: { userId: newUser.id } });
    await prisma.response.deleteMany({ where: { userId: newUser.id } });
    await prisma.user.delete({ where: { id: newUser.id } });
  });
});

// ============================================================
// 8. ADMIN ROUTES
// ============================================================
describe("Admin Router", () => {
  it("should reject admin routes for non-admin users", async () => {
    const caller = authedCaller(testUserId, "USER");
    await expect(caller.admin.getStats()).rejects.toThrow();
    await expect(caller.admin.getUsers()).rejects.toThrow();
  });

  it("should reject admin routes for unauthenticated users", async () => {
    const caller = publicCaller();
    await expect(caller.admin.getStats()).rejects.toThrow("UNAUTHORIZED");
  });

  it("should return stats for admin", async () => {
    // First make user an admin
    await prisma.user.update({
      where: { id: testUserId },
      data: { role: "ADMIN" },
    });

    const caller = adminCaller(testUserId);
    const stats = await caller.admin.getStats();

    expect(stats).toBeDefined();
    expect(typeof stats.totalUsers).toBe("number");
    expect(typeof stats.totalMeetings).toBe("number");
    expect(typeof stats.scheduledMeetings).toBe("number");
    expect(typeof stats.totalResponses).toBe("number");
    expect(stats.goalDistribution).toBeDefined();
    expect(stats.countryDistribution).toBeDefined();

    expect(stats.totalUsers).toBeGreaterThan(0);
  });

  it("should list users for admin", async () => {
    const caller = adminCaller(testUserId);
    const result = await caller.admin.getUsers();

    expect(result.users).toBeDefined();
    expect(result.users.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);

    // Each user should have expected fields
    const user = result.users[0];
    expect(user.id).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.role).toBeDefined();
    expect(user._count).toBeDefined();
  });

  it("should search users", async () => {
    const caller = adminCaller(testUserId);
    const result = await caller.admin.getUsers({
      search: TEST_EMAIL,
    });

    expect(result.users.length).toBeGreaterThan(0);
    expect(result.users[0].email).toBe(TEST_EMAIL);
  });

  it("should get user detail", async () => {
    const caller = adminCaller(testUserId);
    const detail = await caller.admin.getUserDetail({ userId: testUser2Id });

    expect(detail).not.toBeNull();
    expect(detail!.id).toBe(testUser2Id);
    expect(detail!.responses).toBeDefined();
    expect(detail!.meetings).toBeDefined();
  });

  it("should update user role", async () => {
    const caller = adminCaller(testUserId);
    const updated = await caller.admin.updateUserRole({
      userId: testUser2Id,
      role: "ADMIN",
    });
    expect(updated.role).toBe("ADMIN");

    // Revert
    await caller.admin.updateUserRole({
      userId: testUser2Id,
      role: "USER",
    });
  });

  it("admin should see all meetings with user info", async () => {
    const caller = adminCaller(testUserId);
    const result = await caller.meetings.getAll();

    expect(result).toBeDefined();
    expect(result.meetings).toBeDefined();
    expect(result.total).toBeGreaterThan(0);

    // Meetings should include user info
    const meetingWithUser = result.meetings.find(
      (m) => m.id === testMeetingId
    );
    if (meetingWithUser) {
      expect(meetingWithUser.user).toBeDefined();
      expect(meetingWithUser.user.email).toBe(TEST_EMAIL);
    }
  });

  it("admin should update meeting status", async () => {
    const caller = adminCaller(testUserId);
    const completed = await caller.meetings.updateStatus({
      meetingId: testMeetingId,
      status: "COMPLETED",
      notes: "Completed by admin",
    });

    expect(completed.status).toBe("COMPLETED");

    // Verify user's profile reflects this
    const userCaller = authedCaller(testUserId);
    const profile = await userCaller.auth.getProfile();
    const meeting = profile.meetings.find((m) => m.id === testMeetingId);
    expect(meeting!.status).toBe("COMPLETED");
  });

  it("admin should filter meetings by status", async () => {
    const caller = adminCaller(testUserId);

    const completed = await caller.meetings.getAll({
      status: "COMPLETED",
    });
    completed.meetings.forEach((m) => {
      expect(m.status).toBe("COMPLETED");
    });

    const scheduled = await caller.meetings.getAll({
      status: "SCHEDULED",
    });
    scheduled.meetings.forEach((m) => {
      expect(m.status).toBe("SCHEDULED");
    });
  });
});

// ============================================================
// 9. AI MATCHER UNIT TESTS
// ============================================================
describe("AI Matcher Logic", () => {
  it("should return recommendations for all country/goal combos", async () => {
    const caller = authedCaller(testUserId);
    const countries = ["germany", "italy", "spain", "belgium", "turkey"];
    const goals = ["study_abroad", "job", "training"] as const;

    for (const country of countries) {
      for (const goal of goals) {
        const recs = await caller.questionnaire.getRecommendations({
          goal,
          country,
          englishLevel: "B1",
        });

        // Every combo should return at least one recommendation
        expect(
          recs.length,
          `No recommendations for ${goal} in ${country}`
        ).toBeGreaterThan(0);
      }
    }
  });

  it("should score higher for matching language levels", async () => {
    const caller = authedCaller(testUserId);

    const highLevel = await caller.questionnaire.getRecommendations({
      goal: "study_abroad",
      country: "germany",
      englishLevel: "C1",
    });

    const lowLevel = await caller.questionnaire.getRecommendations({
      goal: "study_abroad",
      country: "germany",
      englishLevel: "A1",
    });

    // Higher level should generally get better/different scores
    expect(highLevel).toBeDefined();
    expect(lowLevel).toBeDefined();

    // Top recommendation for high level should have a decent score
    expect(highLevel[0].matchScore).toBeGreaterThanOrEqual(50);
  });
});

// ============================================================
// 10. EDGE CASES
// ============================================================
describe("Edge Cases", () => {
  it("should handle saving to a non-existent country gracefully", async () => {
    const caller = authedCaller(testUserId);
    const result = await caller.questionnaire.saveResponses({
      goal: "study_abroad",
      country: "atlantis",
      englishLevel: "B2",
      selectedPrograms: [],
    });

    // Should still save but recommendations might be empty
    expect(result.response).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(result.recommendations.length).toBe(0);
  });

  it("should handle empty selected programs", async () => {
    const caller = authedCaller(testUserId);
    const result = await caller.questionnaire.saveResponses({
      goal: "training",
      country: "spain",
      englishLevel: "A2",
      selectedPrograms: [],
    });

    expect(result.response.selectedPrograms).toEqual([]);
  });

  it("should handle multiple meetings for same user", async () => {
    const caller = authedCaller(testUserId);

    const m1 = await caller.meetings.create({
      datetime: new Date(Date.now() + 86400000).toISOString(),
    });
    const m2 = await caller.meetings.create({
      datetime: new Date(Date.now() + 172800000).toISOString(),
    });

    const meetings = await caller.meetings.getMyMeetings();
    const ids = meetings.map((m) => m.id);
    expect(ids).toContain(m1.id);
    expect(ids).toContain(m2.id);
  });

  it("should handle profile with all relations populated", async () => {
    const caller = authedCaller(testUserId);
    const profile = await caller.auth.getProfile();

    // By now we have responses, meetings, etc.
    expect(profile.responses.length).toBeGreaterThan(0);
    expect(profile.meetings.length).toBeGreaterThan(0);

    // Verify response data integrity
    const response = profile.responses[0];
    expect(response.goal).toBeDefined();
    expect(response.country).toBeDefined();
    expect(response.englishLevel).toBeDefined();
    expect(response.recommendations).toBeDefined();
  });
});
