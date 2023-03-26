import { createTRPCRouter } from '~/server/api/trpc'
import { emissionsRouter } from '~/server/api/routers/emissions'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  emissions: emissionsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
