'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const timeSlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isEnabled: z.boolean(),
})

const availabilitySchema = z.array(timeSlotSchema)

export type AvailabilityFormData = z.infer<typeof availabilitySchema>

// Obtener disponibilidad del usuario
export async function getAvailability() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado', data: [] }
  }

  const availability = await prisma.availability.findMany({
    where: { userId: session.user.id },
    orderBy: { dayOfWeek: 'asc' },
  })

  return { data: availability }
}

// Guardar disponibilidad completa
export async function saveAvailability(data: AvailabilityFormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  const validation = availabilitySchema.safeParse(data)

  if (!validation.success) {
    return { error: 'Datos inválidos' }
  }

  // Validar que endTime > startTime para cada slot habilitado
  for (const slot of data) {
    if (slot.isEnabled && slot.startTime >= slot.endTime) {
      return {
        error: `El horario de fin debe ser mayor al de inicio (${getDayName(slot.dayOfWeek)})`,
      }
    }
  }

  try {
    // Eliminar disponibilidad existente y crear nueva
    await prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany({
        where: { userId: session.user.id },
      })

      await tx.availability.createMany({
        data: data.map((slot) => ({
          userId: session.user.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isEnabled: slot.isEnabled,
        })),
      })
    })

    revalidatePath('/dashboard/availability')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Error al guardar la disponibilidad' }
  }
}

function getDayName(day: number): string {
  const days = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ]
  return days[day]
}
