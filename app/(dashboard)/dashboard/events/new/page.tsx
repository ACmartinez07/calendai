import { EventTypeForm } from '@/components/events/event-type-form'

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Nuevo tipo de evento
        </h1>
        <p className="text-muted-foreground">
          Crea un nuevo tipo de cita para tus clientes
        </p>
      </div>

      <EventTypeForm />
    </div>
  )
}
