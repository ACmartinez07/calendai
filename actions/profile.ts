'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(30, 'El slug no puede tener más de 30 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  bio: z
    .string()
    .max(500, 'La bio no puede tener más de 500 caracteres')
    .optional(),
  timezone: z.string().min(1, 'Selecciona una zona horaria'),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export async function updateProfile(data: ProfileFormData) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  const validation = profileSchema.safeParse(data)

  if (!validation.success) {
    const firstIssue = validation.error.issues[0]
    return { error: firstIssue?.message || 'Datos inválidos' }
  }

  // Verificar si el slug ya existe (de otro usuario)
  const existingSlug = await prisma.user.findFirst({
    where: {
      slug: data.slug,
      NOT: { id: session.user.id },
    },
  })

  if (existingSlug) {
    return { error: 'Este slug ya está en uso. Elige otro.' }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        slug: data.slug,
        bio: data.bio || null,
        timezone: data.timezone,
      },
    })

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (error) {
    console.log(error)
    return { error: 'Error al guardar los cambios' }
  }
}

export async function checkSlugAvailability(slug: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { available: false }
  }

  const existing = await prisma.user.findFirst({
    where: {
      slug,
      NOT: { id: session.user.id },
    },
  })

  return { available: !existing }
}
