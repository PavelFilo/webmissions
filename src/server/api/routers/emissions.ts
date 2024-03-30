import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import {
  calculateHostingData,
  getIPAddressFromURL,
} from '~/utils/calculateHostingData'
import { calculatePageSize } from '~/utils/calculatePageSize'
import trackEvent from '~/utils/mixpanel'

const convertToMegaBytes = (bytes: number) => bytes / (1024 * 1024)
const convertToGigaBytes = (bytes: number) => bytes / (1024 * 1024 * 1024)

export const emissionsRouter = createTRPCRouter({
  getEmissions: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input }) => {
      console.log(await getIPAddressFromURL(input.url))

      if (!(await getIPAddressFromURL(input.url))) {
        return {
          url: input.url,
          total: 0,
          emissionResults: [],
        }
      }

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
          category: 'Veľkosť (cached)',
          value: `${convertToMegaBytes(sizes.firstLoad).toFixed(
            2
          )} MB (${convertToMegaBytes(sizes.secondLoad).toFixed(2)} MB)`,
          description: 'Veľkosť stránky v megabajtoch',
        })
      else {
        throw new Error('Nepodarilo sa získať veľkosť stránky!')
      }

      if (greenHostingData)
        emissionResults.push({
          category: 'Typ hostingu',
          value: greenHostingData.green ? 'Udržateľný' : 'Nezistené',
          description: 'Typ zdroja energie z ktorého je aplikácia servovaná',
        })

      if (carbonIntensityData) {
        emissionResults.push({
          category: 'Intenzita Co2',
          value: `${carbonIntensityData.carbon_intensity.toFixed(2)} g/kWh`,
          description: 'Ročná intenzita Co2 servera',
        })

        if (fossilShareData)
          emissionResults.push({
            category: 'Podiel fossilných palív',
            value: `${carbonIntensityData.generation_from_fossil}%`,
            description:
              'Podiel fossilných palív zdrojov energie krajiny v ktorej je stránka hostovaná',
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
        (greenHostingData?.green
          ? 50
          : carbonIntensityData?.carbon_intensity || 0)

      return {
        url: input.url,
        total: totalEmissions,
        emissionResults,
      }
    }),
})
