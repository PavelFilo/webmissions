import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { calculateHostingData } from '~/utils/calculateHostingData'
import { calculatePageSize } from '~/utils/calculatePageSize'
import trackEvent from '~/utils/mixpanel'

const convertToMegaBytes = (bytes: number) => bytes / (1024 * 1024)
const convertToGigaBytes = (bytes: number) => bytes / (1024 * 1024 * 1024)

export const emissionsRouter = createTRPCRouter({
  getEmissions: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input }) => {
      trackEvent('calculation_start')

      const emissionResults = []
      const [
        sizes,
        { carbonIntensityData, greenHostingData, fossilShareData },
      ] = await Promise.all([
        calculatePageSize(input.url),
        calculateHostingData(input.url),
      ])

      if (sizes)
        emissionResults.push({
          category: 'Size (second load)',
          value: `${convertToMegaBytes(sizes.firstLoad).toFixed(
            2
          )} MB (${convertToMegaBytes(sizes.secondLoad).toFixed(2)} MB)`,
          description: 'Size of the page in megabytes',
        })

      if (greenHostingData)
        emissionResults.push({
          category: 'Host type',
          value: greenHostingData.green ? 'Green' : 'Not Green',
          description: 'Web host type from which is website domain served',
        })

      if (carbonIntensityData) {
        emissionResults.push({
          category: 'Co2 intensity',
          value: carbonIntensityData.carbon_intensity.toFixed(2),
          description: 'Annual Co2 intensity of server',
        })

        if (fossilShareData)
          emissionResults.push({
            category: 'Fossil share',
            value: `${carbonIntensityData.generation_from_fossil}%`,
            description:
              'Share of fossil electricity sources of the country from which the website is hosted',
          })
      }

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

      const energyPerFirstVisit =
        convertToGigaBytes(sizes?.firstLoad) * 0.81 * 0.75
      const energyPerSecondVisit =
        convertToGigaBytes(sizes?.secondLoad) * 0.81 * 0.25

      // The calculation energyPerVisit = [Data Transfer per Visit (new visitors) in GB x 0.81 kWh/GB x 0.75] + [Data Transfer per Visit (returning visitors) in GB x 0.81 kWh/GB x 0.25 x 0.02]
      const totalEmissions =
        (energyPerFirstVisit + energyPerSecondVisit) *
        (carbonIntensityData?.carbon_intensity || 0)

      return {
        url: input.url,
        total: totalEmissions,
        emissionResults,
      }
    }),
})
