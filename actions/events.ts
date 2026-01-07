'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const eventTypeSchema = z.object({
  title: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z
    .string()
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .max(30, 'El slug no puede tener más de 30 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().max(500).optional(),
  duration: z.number().min(5, 'Mínimo 5 minutos').max(480, 'Máximo 8 horas'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido'),
  bufferBefore: z.number().min(0).max(60),
  bufferAfter: z.number().min(0).max(60),
})

export type EventTypeFormData = z.infer<typeof eventTypeSchema>

// Obtener todos los tipos de evento del usuario
export async function getEventTypes() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado', data: [] }
  }

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return { data: eventTypes }
}

// Obtener un tipo de evento por ID
export async function getEventType(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  const eventType = await prisma.eventType.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!eventType) {
    return { error: 'Tipo de evento no encontrado' }
  }

  return { data: eventType }
}

// Crear nuevo tipo de evento
export async function createEventType(data: EventTypeFormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  const validation = eventTypeSchema.safeParse(data)

  if (!validation.success) {
    const firstIssue = validation.error.issues[0]
    return { error: firstIssue?.message || 'Datos inválidos' }
  }

  // Verificar slug único para este usuario
  const existingSlug = await prisma.eventType.findFirst({
    where: {
      userId: session.user.id,
      slug: data.slug,
    },
  })

  if (existingSlug) {
    return { error: 'Ya tienes un evento con este slug' }
  }

  try {
    const eventType = await prisma.eventType.create({
      data: {
        userId: session.user.id,
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        duration: data.duration,
        color: data.color,
        bufferBefore: data.bufferBefore,
        bufferAfter: data.bufferAfter,
      },
    })

    revalidatePath('/dashboard/events')
    return { success: true, data: eventType }
  } catch (error) {
    console.error(error)
    return { error: 'Error al crear el tipo de evento' }
  }
}

// Actualizar tipo de evento
export async function updateEventType(id: string, data: EventTypeFormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  const validation = eventTypeSchema.safeParse(data)

  if (!validation.success) {
    const firstIssue = validation.error.issues[0]
    return { error: firstIssue?.message || 'Datos inválidos' }
  }

  // Verificar que el evento pertenece al usuario
  const existing = await prisma.eventType.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!existing) {
    return { error: 'Tipo de evento no encontrado' }
  }

  // Verificar slug único (excluyendo el actual)
  const existingSlug = await prisma.eventType.findFirst({
    where: {
      userId: session.user.id,
      slug: data.slug,
      NOT: { id },
    },
  })

  if (existingSlug) {
    return { error: 'Ya tienes un evento con este slug' }
  }

  try {
    const eventType = await prisma.eventType.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        duration: data.duration,
        color: data.color,
        bufferBefore: data.bufferBefore,
        bufferAfter: data.bufferAfter,
      },
    })

    revalidatePath('/dashboard/events')
    return { success: true, data: eventType }
  } catch (error) {
    console.error(error)
    return { error: 'Error al actualizar el tipo de evento' }
  }
}

// Toggle activo/inactivo
export async function toggleEventType(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  const existing = await prisma.eventType.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!existing) {
    return { error: 'Tipo de evento no encontrado' }
  }

  try {
    await prisma.eventType.update({
      where: { id },
      data: { isActive: !existing.isActive },
    })

    revalidatePath('/dashboard/events')
    return { success: true, isActive: !existing.isActive }
  } catch (error) {
    console.error(error)
    return { error: 'Error al actualizar el estado' }
  }
}

// Eliminar tipo de evento
export async function deleteEventType(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  const existing = await prisma.eventType.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!existing) {
    return { error: 'Tipo de evento no encontrado' }
  }

  try {
    await prisma.eventType.delete({
      where: { id },
    })

    revalidatePath('/dashboard/events')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Error al eliminar el tipo de evento' }
  }
}
