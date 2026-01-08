import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'CalendAI - Sistema de Reservas Inteligente',
    template: '%s | CalendAI',
  },
  description:
    'Agenda citas sin el ir y venir de emails. CalendAI es tu sistema de reservas con integración a Google Calendar, notificaciones automáticas y página pública personalizada.',
  keywords: [
    'reservas online',
    'agendar citas',
    'calendario',
    'google calendar',
    'scheduling',
    'booking system',
  ],
  authors: [{ name: 'Andrés Camilo Martínez' }],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://calendai.vercel.app',
    title: 'CalendAI - Sistema de Reservas Inteligente',
    description:
      'Agenda citas sin el ir y venir de emails. Sincronización con Google Calendar incluida.',
    siteName: 'CalendAI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalendAI - Sistema de Reservas Inteligente',
    description:
      'Agenda citas sin el ir y venir de emails. Sincronización con Google Calendar incluida.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
