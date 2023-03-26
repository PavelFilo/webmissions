import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const emissionsRouter = createTRPCRouter({
  getEmissions: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(({ input }) => {
      return {
        url: input.url,
        total: 28,
        emissionResults: [],
      }
    }),
})
