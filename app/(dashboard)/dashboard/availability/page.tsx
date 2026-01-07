import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { AvailabilityForm } from '@/components/availability/availability-form'

export default async function AvailabilityPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const availability = await prisma.availability.findMany({
    where: { userId: session.user.id },
    orderBy: { dayOfWeek: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Disponibilidad</h1>
        <p className="text-muted-foreground">
          Configura los horarios en los que tus clientes pueden agendar citas
        </p>
      </div>

      <AvailabilityForm initialData={availability} />
    </div>
  )
}
