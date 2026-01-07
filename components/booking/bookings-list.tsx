'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cancelBooking } from '@/actions/bookings'
import { toast } from 'sonner'
import {
  Calendar,
  Clock,
  User,
  Mail,
  MoreVertical,
  XCircle,
  MessageSquare,
} from 'lucide-react'

interface Booking {
  id: string
  guestName: string
  guestEmail: string
  guestNotes: string | null
  startTime: Date
  endTime: Date
  status: string
  eventType: {
    title: string
    duration: number
    color: string
  }
}

interface BookingsListProps {
  bookings: Booking[]
  emptyMessage: string
  isPast?: boolean
}

export function BookingsList({
  bookings,
  emptyMessage,
  isPast = false,
}: BookingsListProps) {
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  async function handleCancel() {
    if (!cancelId) return

    setIsCancelling(true)
    const result = await cancelBooking(cancelId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Reserva cancelada')
    }

    setIsCancelling(false)
    setCancelId(null)
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  // Agrupar por fecha
  const grouped = bookings.reduce(
    (acc, booking) => {
      const dateKey = format(new Date(booking.startTime), 'yyyy-MM-dd')
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(booking)
      return acc
    },
    {} as Record<string, Booking[]>
  )

  return (
    <>
      <div className="space-y-6">
        {Object.entries(grouped).map(([dateKey, dateBookings]) => (
          <div key={dateKey}>
            <h3 className="font-medium text-sm text-muted-foreground mb-3">
              {format(new Date(dateKey), "EEEE, d 'de' MMMM", { locale: es })}
            </h3>
            <div className="space-y-3">
              {dateBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-1 h-full min-h-15 rounded"
                        style={{ backgroundColor: booking.eventType.color }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {booking.eventType.title}
                              </h4>
                              {booking.status === 'CANCELLED' && (
                                <Badge variant="destructive">Cancelada</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(
                                  new Date(booking.startTime),
                                  'h:mm a'
                                )}{' '}
                                - {format(new Date(booking.endTime), 'h:mm a')}
                              </span>
                            </div>
                          </div>

                          {!isPast && booking.status !== 'CANCELLED' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => setCancelId(booking.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancelar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {booking.guestName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {booking.guestEmail}
                          </span>
                        </div>

                        {booking.guestNotes && (
                          <div className="mt-2 flex items-start gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="h-3 w-3 mt-0.5" />
                            <span className="line-clamp-2">
                              {booking.guestNotes}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Se notificará al cliente sobre la cancelación. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? 'Cancelando...' : 'Sí, cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
