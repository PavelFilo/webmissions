import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { calculatePageSize } from '~/utils/calculatePageSize'

export const emissionsRouter = createTRPCRouter({
  getEmissions: publicProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input }) => {
      // fetch data from external input.url and get size of response
      const response = await fetch(
        'https://mlalr52pgg.execute-api.eu-north-1.amazonaws.com/prod/calculate?url=' +
          input.url,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers':
              'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
            'X-Api-Key': process.env.NEXT_PUBLIC_AWS_API_KEY || '',
          },
        }
      )

      const fullSize = (await response.json()) as number

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
