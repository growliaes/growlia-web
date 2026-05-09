import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Growlia — AI Marketing Agent for SMBs',
  description: 'Manage and optimize your Meta Ads, Google Ads, and TikTok Ads campaigns with AI. Connect in seconds, get insights instantly.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
