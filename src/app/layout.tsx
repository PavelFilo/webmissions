import { type Metadata } from 'next'
import { TRPCReactProvider } from '~/trpc/react'
import { cookies } from 'next/headers'

import '~/styles/globals.css'

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
