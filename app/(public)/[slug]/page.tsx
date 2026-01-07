/* eslint-disable @next/next/no-html-link-for-pages */
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin } from 'lucide-react'
import Link from 'next/link'

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { slug } = await params

  const user = await prisma.user.findUnique({
    where: { slug },
    include: {
      eventTypes: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const initials =
    user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header del perfil */}
        <div className="text-center mb-8">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          {user.bio && (
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              {user.bio}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{user.timezone.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* Lista de tipos de evento */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Agenda una cita</h2>

          {user.eventTypes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No hay tipos de cita disponibles en este momento.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {user.eventTypes.map((eventType) => (
                <Link
                  key={eventType.id}
                  href={`/${slug}/${eventType.slug}`}
                  className="block"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div
                      className="h-2"
                      style={{ backgroundColor: eventType.color }}
                    />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{eventType.title}</h3>
                          {eventType.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {eventType.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="ml-4">
                          <Clock className="h-3 w-3 mr-1" />
                          {eventType.duration} min
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          Powered by{' '}
          <a href="/" className="text-blue-600 hover:underline">
            CalendAI
          </a>
        </div>
      </div>
    </div>
  )
}
