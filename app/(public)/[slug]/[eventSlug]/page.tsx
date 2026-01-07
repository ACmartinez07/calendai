import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { BookingCalendar } from '@/components/booking/booking-calendar'

interface BookingPageProps {
  params: Promise<{ slug: string; eventSlug: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { slug, eventSlug } = await params

  const user = await prisma.user.findUnique({
    where: { slug },
    include: {
      eventTypes: {
        where: { slug: eventSlug, isActive: true },
      },
      availability: {
        where: { isEnabled: true },
      },
    },
  })

  if (!user || user.eventTypes.length === 0) {
    notFound()
  }

  const eventType = user.eventTypes[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <BookingCalendar
          user={{
            id: user.id,
            name: user.name,
            image: user.image,
            slug: user.slug!,
            timezone: user.timezone,
          }}
          eventType={{
            id: eventType.id,
            title: eventType.title,
            slug: eventType.slug,
            description: eventType.description,
            duration: eventType.duration,
            color: eventType.color,
          }}
          availability={user.availability}
        />
      </div>
    </div>
  )
}
