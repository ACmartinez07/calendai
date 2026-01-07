'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
import { saveAvailability } from '@/actions/availability'
import { toast } from 'sonner'
import { Loader2, Copy } from 'lucide-react'

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]

// Generar opciones de tiempo cada 30 minutos
function generateTimeOptions() {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const label = formatTime(time)
      options.push({ value: time, label })
    }
  }
  return options
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

const TIME_OPTIONS = generateTimeOptions()

interface AvailabilitySlot {
  dayOfWeek: number
  startTime: string
  endTime: string
  isEnabled: boolean
}

interface AvailabilityFormProps {
  initialData: AvailabilitySlot[]
}

export function AvailabilityForm({ initialData }: AvailabilityFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Crear estado inicial con todos los días
  const getInitialState = (): AvailabilitySlot[] => {
    return DAYS.map((day) => {
      const existing = initialData.find((d) => d.dayOfWeek === day.value)
      return (
        existing || {
          dayOfWeek: day.value,
          startTime: '09:00',
          endTime: '17:00',
          isEnabled: day.value >= 1 && day.value <= 5, // Lunes a Viernes por defecto
        }
      )
    })
  }

  const [availability, setAvailability] =
    useState<AvailabilitySlot[]>(getInitialState)

  function updateSlot(dayOfWeek: number, updates: Partial<AvailabilitySlot>) {
    setAvailability((prev) =>
      prev.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, ...updates } : slot
      )
    )
  }

  function copyToAll(sourceDayOfWeek: number) {
    const source = availability.find((s) => s.dayOfWeek === sourceDayOfWeek)
    if (!source) return

    setAvailability((prev) =>
      prev.map((slot) => ({
        ...slot,
        startTime: source.startTime,
        endTime: source.endTime,
      }))
    )
    toast.success('Horario copiado a todos los días')
  }

  async function handleSubmit() {
    setIsLoading(true)

    const result = await saveAvailability(availability)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Disponibilidad guardada correctamente')
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Horario semanal</CardTitle>
          <CardDescription>
            Define los horarios en los que estás disponible para recibir citas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map((day) => {
            const slot = availability.find((s) => s.dayOfWeek === day.value)!
            return (
              <div
                key={day.value}
                className="flex items-center gap-4 py-3 border-b last:border-0"
              >
                {/* Switch y nombre del día */}
                <div className="flex items-center gap-3 w-32">
                  <Switch
                    checked={slot.isEnabled}
                    onCheckedChange={(checked) =>
                      updateSlot(day.value, { isEnabled: checked })
                    }
                  />
                  <Label className="font-medium">{day.label}</Label>
                </div>

                {/* Selectores de tiempo */}
                {slot.isEnabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Select
                      value={slot.startTime}
                      onValueChange={(value) =>
                        updateSlot(day.value, { startTime: value })
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-muted-foreground">a</span>

                    <Select
                      value={slot.endTime}
                      onValueChange={(value) =>
                        updateSlot(day.value, { endTime: value })
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Botón copiar a todos */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToAll(day.value)}
                      title="Copiar a todos los días"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No disponible
                  </span>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar disponibilidad
        </Button>
      </div>
    </div>
  )
}
