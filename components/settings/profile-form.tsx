'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  updateProfile,
  checkSlugAvailability,
  type ProfileFormData,
} from '@/actions/profile'
import { getBrowserTimezone, getTimezones } from '@/lib/timezone'
import { toast } from 'sonner'
import { Loader2, Check, X, Link as LinkIcon } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(30, 'El slug no puede tener más de 30 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  bio: z.string().max(500).optional(),
  timezone: z.string().min(1, 'Selecciona una zona horaria'),
})

interface ProfileFormProps {
  user: {
    id: string
    name: string | null
    slug: string | null
    bio: string | null
    timezone: string
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [slugStatus, setSlugStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle')
  const timezones = useMemo(() => getTimezones(), [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      slug: user.slug || '',
      bio: user.bio || '',
      timezone: user.timezone,
    },
  })

  useEffect(() => {
    // Si el usuario no tiene zona horaria, detectar automáticamente
    if (!user.timezone || user.timezone === 'America/Bogota') {
      const browserTz = getBrowserTimezone()
      setValue('timezone', browserTz)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const slugValue = watch('slug')

  // Verificar disponibilidad del slug con debounce
  useEffect(() => {
    if (!slugValue || slugValue.length < 3) {
      setSlugStatus('idle')
      return
    }

    if (slugValue === user.slug) {
      setSlugStatus('available')
      return
    }

    const timer = setTimeout(async () => {
      setSlugStatus('checking')
      const { available } = await checkSlugAvailability(slugValue)
      setSlugStatus(available ? 'available' : 'taken')
    }, 500)

    return () => clearTimeout(timer)
  }, [slugValue, user.slug])

  async function onSubmit(data: ProfileFormData) {
    setIsLoading(true)

    const result = await updateProfile(data)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Perfil actualizado correctamente')
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>
            Esta información se mostrará en tu página pública de reservas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" placeholder="Tu nombre" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Slug / URL */}
          <div className="space-y-2">
            <Label htmlFor="slug">Tu URL personalizada</Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                <LinkIcon className="mr-2 h-4 w-4" />
                calendai.app/
              </div>
              <div className="relative flex-1">
                <Input
                  id="slug"
                  placeholder="tu-nombre"
                  {...register('slug')}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {slugStatus === 'checking' && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {slugStatus === 'available' && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {slugStatus === 'taken' && (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
            {slugStatus === 'taken' && (
              <p className="text-sm text-red-500">Este slug ya está en uso</p>
            )}
            {slugStatus === 'available' && slugValue && (
              <p className="text-sm text-green-600">
                ✓ calendai.app/{slugValue} está disponible
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Descripción</Label>
            <Textarea
              id="bio"
              placeholder="Cuéntale a tus clientes sobre ti..."
              rows={4}
              {...register('bio')}
            />
            {errors.bio && (
              <p className="text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>

          {/* Zona horaria */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Zona horaria</Label>
            <Select
              defaultValue={user.timezone}
              onValueChange={(value) => setValue('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu zona horaria" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timezone && (
              <p className="text-sm text-red-500">{errors.timezone.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || slugStatus === 'taken'}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
