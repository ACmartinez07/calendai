import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Users } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()

  // Obtener estadísticas básicas
  const [eventTypesCount, bookingsToday] = await Promise.all([
    prisma.eventType.count({
      where: { userId: session?.user?.id, isActive: true },
    }),
    prisma.booking.count({
      where: {
        eventType: { userId: session?.user?.id },
        startTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: 'CONFIRMED',
      },
    }),
  ])

  const stats = [
    {
      title: 'Citas hoy',
      value: bookingsToday,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Tipos de evento',
      value: eventTypesCount,
      icon: Clock,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de control
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Primeros pasos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-blue-50 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Configura tu perfil</h3>
                <p className="text-sm text-muted-foreground">
                  Añade tu información y elige tu URL personalizada
                </p>
              </div>
              <a
                href="/dashboard/settings"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Configurar →
              </a>
            </div>

            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-green-50 p-2">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Crea tu primer tipo de evento</h3>
                <p className="text-sm text-muted-foreground">
                  Define qué tipos de citas ofreces
                </p>
              </div>
              <a
                href="/dashboard/events"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Crear →
              </a>
            </div>

            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-purple-50 p-2">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Define tu disponibilidad</h3>
                <p className="text-sm text-muted-foreground">
                  Configura los horarios en los que estás disponible
                </p>
              </div>
              <a
                href="/dashboard/availability"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Configurar →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
