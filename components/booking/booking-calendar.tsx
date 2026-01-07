'use client'

import { useState, useMemo, useSyncExternalStore } from 'react'
import { format, addDays, startOfDay, isSameDay, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Clock, Globe } from 'lucide-react'
import Link from 'next/link'

interface Availability {
  dayOfWeek: number
  startTime: string
  endTime: string
  isEnabled: boolean
}

interface BookingCalendarProps {
  user: {
    id: string
    name: string | null
    image: string | null
    slug: string
    timezone: string
  }
  eventType: {
    id: string
    title: string
    slug: string
    description: string | null
    duration: number
    color: string
  }
  availability: Availability[]
}

// Hook para detectar si estamos en cliente
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function BookingCalendar({
  user,
  eventType,
  availability,
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const isClient = useIsClient()

  // Días de la semana disponibles
  const availableDays = useMemo(() => {
    return availability.filter((a) => a.isEnabled).map((a) => a.dayOfWeek)
  }, [availability])

  // Función para verificar si un día está disponible
  function isDayAvailable(date: Date): boolean {
    const dayOfWeek = date.getDay()
    return availableDays.includes(dayOfWeek)
  }

  // Función para deshabilitar días
  function isDateDisabled(date: Date): boolean {
    const today = startOfDay(new Date())
    if (!isAfter(date, today) && !isSameDay(date, today)) {
      return true
    }
    return !isDayAvailable(date)
  }

  // Generar slots de tiempo para el día seleccionado
  const timeSlots = useMemo(() => {
    if (!selectedDate) return []

    const dayOfWeek = selectedDate.getDay()
    const dayAvailability = availability.find(
      (a) => a.dayOfWeek === dayOfWeek && a.isEnabled
    )

    if (!dayAvailability) return []

    const slots: string[] = []
    const [startHour, startMin] = dayAvailability.startTime
      .split(':')
      .map(Number)
    const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    for (
      let mins = startMinutes;
      mins + eventType.duration <= endMinutes;
      mins += 30
    ) {
      const hour = Math.floor(mins / 60)
      const minute = mins % 60
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(time)
    }

    return slots
  }, [selectedDate, availability, eventType.duration])

  function formatTimeDisplay(time: string): string {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const initials =
    user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <div className="grid md:grid-cols-[300px_1fr] gap-6">
      {/* Panel izquierdo - Info del evento */}
      <div className="space-y-4">
        <Link
          href={`/${user.slug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Link>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={user.image || ''} alt={user.name || ''} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>

            <div
              className="h-1 w-12 rounded mb-4"
              style={{ backgroundColor: eventType.color }}
            />

            <h1 className="text-xl font-bold mb-2">{eventType.title}</h1>

            {eventType.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {eventType.description}
              </p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{eventType.duration} minutos</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                {isClient ? (
                  <span>
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </span>
                ) : (
                  <Skeleton className="h-4 w-32" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel derecho - Calendario y slots */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Calendario */}
            <div>
              <h2 className="font-semibold mb-4">Selecciona una fecha</h2>
              {isClient ? (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    setSelectedTime(null)
                  }}
                  disabled={isDateDisabled}
                  locale={es}
                  fromDate={new Date()}
                  toDate={addDays(new Date(), 60)}
                  className="rounded-md border"
                />
              ) : (
                <Skeleton className="h-75 w-full rounded-md" />
              )}
            </div>

            {/* Slots de tiempo */}
            <div>
              <h2 className="font-semibold mb-4">
                {selectedDate
                  ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })
                  : 'Selecciona una fecha'}
              </h2>

              {selectedDate && timeSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-75 overflow-y-auto">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      className="justify-center"
                      onClick={() => setSelectedTime(time)}
                    >
                      {formatTimeDisplay(time)}
                    </Button>
                  ))}
                </div>
              ) : selectedDate ? (
                <p className="text-muted-foreground text-sm">
                  No hay horarios disponibles para este día
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Selecciona una fecha para ver los horarios disponibles
                </p>
              )}

              {selectedTime && (
                <div className="mt-6">
                  <Link
                    href={`/${user.slug}/${eventType.slug}/confirm?date=${format(selectedDate!, 'yyyy-MM-dd')}&time=${selectedTime}`}
                  >
                    <Button className="w-full" size="lg">
                      Continuar
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
