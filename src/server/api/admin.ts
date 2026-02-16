import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const adminRouter = router({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [totalUsers, totalMeetings, scheduledMeetings, totalResponses] =
      await Promise.all([
        ctx.prisma.user.count(),
        ctx.prisma.meeting.count(),
        ctx.prisma.meeting.count({ where: { status: "SCHEDULED" } }),
        ctx.prisma.response.count(),
      ]);

    // Goal distribution
    const responses = await ctx.prisma.response.findMany({
      select: { goal: true },
    });
    const goalDistribution = responses.reduce(
      (acc, r) => {
        acc[r.goal] = (acc[r.goal] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Country distribution
    const countryResponses = await ctx.prisma.response.findMany({
      select: { country: true },
    });
    const countryDistribution = countryResponses.reduce(
      (acc, r) => {
        acc[r.country] = (acc[r.country] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalUsers,
      totalMeetings,
      scheduledMeetings,
      totalResponses,
      goalDistribution,
      countryDistribution,
    };
  }),

  getUsers: adminProcedure
    .input(
      z
        .object({
          page: z.number().default(1),
          limit: z.number().default(20),
          search: z.string().optional(),
          role: z.enum(["USER", "ADMIN"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page || 1;
      const limit = input?.limit || 20;

      const where: Record<string, unknown> = {};
      if (input?.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
        ];
      }
      if (input?.role) {
        where.role = input.role;
      }

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            _count: { select: { responses: true, meetings: true } },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.prisma.user.count({ where }),
      ]);

      return { users, total, pages: Math.ceil(total / limit) };
    }),

  getUserDetail: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          responses: { orderBy: { createdAt: "desc" } },
          meetings: { orderBy: { datetime: "desc" } },
          savedPrograms: true,
        },
      });
    }),

  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["USER", "ADMIN"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });
    }),
});
