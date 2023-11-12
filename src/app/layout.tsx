import { type Metadata } from 'next'
import { TRPCReactProvider } from '~/trpc/react'
import { cookies } from 'next/headers'

import '~/styles/globals.css'
import trackEvent from '~/utils/mixpanel'

export const metadata: Metadata = {
  title: 'WebMissions | Get the co2 Emissions of your Web',
  description: 'Get the co2 Emissions of your Web',
  manifest: '/manifest.json',
  themeColor: '#EF4444',
  icons: [{ rel: 'apple-touch-icon', url: '/apple-icon.png' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  trackEvent('page_opened', {
    distinct_id: '1234567890',
  })

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen overflow-x-hidden">
          <TRPCReactProvider cookies={cookies().toString()}>
            {children}
          </TRPCReactProvider>
        </div>
      </body>
    </html>
  )
}