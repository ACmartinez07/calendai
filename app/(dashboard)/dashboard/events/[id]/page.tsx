import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import { EventTypeForm } from '@/components/events/event-type-form'

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const eventType = await prisma.eventType.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!eventType) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar evento</h1>
        <p className="text-muted-foreground">
          Modifica la configuración de este tipo de cita
        </p>
      </div>

      <EventTypeForm eventType={eventType} />
    </div>
  )
}
