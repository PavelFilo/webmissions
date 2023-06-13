import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { calculateHostingData } from '~/utils/calculateHostingData'
import { calculatePageSize } from '~/utils/calculatePageSize'

export const emissionsRouter = createTRPCRouter({
  getEmissions: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input }) => {
      const emissionResults = []
      const fullSize = await calculatePageSize(input.url)
      const { carbonIntensityData, greenHostingData } =
        await calculateHostingData(input.url)

      if (fullSize)
        emissionResults.push({
          category: 'Size',
          value: `${(fullSize / (1024 * 1024)).toFixed(2)} MB`,
          description: 'Size of the page in megabytes',
        })

      if (carbonIntensityData)
        emissionResults.push({
          category: 'Co2 intensity',
          value: carbonIntensityData.carbon_intensity.toFixed(2),
          description: 'Annual Co2 intensity of server',
        })

      if (greenHostingData)
        emissionResults.push({
          category: 'Host type',
          value: greenHostingData.green ? 'Green' : 'Not Green',
          description: 'Web host type from which is website domain served',
        })

      return {
        url: input.url,

        total: 0, // totalEmissions,
        emissionResults,
      }
    }),
})
