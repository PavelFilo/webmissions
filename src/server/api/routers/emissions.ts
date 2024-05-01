import { z } from 'zod'
import { env } from '~/env.mjs'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import {
  calculateHostingData,
  getCountryFromIpAddress,
  getIPAddressFromURL,
} from '~/utils/calculateHostingData'
import { calculatePageSize } from '~/utils/calculatePageSize'
import trackEvent from '~/utils/mixpanel'

const convertToMegaBytes = (bytes: number) => bytes / (1024 * 1024)
const convertToGigaBytes = (bytes: number) => bytes / (1024 * 1024 * 1024)

const GREEN_SERVER_INTENSITY = 50

export const emissionsRouter = createTRPCRouter({
  getEmissions: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const ip = await getIPAddressFromURL(input.url)
      console.log(ip)
      if (ip) throw new Error('Aplikacia je momentalne pozastavena!')

      if (!ip) {
        return {
          url: input.url,
          total: 0,
          emissionResults: [],
        }
      }

      trackEvent('calculation_start')

      const emissionResults = []
      let clientCountry
      const clientIp = ctx.headers.get('x-forwarded-for')?.split(',')[0] || ''
      try {
        const clientCountryRes = await getCountryFromIpAddress(clientIp)

        clientCountry = (await clientCountryRes?.json()) as
          | { country_name: string }
          | undefined
      } catch (e) {
        trackEvent('country_error', {
          error: e?.toString(),
        })
      }

      const [
        sizes,
        { carbonIntensityData, greenHostingData, fossilShareData },
      ] = await Promise.all([
        calculatePageSize(input.url),
        calculateHostingData(input.url),
      ])

      if (sizes) {
        emissionResults.push({
          category: 'Veľkosť (cached)',
          value: `${convertToMegaBytes(sizes.firstLoad).toFixed(
            2
          )} MB (${convertToMegaBytes(sizes.secondLoad).toFixed(2)} MB)`,
          description: 'Veľkosť stránky v megabajtoch',
        })
        if (sizes.determinedCoverage) {
          emissionResults.push({
            category: 'Využitie kódu',
            value: `${(
              (sizes.determinedCoverage.cssUsedBytes /
                sizes.determinedCoverage.cssTotalBytes) *
              100
            ).toFixed(1)} % CSS, ${(
              (sizes.determinedCoverage.jsUsedBytes /
                sizes.determinedCoverage.jsTotalBytes) *
              100
            ).toFixed(1)} % JS`,
            description: 'Využitý kód CSS a JS na stránke',
          })
        }
      } else {
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
          value: `${
            greenHostingData?.green
              ? GREEN_SERVER_INTENSITY
              : carbonIntensityData.carbon_intensity.toFixed(2)
          } g/kWh`,
          description:
            'Ročná intenzita Co2 servera (' +
            carbonIntensityData.country_name +
            ')',
        })

        if (fossilShareData)
          emissionResults.push({
            category: 'Podiel fossilných palív',
            value: `${carbonIntensityData.generation_from_fossil}%`,
            description:
              'Podiel fossilných palív zdrojov energie krajiny v ktorej je stránka hostovaná',
          })
      }

      const energyPerFirstVisit =
        convertToGigaBytes(sizes?.firstLoad) * 0.81 * 0.75
      const energyPerSecondVisit =
        convertToGigaBytes(sizes?.secondLoad) * 0.81 * 0.25

      // The calculation energyPerVisit = [Data Transfer per Visit (new visitors) in GB x 0.81 kWh/GB x 0.75] + [Data Transfer per Visit (returning visitors) in GB x 0.81 kWh/GB x 0.25 x 0.02]
      const totalEmissions =
        (energyPerFirstVisit + energyPerSecondVisit) *
        (greenHostingData?.green
          ? GREEN_SERVER_INTENSITY
          : carbonIntensityData?.carbon_intensity || 0)

      try {
        await fetch(env.NEXT_PUBLIC_DYNAMODB_URL, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            url: input.url,
            total: totalEmissions,
            categories: [
              {
                sizes,
                greenHosting: greenHostingData?.green,
                carbonIntensity: carbonIntensityData?.carbon_intensity,
                hostingCountry: carbonIntensityData?.country_name,
                fossilShare: fossilShareData,
                fossilShareFromAPI: carbonIntensityData?.generation_from_fossil,
                clientCountry: clientCountry?.country_name,
                clientIp: clientIp,
                determinedCoverage: sizes?.determinedCoverage,
                determinedCoverageCssPercentual: sizes?.determinedCoverage
                  ? sizes.determinedCoverage.cssUsedBytes /
                    sizes.determinedCoverage.cssTotalBytes
                  : 0,
                determinedCoverageJsPercentual: sizes?.determinedCoverage
                  ? sizes.determinedCoverage.jsUsedBytes /
                    sizes.determinedCoverage.jsTotalBytes
                  : 0,
              },
            ],
          }),
        })
      } catch (e) {
        trackEvent('db_push_error', {
          error: e?.toString(),
        })

        throw e
      }

      trackEvent('calculation_end_success')

      return {
        url: input.url,
        total: totalEmissions,
        emissionResults,
      }
    }),
})
