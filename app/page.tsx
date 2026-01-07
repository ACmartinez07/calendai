import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Calend<span className="text-blue-600">AI</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Agenda reuniones sin el ping-pong de mensajes. Tus clientes eligen su
          horario, tú te enfocas en lo importante.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Comenzar gratis</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/demo">Ver demo</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
