import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const activityRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.activity.findUnique({ where: { id: input.id } });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.activity.findMany();
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(5),
        city: z.string().default(""),
        address: z.string().default(""),
        zip_code: z
          .string()
          .default("")
          .transform((s) => s.replace(" ", "")),
        info: z.string().default(""),
        rrule: z.string(),
        time_start: z.string(),
        time_end: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.activity.create({ data: input });
    }),
});
