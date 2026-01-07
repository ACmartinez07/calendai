'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

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

  // Verificar que no haya conflictos
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

  try {
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
      },
    })

    return { success: true, bookingId: booking.id }
  } catch (error) {
    console.error(error)
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
  })

  if (!booking) {
    return { error: 'Reserva no encontrada' }
  }

  if (booking.status === 'CANCELLED') {
    return { error: 'Esta reserva ya está cancelada' }
  }

  try {
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
    console.error(error)
    return { error: 'Error al cancelar la reserva' }
  }
}
