import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { matchPrograms } from "@/lib/ai-matcher";

export const questionnaireRouter = router({
  saveResponses: protectedProcedure
    .input(
      z.object({
        goal: z.enum(["study_abroad", "job", "training"]),
        country: z.string(),
        englishLevel: z.string(),
        nativeLevel: z.string().optional(),
        selectedPrograms: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate recommendations
      const recommendations = matchPrograms({
        goal: input.goal,
        country: input.country,
        englishLevel: input.englishLevel,
        nativeLevel: input.nativeLevel || null,
      });

      const response = await ctx.prisma.response.create({
        data: {
          userId: ctx.session.user.id,
          goal: input.goal,
          country: input.country,
          englishLevel: input.englishLevel,
          nativeLevel: input.nativeLevel,
          selectedPrograms: input.selectedPrograms,
          recommendations: JSON.parse(JSON.stringify(recommendations)),
        },
      });

      return { response, recommendations };
    }),

  getResponses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.response.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  getLatestResponse: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.response.findFirst({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  getRecommendations: protectedProcedure
    .input(
      z.object({
        goal: z.enum(["study_abroad", "job", "training"]),
        country: z.string(),
        englishLevel: z.string(),
        nativeLevel: z.string().optional(),
      })
    )
    .query(({ input }) => {
      return matchPrograms({
        goal: input.goal,
        country: input.country,
        englishLevel: input.englishLevel,
        nativeLevel: input.nativeLevel || null,
      });
    }),
});
