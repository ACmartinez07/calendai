import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EventTypeList } from '@/components/events/event-type-list'
import { Plus } from 'lucide-react'

export default async function EventsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [eventTypes, user] = await Promise.all([
    prisma.eventType.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { slug: true },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tipos de Evento</h1>
          <p className="text-muted-foreground">
            Gestiona los tipos de citas que ofreces
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo evento
          </Link>
        </Button>
      </div>

      <EventTypeList eventTypes={eventTypes} userSlug={user?.slug || null} />
    </div>
  )
}
