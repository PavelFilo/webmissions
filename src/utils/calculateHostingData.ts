import dns from 'dns'
import trackEvent from './mixpanel'
import fossil_share_by_countries from './countries_fossil_share.json'

export const getIPAddressFromURL = async (url: string): Promise<string> => {
  const hostname = new URL(url).hostname

  const addresses = await dns.promises.resolve(hostname)

  return addresses[0] as string
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

interface ICountryResponse {
  ip: string
  country_code: string
  country_name: string
  city: string
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

export const getCountryFromIpAddress = async (ipAddress: string) => {
  if (ipAddress === '::1' || !ipAddress) return

  {
    return await fetch(
      `http://api.ipstack.com/${ipAddress}?access_key=f66864527662e0b11ef8ae1048809b91`
    )
  }
}

const calculateFossilShareFromIP = async (url: string) => {
  const ipAddress = await getIPAddressFromURL(url)

  const countryResponse = (await getCountryFromIpAddress(ipAddress))!

  const countryObj = (await countryResponse.json()) as ICountryResponse

  const fossilShare = fossil_share_by_countries.find(
    ({ name }) => name === countryObj.country_name
  )?.fossil_share

  if (!fossilShare) {
    return fossil_share_by_countries.find(({ name }) => name === 'World')
      ?.fossil_share as number
  }
  return fossilShare
}

interface IHostingData {
  carbonIntensityData: ICarbonIntensityResponse | undefined
  greenHostingData: IGreenHostingResponse | undefined
  fossilShareData: number | undefined
}

export const calculateHostingData = async (
  url: string
): Promise<IHostingData> => {
  trackEvent('hosting_start')

  let carbonIntensityData
  let greenHostingData
  let fossilShareData

  try {
    const [carbonRes, hostingRes, fossilShare] = await Promise.all([
      calculateCarbonIntensityFromIP(url),
      getGreenHostingData(url),
      calculateFossilShareFromIP(url),
    ])

    carbonIntensityData = carbonRes
    greenHostingData = hostingRes
    fossilShareData = fossilShare
  } catch (e) {
    trackEvent('hosting_error', {
      error: e?.toString(),
    })

    throw e
  }

  trackEvent('hosting_end')

  return { carbonIntensityData, greenHostingData, fossilShareData }
}
