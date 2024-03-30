import { type Metadata } from 'next'
import { TRPCReactProvider } from '~/trpc/react'
import { cookies } from 'next/headers'

import '~/styles/globals.css'
import trackEvent from '~/utils/mixpanel'

export const metadata: Metadata = {
  title: 'WebMissions | Odhadnite uhlíkovú stopu svojho webu',
  description: 'Odhadnite uhlíkovú stopu svojho webu',
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
      <body className="bg-palette-primary">
        <div className="min-h-screen overflow-x-hidden">
          <TRPCReactProvider cookies={cookies().toString()}>
            {children}
          </TRPCReactProvider>
        </div>
      </body>
    </html>
  )
}
