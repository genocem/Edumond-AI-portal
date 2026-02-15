import { router } from "./trpc";
import { authRouter } from "./api/auth";
import { questionnaireRouter } from "./api/questionnaire";
import { programsRouter } from "./api/programs";
import { meetingsRouter } from "./api/meetings";
import { adminRouter } from "./api/admin";

export const appRouter = router({
  auth: authRouter,
  questionnaire: questionnaireRouter,
  programs: programsRouter,
  meetings: meetingsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
