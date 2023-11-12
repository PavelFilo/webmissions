import Mixpanel from 'mixpanel'

const mixpanelApi = Mixpanel.init(
  process.env.NEXT_PUBLIC_MIXPANEL_API_KEY || ''
)

const trackEvent = (
  eventName: string,
  options?: Record<string, string | undefined>
) => {
  mixpanelApi.track(eventName, {
    distinct_id: '1234567890',
    environment: process.env.NODE_ENV,
    ...options,
  })
}

export default trackEvent
