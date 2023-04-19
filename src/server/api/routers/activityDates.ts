import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const activityDateRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.activity.findUnique({ where: { id: input.id } });
    }),

  getAll: protectedProcedure
    .input(z.object({ count: z.number().optional() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.activity.findMany({ take: input.count });
    }),
});
