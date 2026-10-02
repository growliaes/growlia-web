import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

export const metadata: Metadata = {
  title: 'Growlia, tu equipo de performance marketing',
  description: 'Growlia analiza y optimiza tus campañas de Google Ads y Meta Ads cada día, con criterio de experto y tu aprobación en cada cambio.',
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
    <html lang="es" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  )
}
