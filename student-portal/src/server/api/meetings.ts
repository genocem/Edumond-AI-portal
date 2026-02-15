import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const meetingsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        datetime: z.string().datetime(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.meeting.create({
        data: {
          userId: ctx.session.user.id,
          datetime: new Date(input.datetime),
          notes: input.notes,
        },
      });
    }),

  getMyMeetings: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.meeting.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { datetime: "desc" },
    });
  }),

  cancel: protectedProcedure
    .input(z.object({ meetingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.prisma.meeting.findUnique({
        where: { id: input.meetingId },
      });

      if (!meeting || meeting.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return ctx.prisma.meeting.update({
        where: { id: input.meetingId },
        data: { status: "CANCELLED" },
      });
    }),

  // Admin endpoints
  getAll: adminProcedure
    .input(
      z.object({
        status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page || 1;
      const limit = input?.limit || 20;
      const where = input?.status ? { status: input.status as "SCHEDULED" | "COMPLETED" | "CANCELLED" } : {};

      const [meetings, total] = await Promise.all([
        ctx.prisma.meeting.findMany({
          where,
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { datetime: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.prisma.meeting.count({ where }),
      ]);

      return { meetings, total, pages: Math.ceil(total / limit) };
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        meetingId: z.string(),
        status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.meeting.update({
        where: { id: input.meetingId },
        data: { status: input.status, notes: input.notes },
      });
    }),
});
