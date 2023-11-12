import dns from 'dns'
import trackEvent from './mixpanel'

const getIPAddressFromURL = (url: string): Promise<string> => {
  const hostname = new URL(url).hostname

  return new Promise((resolve, reject) => {
    dns.resolve(hostname, (error, addresses) => {
      if (error) {
        reject(error)
      }
      resolve(addresses[0] as string)
    })
  })
}

interface IGreenHostingResponse {
  url: string
  hosted_by: string
  hosted_by_website: string
  green: boolean
  modified: string
  supporting_documents: {
    id: number
    title: string
    link: string
  }[]
}

// info about greenliness of the server
const getGreenHostingData = async (
  url: string
): Promise<IGreenHostingResponse> => {
  const hostname = new URL(url).hostname

  const serverGreenDataResponse = await fetch(
    `https://api.thegreenwebfoundation.org/api/v3/greencheck/${hostname}`,
    {
      method: 'GET',
    }
  )
  const greenHostingData =
    (await serverGreenDataResponse.json()) as IGreenHostingResponse

  return greenHostingData
}

interface ICarbonIntensityResponse {
  carbon_intensity: number
  country_name: string
  country_code_iso_2: string
  carbon_intensity_type: string
  country_code_iso_3: string
  generation_from_fossil: number
  year: number
  checked_ip: string
}

const calculateCarbonIntensityFromIP = async (url: string) => {
  const ipAddress = await getIPAddressFromURL(url)

  if (!ipAddress) return

  const co2IntensityResponse = await fetch(
    `https://api.thegreenwebfoundation.org/api/v3/ip-to-co2intensity/${ipAddress}`,
    {
      method: 'GET',
    }
  )

  const intensityData =
    (await co2IntensityResponse.json()) as ICarbonIntensityResponse

  return intensityData
}

interface IHostingData {
  carbonIntensityData: ICarbonIntensityResponse | undefined
  greenHostingData: IGreenHostingResponse | undefined
}

export const calculateHostingData = async (
  url: string
): Promise<IHostingData> => {
  trackEvent('hosting_start')

  let carbonIntensityData
  let greenHostingData

  try {
    const [carbonRes, hostingRes] = await Promise.all([
      calculateCarbonIntensityFromIP(url),
      getGreenHostingData(url),
    ])

    carbonIntensityData = carbonRes
    greenHostingData = hostingRes
  } catch (e) {
    trackEvent('hosting_error', {
      error: e?.toString(),
    })

    throw e
  }

  trackEvent('hosting_end')

  return { carbonIntensityData, greenHostingData }
}
