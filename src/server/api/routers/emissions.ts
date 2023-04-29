import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { calculatePageSize } from '~/utils/calculatePageSize'

export const emissionsRouter = createTRPCRouter({
  getEmissions: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input }) => {
      // fetch data from external input.url and get size of response
      const fullSize = await calculatePageSize(input.url)

      const visitors = 1000 // number of visitors
      const serverConsumption = 0.2 // kWh per hour
      const serverEmissions = 0.0005 // kg CO2e per kWh
      const deviceConsumption = 0.1 // kWh per hour
      const deviceEmissions = 0.0002 // kg CO2e per kWh

      const serverEmissionsTotal =
        serverConsumption * visitors * serverEmissions
      const deviceEmissionsTotal =
        deviceConsumption * visitors * deviceEmissions
      const contentEmissionsTotal = fullSize * visitors * deviceEmissions
      const totalEmissions =
        serverEmissionsTotal + deviceEmissionsTotal + contentEmissionsTotal

      return {
        url: input.url,

        total: totalEmissions,
        emissionResults: [
          {
            category: 'Size',
            value: fullSize,
            description: 'Size of the page in bytes',
          },
        ],
      }
    }),
})
