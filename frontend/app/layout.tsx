import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'CanopyROI — Urban Tree Equity Auditor',
  description: 'Satellite-driven urban canopy optimisation and ESG reporting for Pune',
  keywords: ['urban trees', 'ESG', 'carbon offset', 'Pune', 'sustainability', 'canopy'],
}

export const viewport: Viewport = {
  themeColor: '#7d8f32',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        {/* DM Sans + DM Mono via Google Fonts – preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream-100 text-bark-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
