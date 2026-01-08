import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  Globe,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  CalendarCheck,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CalendarCheck className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">CalendAI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Empezar gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Zap className="h-4 w-4" />
          Integración con Google Calendar
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          Agenda citas sin el <span className="text-blue-600">ir y venir</span>{' '}
          de emails
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          CalendAI es tu sistema de reservas inteligente. Comparte tu
          disponibilidad, recibe reservas automáticamente y sincroniza todo con
          tu calendario.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/login">
              Crear mi página gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link href="#features">Ver características</Link>
          </Button>
        </div>

        {/* Social proof */}
        <p className="mt-10 text-sm text-gray-500">
          Usado por profesionales independientes, consultores y equipos pequeños
        </p>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Todo lo que necesitas para gestionar tus citas
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Olvídate de los emails interminables y las llamadas para coordinar
            horarios
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.bg}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
            <p className="text-gray-600">Tres simples pasos para empezar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="bg-blue-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Empieza a recibir reservas hoy
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Crea tu cuenta gratuita en menos de 2 minutos. Sin tarjeta de
            crédito.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="text-lg px-8"
          >
            <Link href="/login">
              Crear mi cuenta gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">CalendAI</span>
            </div>
            <p className="text-sm text-gray-500">CalendAI.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-900">
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: 'Sincronización con Google Calendar',
    description:
      'Tus reservas se agregan automáticamente a tu calendario. Nunca más tendrás conflictos de horario.',
    icon: Calendar,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Disponibilidad inteligente',
    description:
      'Define tus horarios disponibles y CalendAI solo muestra los slots libres a tus clientes.',
    icon: Clock,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    title: 'Página pública personalizada',
    description:
      'Obtén tu propia URL para compartir con clientes. Ellos reservan, tú solo confirmas.',
    icon: Globe,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    title: 'Notificaciones automáticas',
    description:
      'Emails de confirmación instantáneos y recordatorios 24h antes de cada cita.',
    icon: Zap,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
  {
    title: 'Múltiples tipos de cita',
    description:
      'Crea diferentes servicios con distintas duraciones, colores y descripciones.',
    icon: CheckCircle,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    title: 'Seguro y confiable',
    description:
      'Tus datos están protegidos. Autenticación segura con tu cuenta de Google.',
    icon: Shield,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
]

const steps = [
  {
    title: 'Crea tu cuenta',
    description: 'Regístrate con tu cuenta de Google en menos de 30 segundos.',
  },
  {
    title: 'Configura tu disponibilidad',
    description: 'Define los días y horarios en los que puedes recibir citas.',
  },
  {
    title: 'Comparte tu link',
    description:
      'Envía tu URL personalizada y empieza a recibir reservas automáticamente.',
  },
]
