import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { calculateHostingData } from '~/utils/calculateHostingData'
import { calculatePageSize } from '~/utils/calculatePageSize'
import trackEvent from '~/utils/mixpanel'

export const emissionsRouter = createTRPCRouter({
  getEmissions: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input }) => {
      trackEvent('calculation_start')

      const emissionResults = []
      const [fullSize, { carbonIntensityData, greenHostingData }] =
        await Promise.all([
          calculatePageSize(input.url),
          calculateHostingData(input.url),
        ])

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

      try {
        await fetch(
          'https://dz41rvp7x4.execute-api.eu-north-1.amazonaws.com/test/results',
          {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              url: input.url,
              total: 1,
              categories: emissionResults.map((result) => ({
                label: result.category,
                value: result.value,
              })),
            }),
          }
        )
      } catch (e) {
        trackEvent('db_push_error', {
          error: e?.toString(),
        })

        throw e
      }

      trackEvent('calculation_end_success')

      return {
        url: input.url,
        total: 0, // totalEmissions,
        emissionResults,
      }
    }),
})
