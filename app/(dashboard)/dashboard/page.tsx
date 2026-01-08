import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Clock,
  Users,
  ExternalLink,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { CopyLinkButton } from '@/components/dashboard/copy-link-button'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [
    user,
    todayBookings,
    weekBookings,
    totalBookings,
    cancelledBookings,
    upcomingBookings,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { slug: true, name: true },
    }),
    prisma.booking.count({
      where: {
        eventType: { userId: session.user.id },
        status: 'CONFIRMED',
        startTime: { gte: startOfToday, lt: endOfToday },
      },
    }),
    prisma.booking.count({
      where: {
        eventType: { userId: session.user.id },
        status: 'CONFIRMED',
        startTime: { gte: startOfWeek, lt: endOfWeek },
      },
    }),
    prisma.booking.count({
      where: {
        eventType: { userId: session.user.id },
      },
    }),
    prisma.booking.count({
      where: {
        eventType: { userId: session.user.id },
        status: 'CANCELLED',
      },
    }),
    prisma.booking.findMany({
      where: {
        eventType: { userId: session.user.id },
        status: 'CONFIRMED',
        startTime: { gte: now },
      },
      include: {
        eventType: {
          select: { title: true, color: true, duration: true },
        },
      },
      orderBy: { startTime: 'asc' },
      take: 5,
    }),
  ])

  const cancellationRate =
    totalBookings > 0
      ? Math.round((cancelledBookings / totalBookings) * 100)
      : 0

  const publicUrl = user?.slug
    ? `${process.env.NEXTAUTH_URL}/${user.slug}`
    : null

  const stats = [
    {
      title: 'Citas hoy',
      value: todayBookings,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Esta semana',
      value: weekBookings,
      icon: CalendarCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Total reservas',
      value: totalBookings,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Tasa cancelación',
      value: `${cancellationRate}%`,
      icon: CalendarX,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          ¡Hola, {user?.name?.split(' ')[0] || 'Usuario'}!
        </h1>
        <p className="text-muted-foreground">
          Aquí está el resumen de tu actividad
        </p>
      </div>

      {/* Link público */}
      {publicUrl && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-50 p-2">
                  <ExternalLink className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Tu página de reservas</p>
                  <p className="text-sm text-muted-foreground">{publicUrl}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <CopyLinkButton url={publicUrl} />
                <Button asChild variant="outline" size="sm">
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    Visitar
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Próximas citas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Próximas citas</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/bookings">Ver todas</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tienes citas próximas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <div
                    className="w-1 h-12 rounded"
                    style={{ backgroundColor: booking.eventType.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {booking.eventType.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.guestName} · {booking.guestEmail}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">
                      {format(new Date(booking.startTime), 'd MMM', {
                        locale: es,
                      })}
                    </p>
                    <p className="text-muted-foreground">
                      {format(new Date(booking.startTime), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
