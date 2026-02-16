import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { guidedChat, getOpeningGreeting } from "@/lib/gemini";

export const aiRouter = router({
  /** Get the opening greeting that kicks off the conversation. */
  greeting: publicProcedure.query(async () => {
    const result = await getOpeningGreeting();
    return result;
  }),

  /** Send a message in the guided conversation. The AI extracts structured
   *  data and determines the next phase automatically. */
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        currentData: z.object({
          goal: z.string().nullable().optional(),
          country: z.string().nullable().optional(),
          englishLevel: z.string().nullable().optional(),
          nativeLevel: z.string().nullable().optional(),
          selectedPrograms: z.array(z.string()).optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await guidedChat(
        input.messages,
        input.currentData || {}
      );
      return result;
    }),
});
