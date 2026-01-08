'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  createCalendarEvent,
  deleteCalendarEvent,
  isSlotAvailable,
} from '@/lib/google-calendar'
import { sendBookingConfirmationEmails } from '@/lib/send-email'

const bookingSchema = z.object({
  eventTypeId: z.string().min(1),
  guestName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  guestEmail: z.string().email('Email inválido'),
  guestTimezone: z.string().min(1),
  guestNotes: z.string().max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
})

export type BookingFormData = z.infer<typeof bookingSchema>

// Crear una nueva reserva
export async function createBooking(data: BookingFormData) {
  const validation = bookingSchema.safeParse(data)

  if (!validation.success) {
    const firstIssue = validation.error.issues[0]
    return { error: firstIssue?.message || 'Datos inválidos' }
  }

  // Obtener el tipo de evento
  const eventType = await prisma.eventType.findUnique({
    where: { id: data.eventTypeId },
    include: { user: true },
  })

  if (!eventType || !eventType.isActive) {
    return { error: 'Tipo de evento no encontrado o no disponible' }
  }

  // Calcular fecha/hora de inicio y fin
  const [year, month, day] = data.date.split('-').map(Number)
  const [hours, minutes] = data.time.split(':').map(Number)

  const startTime = new Date(year, month - 1, day, hours, minutes)
  const endTime = new Date(startTime.getTime() + eventType.duration * 60000)

  // Verificar disponibilidad en la base de datos
  const conflict = await prisma.booking.findFirst({
    where: {
      eventType: { userId: eventType.userId },
      status: { not: 'CANCELLED' },
      OR: [
        {
          startTime: { lte: startTime },
          endTime: { gt: startTime },
        },
        {
          startTime: { lt: endTime },
          endTime: { gte: endTime },
        },
        {
          startTime: { gte: startTime },
          endTime: { lte: endTime },
        },
      ],
    },
  })

  if (conflict) {
    return {
      error: 'Este horario ya no está disponible. Por favor selecciona otro.',
    }
  }

  // Verificar disponibilidad en Google Calendar
  const googleAvailable = await isSlotAvailable(
    eventType.userId,
    startTime,
    endTime
  )

  if (!googleAvailable) {
    return {
      error:
        'Este horario está ocupado en el calendario. Por favor selecciona otro.',
    }
  }

  try {
    const calendarEvent = await createCalendarEvent(eventType.userId, {
      title: `${eventType.title} - ${data.guestName}`,
      description: data.guestNotes
        ? `Notas del cliente: ${data.guestNotes}`
        : undefined,
      startTime,
      endTime,
      attendeeEmail: data.guestEmail,
      attendeeName: data.guestName,
      timezone: eventType.user.timezone,
    })

    const booking = await prisma.booking.create({
      data: {
        eventTypeId: data.eventTypeId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestTimezone: data.guestTimezone,
        guestNotes: data.guestNotes || null,
        startTime,
        endTime,
        status: 'CONFIRMED',
        googleEventId: calendarEvent?.id || null,
      },
    })

    await sendBookingConfirmationEmails({
      booking: {
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestNotes: data.guestNotes || null,
        startTime,
      },
      eventType: {
        title: eventType.title,
        duration: eventType.duration,
      },
      host: {
        name: eventType.user.name,
        email: eventType.user.email,
      },
    })

    return { success: true, bookingId: booking.id }
  } catch (error) {
    console.error('Error creating booking:', error)
    return { error: 'Error al crear la reserva' }
  }
}

// Obtener reservas del usuario autenticado
export async function getBookings(
  filter: 'upcoming' | 'past' | 'all' = 'upcoming'
) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado', data: [] }
  }

  const now = new Date()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {
    eventType: { userId: session.user.id },
  }

  if (filter === 'upcoming') {
    whereClause.startTime = { gte: now }
    whereClause.status = { not: 'CANCELLED' }
  } else if (filter === 'past') {
    whereClause.startTime = { lt: now }
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      eventType: {
        select: {
          title: true,
          duration: true,
          color: true,
        },
      },
    },
    orderBy: { startTime: filter === 'past' ? 'desc' : 'asc' },
  })

  return { data: bookings }
}

// Obtener una reserva por ID
export async function getBooking(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      eventType: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              timezone: true,
            },
          },
        },
      },
    },
  })

  if (!booking) {
    return { error: 'Reserva no encontrada' }
  }

  return { data: booking }
}

// Cancelar una reserva
export async function cancelBooking(id: string, reason?: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id,
      eventType: { userId: session.user.id },
    },
    include: {
      eventType: true,
    },
  })

  if (!booking) {
    return { error: 'Reserva no encontrada' }
  }

  if (booking.status === 'CANCELLED') {
    return { error: 'Esta reserva ya está cancelada' }
  }

  try {
    // Eliminar evento de Google Calendar si existe
    if (booking.googleEventId) {
      await deleteCalendarEvent(session.user.id, booking.googleEventId)
    }

    // Actualizar estado en la base de datos
    await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelReason: reason || null,
      },
    })

    revalidatePath('/dashboard/bookings')
    return { success: true }
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return { error: 'Error al cancelar la reserva' }
  }
}
