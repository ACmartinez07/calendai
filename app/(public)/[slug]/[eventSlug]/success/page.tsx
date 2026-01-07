import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, Calendar, Clock, User, Mail } from 'lucide-react'
import Link from 'next/link'

interface SuccessPageProps {
  params: Promise<{ slug: string; eventSlug: string }>
  searchParams: Promise<{ bookingId?: string }>
}

export default async function SuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { slug } = await params
  const { bookingId } = await searchParams

  if (!bookingId) {
    notFound()
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      eventType: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  })

  if (!booking) {
    notFound()
  }

  const formattedDate = format(
    booking.startTime,
    "EEEE, d 'de' MMMM 'de' yyyy",
    { locale: es }
  )
  const formattedTime = format(booking.startTime, 'h:mm a')
  const endTime = format(booking.endTime, 'h:mm a')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold">¡Reserva confirmada!</h1>
              <p className="text-muted-foreground mt-1">
                Te hemos enviado un email de confirmación
              </p>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div
                className="h-1 w-12 rounded"
                style={{ backgroundColor: booking.eventType.color }}
              />

              <h2 className="font-semibold text-lg">
                {booking.eventType.title}
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>con {booking.eventType.user.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formattedDate}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formattedTime} - {endTime} ({booking.eventType.duration}{' '}
                    min)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.guestEmail}</span>
                </div>
              </div>

              {booking.guestNotes && (
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium mb-1">Notas:</p>
                  <p className="text-muted-foreground">{booking.guestNotes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <Button asChild className="w-full">
                <Link href={`/${slug}`}>Agendar otra cita</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Ir al inicio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
