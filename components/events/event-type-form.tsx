'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
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
  createEventType,
  updateEventType,
  type EventTypeFormData,
} from '@/actions/events'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const eventTypeSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
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

const COLORS = [
  { value: '#3B82F6', label: 'Azul' },
  { value: '#10B981', label: 'Verde' },
  { value: '#F59E0B', label: 'Amarillo' },
  { value: '#EF4444', label: 'Rojo' },
  { value: '#8B5CF6', label: 'Púrpura' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#6366F1', label: 'Índigo' },
  { value: '#14B8A6', label: 'Teal' },
]

const DURATIONS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1 hora 30 min' },
  { value: 120, label: '2 horas' },
]

interface EventTypeFormProps {
  eventType?: {
    id: string
    title: string
    slug: string
    description: string | null
    duration: number
    color: string
    bufferBefore: number
    bufferAfter: number
  }
}

export function EventTypeForm({ eventType }: EventTypeFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!eventType

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<EventTypeFormData>({
    resolver: zodResolver(eventTypeSchema),
    defaultValues: {
      title: eventType?.title || '',
      slug: eventType?.slug || '',
      description: eventType?.description || '',
      duration: eventType?.duration || 30,
      color: eventType?.color || '#3B82F6',
      bufferBefore: eventType?.bufferBefore || 0,
      bufferAfter: eventType?.bufferAfter || 0,
    },
  })

  const titleValue = useWatch({ control, name: 'title' })
  const colorValue = useWatch({ control, name: 'color' })

  // Auto-generar slug desde el título
  function generateSlug() {
    const slug = titleValue
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    setValue('slug', slug)
  }

  async function onSubmit(data: EventTypeFormData) {
    setIsLoading(true)

    const result = isEditing
      ? await updateEventType(eventType.id, data)
      : await createEventType(data)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(
        isEditing ? 'Tipo de evento actualizado' : 'Tipo de evento creado'
      )
      router.push('/dashboard/events')
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del evento</CardTitle>
          <CardDescription>
            Define cómo se mostrará este tipo de cita a tus clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ej: Consulta inicial"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                placeholder="consulta-inicial"
                {...register('slug')}
              />
              <Button type="button" variant="outline" onClick={generateSlug}>
                Generar
              </Button>
            </div>
            {errors.slug && (
              <p className="text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Describe brevemente este tipo de cita..."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Duración */}
          <div className="space-y-2">
            <Label>Duración</Label>
            <Select
              defaultValue={String(eventType?.duration || 30)}
              onValueChange={(value) => setValue('duration', Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={String(d.value)}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.duration && (
              <p className="text-sm text-red-500">{errors.duration.message}</p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`w-8 h-8 rounded-full transition-all ${
                    colorValue === c.value
                      ? 'ring-2 ring-offset-2 ring-gray-400'
                      : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setValue('color', c.value)}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración avanzada</CardTitle>
          <CardDescription>
            Tiempos de buffer antes y después de cada cita
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Buffer antes (minutos)</Label>
              <Select
                defaultValue={String(eventType?.bufferBefore || 0)}
                onValueChange={(value) =>
                  setValue('bufferBefore', Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 5, 10, 15, 30, 45, 60].map((min) => (
                    <SelectItem key={min} value={String(min)}>
                      {min === 0 ? 'Sin buffer' : `${min} min`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Buffer después (minutos)</Label>
              <Select
                defaultValue={String(eventType?.bufferAfter || 0)}
                onValueChange={(value) =>
                  setValue('bufferAfter', Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 5, 10, 15, 30, 45, 60].map((min) => (
                    <SelectItem key={min} value={String(min)}>
                      {min === 0 ? 'Sin buffer' : `${min} min`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/events')}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Guardar cambios' : 'Crear evento'}
        </Button>
      </div>
    </form>
  )
}
