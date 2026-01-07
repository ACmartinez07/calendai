'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createBooking } from '@/actions/bookings'
import { toast } from 'sonner'
import { Loader2, Calendar, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BookingConfirmFormProps {
  user: {
    name: string | null
    slug: string
  }
  eventType: {
    id: string
    title: string
    slug: string
    duration: number
    color: string
  }
  date: string
  time: string
  formattedDate: string
  formattedTime: string
}

function getInitialTimezone(): string {
  if (typeof window === 'undefined') return ''
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function BookingConfirmForm({
  user,
  eventType,
  date,
  time,
  formattedDate,
  formattedTime,
}: BookingConfirmFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [visitorTimezone] = useState<string>(getInitialTimezone)

  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestNotes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const result = await createBooking({
      eventTypeId: eventType.id,
      guestName: formData.guestName,
      guestEmail: formData.guestEmail,
      guestTimezone: visitorTimezone,
      guestNotes: formData.guestNotes || undefined,
      date,
      time,
    })

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      router.push(
        `/${user.slug}/${eventType.slug}/success?bookingId=${result.bookingId}`
      )
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/${user.slug}/${eventType.slug}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Volver al calendario
      </Link>

      <Card>
        <CardHeader>
          <div
            className="h-1 w-12 rounded mb-2"
            style={{ backgroundColor: eventType.color }}
          />
          <CardTitle>{eventType.title}</CardTitle>
          <CardDescription>con {user.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {formattedTime} ({eventType.duration} min)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tus datos</CardTitle>
          <CardDescription>
            Ingresa tu información para confirmar la reserva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={formData.guestName}
                onChange={(e) =>
                  setFormData({ ...formData, guestName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.guestEmail}
                onChange={(e) =>
                  setFormData({ ...formData, guestEmail: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                Notas adicionales{' '}
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="¿Hay algo que debamos saber antes de la cita?"
                rows={3}
                value={formData.guestNotes}
                onChange={(e) =>
                  setFormData({ ...formData, guestNotes: e.target.value })
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar reserva
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
