import { env } from '~/env.mjs'
import trackEvent from './mixpanel'

type Coverage = {
  cssTotalBytes: number
  cssUsedBytes: number
  jsTotalBytes: number
  jsUsedBytes: number
}

type IPageSizeResponse = {
  firstLoad: number
  secondLoad: number
  determinedCoverage?: Coverage
  message?: string
}

export const calculatePageSize = async (
  url: string
): Promise<IPageSizeResponse | null> => {
  // fetch data from external input.url and get size of response
  let sizes

  try {
    const response = await fetch(env.NEXT_PUBLIC_LAMBDA_URL + '?url=' + url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': process.env.NEXT_PUBLIC_AWS_API_KEY || '',
      },
    })

    sizes = (await response.json()) as IPageSizeResponse
  } catch (e) {
    trackEvent('page_size_error', {
      error: e?.toString(),
    })

    throw e
  }

  trackEvent('page_size_success')
  if (!sizes.message) return sizes
  trackEvent('page_size_error', {
    error: sizes.message?.toString(),
  })
  return null
}
