import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { BookingConfirmForm } from '@/components/booking/booking-confirm-form'
import { format, parse } from 'date-fns'
import { es } from 'date-fns/locale'

interface ConfirmPageProps {
  params: Promise<{ slug: string; eventSlug: string }>
  searchParams: Promise<{ date?: string; time?: string }>
}

export default async function ConfirmPage({
  params,
  searchParams,
}: ConfirmPageProps) {
  const { slug, eventSlug } = await params
  const { date, time } = await searchParams

  if (!date || !time) {
    notFound()
  }

  const user = await prisma.user.findUnique({
    where: { slug },
    include: {
      eventTypes: {
        where: { slug: eventSlug, isActive: true },
      },
    },
  })

  if (!user || user.eventTypes.length === 0) {
    notFound()
  }

  const eventType = user.eventTypes[0]

  // Parsear la fecha
  const selectedDate = parse(date, 'yyyy-MM-dd', new Date())
  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: es,
  })

  // Formatear hora
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  const formattedTime = `${hour12}:${minutes} ${ampm}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <BookingConfirmForm
          user={{
            name: user.name,
            slug: user.slug!,
          }}
          eventType={{
            id: eventType.id,
            title: eventType.title,
            slug: eventType.slug,
            duration: eventType.duration,
            color: eventType.color,
          }}
          date={date}
          time={time}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
        />
      </div>
    </div>
  )
}
