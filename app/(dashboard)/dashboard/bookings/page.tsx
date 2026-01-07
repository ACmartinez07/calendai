import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { BookingsList } from '@/components/booking/bookings-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function BookingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const now = new Date()

  const [upcoming, past] = await Promise.all([
    prisma.booking.findMany({
      where: {
        eventType: { userId: session.user.id },
        startTime: { gte: now },
        status: { not: 'CANCELLED' },
      },
      include: {
        eventType: {
          select: { title: true, duration: true, color: true },
        },
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.booking.findMany({
      where: {
        eventType: { userId: session.user.id },
        OR: [{ startTime: { lt: now } }, { status: 'CANCELLED' }],
      },
      include: {
        eventType: {
          select: { title: true, duration: true, color: true },
        },
      },
      orderBy: { startTime: 'desc' },
      take: 50,
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reservas</h1>
        <p className="text-muted-foreground">
          Gestiona las citas agendadas por tus clientes
        </p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Próximas ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">Pasadas ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <BookingsList
            bookings={upcoming}
            emptyMessage="No tienes citas próximas"
          />
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          <BookingsList
            bookings={past}
            emptyMessage="No hay citas pasadas"
            isPast
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
