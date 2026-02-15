import coursesData from "@/data/courses.json";
import type { CourseData, Recommendation } from "@/types";

interface MatchInput {
  goal: string;
  country: string;
  englishLevel: string;
  nativeLevel: string | null;
}

const LEVEL_ORDER: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6,
  Beginner: 1,
  Intermediate: 3,
  Advanced: 5,
};

function getAllCourses(): CourseData[] {
  const courses: CourseData[] = [];

  if (coursesData.courses.language_courses) {
    courses.push(
      ...(coursesData.courses.language_courses as unknown as CourseData[])
    );
  }
  if (coursesData.courses.test_preparation_courses) {
    courses.push(
      ...(coursesData.courses.test_preparation_courses as unknown as CourseData[])
    );
  }
  if (coursesData.courses.other_training_categories) {
    courses.push(
      ...(coursesData.courses.other_training_categories as unknown as CourseData[])
    );
  }

  return courses;
}

function getLevelScore(userLevel: string, requiredLevels: string[]): number {
  const userLevelNum = LEVEL_ORDER[userLevel] || 0;
  if (userLevelNum === 0) return 0.5;

  // Find the best matching level
  let bestMatch = 0;
  for (const level of requiredLevels) {
    const requiredNum = LEVEL_ORDER[level] || 0;
    if (requiredNum === 0) continue;

    if (userLevelNum >= requiredNum) {
      // User meets or exceeds the level
      const diff = userLevelNum - requiredNum;
      const score = diff === 0 ? 1.0 : Math.max(0.6, 1.0 - diff * 0.15);
      bestMatch = Math.max(bestMatch, score);
    } else {
      // User is below the level
      const diff = requiredNum - userLevelNum;
      const score = Math.max(0.2, 0.7 - diff * 0.2);
      bestMatch = Math.max(bestMatch, score);
    }
  }

  return bestMatch || 0.3;
}

function getGoalScore(
  goal: string,
  course: CourseData
): { score: number; reason: string } {
  const category = course.category;

  switch (goal) {
    case "study_abroad":
      if (category === "language") return { score: 0.9, reason: "Language preparation for study abroad" };
      if (category === "test_prep") return { score: 1.0, reason: "Test preparation essential for university admission" };
      if (category === "training") return { score: 0.5, reason: "Supplementary training program" };
      break;
    case "job":
      if (category === "language") return { score: 0.8, reason: "Language skills needed for work" };
      if (category === "training") return { score: 1.0, reason: "Professional training for career development" };
      if (category === "test_prep") return { score: 0.4, reason: "Language certification may help" };
      break;
    case "training":
      if (category === "training") return { score: 1.0, reason: "Directly matches training goal" };
      if (category === "language") return { score: 0.7, reason: "Language skills support training" };
      if (category === "test_prep") return { score: 0.5, reason: "Certification can complement training" };
      break;
  }

  return { score: 0.3, reason: "General relevance" };
}

export function matchPrograms(input: MatchInput): Recommendation[] {
  const allCourses = getAllCourses();
  const recommendations: Recommendation[] = [];

  for (const course of allCourses) {
    // Filter: course must be available in the selected country
    if (!course.countries.includes(input.country)) continue;

    const matchReasons: string[] = [];
    let totalScore = 0;

    // 1. Language proficiency match (40%)
    const levelToCheck =
      course.category === "language" && course.countries.length === 1
        ? input.nativeLevel || input.englishLevel
        : input.englishLevel;
    const langScore = getLevelScore(levelToCheck, course.levels);
    totalScore += langScore * 0.4;
    if (langScore >= 0.7)
      matchReasons.push(`Your language level matches well with this course`);

    // 2. Goal alignment (30%)
    const goalResult = getGoalScore(input.goal, course);
    totalScore += goalResult.score * 0.3;
    if (goalResult.score >= 0.7) matchReasons.push(goalResult.reason);

    // 3. Format preference (15%)
    const formatScore = course.format.includes("En ligne") ? 0.9 : 0.7;
    totalScore += formatScore * 0.15;
    if (course.format.includes("En ligne"))
      matchReasons.push("Available online for flexibility");

    // 4. Availability/capacity (15%)
    const capacityScore = 0.8; // Default good availability
    totalScore += capacityScore * 0.15;

    recommendations.push({
      courseId: course.id,
      courseName: course.name,
      matchScore: Math.round(totalScore * 100),
      matchReasons,
      category: course.category,
    });
  }

  // Sort by match score descending and return top 5
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  return recommendations.slice(0, 5);
}
