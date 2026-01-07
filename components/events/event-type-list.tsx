'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toggleEventType, deleteEventType } from '@/actions/events'
import { toast } from 'sonner'
import {
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react'

interface EventType {
  id: string
  title: string
  slug: string
  description: string | null
  duration: number
  color: string
  isActive: boolean
}

interface EventTypeListProps {
  eventTypes: EventType[]
  userSlug: string | null
}

export function EventTypeList({ eventTypes, userSlug }: EventTypeListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleToggle(id: string) {
    const result = await toggleEventType(id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.isActive ? 'Evento activado' : 'Evento desactivado')
    }
  }

  async function handleDelete() {
    if (!deleteId) return

    setIsDeleting(true)
    const result = await deleteEventType(deleteId)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Evento eliminado')
    }

    setIsDeleting(false)
    setDeleteId(null)
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/${userSlug}/${slug}`
    navigator.clipboard.writeText(url)
    toast.success('Link copiado al portapapeles')
  }

  if (eventTypes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            No tienes tipos de evento
          </h3>
          <p className="text-muted-foreground text-center mb-4">
            Crea tu primer tipo de evento para que tus clientes puedan agendar
            citas contigo.
          </p>
          <Button asChild>
            <Link href="/dashboard/events/new">Crear tipo de evento</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {eventTypes.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="h-2" style={{ backgroundColor: event.color }} />
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{event.title}</h3>
                    {!event.isActive && (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {event.duration} min
                    </span>
                    {userSlug && (
                      <span className="truncate">
                        /{userSlug}/{event.slug}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={event.isActive}
                    onCheckedChange={() => handleToggle(event.id)}
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/events/${event.id}`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      {userSlug && (
                        <>
                          <DropdownMenuItem
                            onClick={() => copyLink(event.slug)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar link
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a
                              href={`/${userSlug}/${event.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver página
                            </a>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(event.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tipo de evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también todas las
              reservas asociadas a este tipo de evento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
