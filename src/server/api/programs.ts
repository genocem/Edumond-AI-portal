import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import coursesData from "@/data/courses.json";
import type { CourseData } from "@/types";

// Flatten all courses from different categories
function getAllCourses(): CourseData[] {
  const courses: CourseData[] = [];

  if (coursesData.courses.language_courses) {
    courses.push(...(coursesData.courses.language_courses as unknown as CourseData[]));
  }
  if (coursesData.courses.test_preparation_courses) {
    courses.push(...(coursesData.courses.test_preparation_courses as unknown as CourseData[]));
  }
  if (coursesData.courses.other_training_categories) {
    courses.push(...(coursesData.courses.other_training_categories as unknown as CourseData[]));
  }

  return courses;
}

export const programsRouter = router({
  getAll: publicProcedure.query(() => {
    return getAllCourses();
  }),

  getByCountry: publicProcedure
    .input(z.object({ country: z.string() }))
    .query(({ input }) => {
      const allCourses = getAllCourses();
      return allCourses.filter((course) =>
        course.countries.includes(input.country)
      );
    }),

  getByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) => {
      const allCourses = getAllCourses();
      return allCourses.filter((course) => course.category === input.category);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const allCourses = getAllCourses();
      return allCourses.find((course) => course.id === input.id) || null;
    }),

  getStudyAbroad: publicProcedure
    .input(z.object({ country: z.string().optional() }))
    .query(({ input }) => {
      const data = coursesData.other_services.etudes_a_l_etranger;
      if (input.country) {
        const countryData = (data.countries as Record<string, unknown>)[input.country];
        return { ...data, selectedCountry: countryData };
      }
      return data;
    }),

  getAusbildung: publicProcedure.query(() => {
    return coursesData.other_services.ausbildung_en_allemagne;
  }),

  saveProgram: protectedProcedure
    .input(z.object({ programId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.savedProgram.upsert({
        where: {
          userId_programId: {
            userId: ctx.session.user.id,
            programId: input.programId,
          },
        },
        create: {
          userId: ctx.session.user.id,
          programId: input.programId,
        },
        update: {},
      });
    }),

  unsaveProgram: protectedProcedure
    .input(z.object({ programId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.savedProgram.delete({
        where: {
          userId_programId: {
            userId: ctx.session.user.id,
            programId: input.programId,
          },
        },
      });
    }),

  getSavedPrograms: protectedProcedure.query(async ({ ctx }) => {
    const saved = await ctx.prisma.savedProgram.findMany({
      where: { userId: ctx.session.user.id },
    });
    const allCourses = getAllCourses();
    return saved.map((s) => ({
      ...s,
      course: allCourses.find((c) => c.id === s.programId),
    }));
  }),
});
