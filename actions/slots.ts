'use server'

import { prisma } from '@/lib/db'
import { getBusyTimes } from '@/lib/google-calendar'
import { startOfDay, endOfDay } from 'date-fns'

interface TimeSlot {
  time: string
  available: boolean
}

export async function getAvailableSlots(
  userSlug: string,
  eventSlug: string,
  date: string
): Promise<{ slots: TimeSlot[]; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { slug: userSlug },
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
    return { slots: [], error: 'Evento no encontrado' }
  }

  const eventType = user.eventTypes[0]

  const [year, month, day] = date.split('-').map(Number)
  const selectedDate = new Date(year, month - 1, day)
  const dayOfWeek = selectedDate.getDay()

  const dayAvailability = user.availability.find(
    (a) => a.dayOfWeek === dayOfWeek
  )

  if (!dayAvailability) {
    return { slots: [] }
  }

  const [startHour, startMin] = dayAvailability.startTime.split(':').map(Number)
  const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  const allSlots: string[] = []
  for (
    let mins = startMinutes;
    mins + eventType.duration <= endMinutes;
    mins += 30
  ) {
    const hour = Math.floor(mins / 60)
    const minute = mins % 60
    allSlots.push(
      `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    )
  }

  const existingBookings = await prisma.booking.findMany({
    where: {
      eventType: { userId: user.id },
      status: { not: 'CANCELLED' },
      startTime: {
        gte: startOfDay(selectedDate),
        lt: endOfDay(selectedDate),
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  })

  const busyTimes = await getBusyTimes(
    user.id,
    startOfDay(selectedDate),
    endOfDay(selectedDate)
  )

  // Verificar si hay un evento de todo el día
  const hasAllDayEvent = busyTimes.some((busy) => {
    if (!busy.isAllDay) return false
    const busyDate = busy.start.toDateString()
    const selectedDateStr = selectedDate.toDateString()
    return busyDate === selectedDateStr
  })

  // Si hay evento de todo el día, no hay slots disponibles
  if (hasAllDayEvent) {
    return { slots: allSlots.map((time) => ({ time, available: false })) }
  }

  // Filtrar solo eventos que no son de todo el día para verificar conflictos
  const timedBusySlots = busyTimes
    .filter((b) => !b.isAllDay)
    .map((b) => ({ start: b.start, end: b.end }))

  const allBusyTimes = [
    ...existingBookings.map((b) => ({ start: b.startTime, end: b.endTime })),
    ...timedBusySlots,
  ]

  const now = new Date()
  const slots: TimeSlot[] = allSlots.map((time) => {
    const [hours, minutes] = time.split(':').map(Number)
    const slotStart = new Date(year, month - 1, day, hours, minutes)
    const slotEnd = new Date(slotStart.getTime() + eventType.duration * 60000)

    if (slotStart <= now) {
      return { time, available: false }
    }

    const hasConflict = allBusyTimes.some(
      (busy) =>
        (slotStart >= busy.start && slotStart < busy.end) ||
        (slotEnd > busy.start && slotEnd <= busy.end) ||
        (slotStart <= busy.start && slotEnd >= busy.end)
    )

    return { time, available: !hasConflict }
  })

  return { slots }
}
