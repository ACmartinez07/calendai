import Link from 'next/link'
import { CalendarCheck, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de CalendAI',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CalendarCheck className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">CalendAI</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Política de Privacidad</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground mb-6">
            Última actualización: {new Date().toLocaleDateString('es-CO')}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              1. Información que recopilamos
            </h2>
            <p className="mb-4">
              CalendAI recopila la siguiente información cuando utilizas nuestro
              servicio:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Información de tu cuenta de Google:</strong> nombre,
                dirección de correo electrónico y foto de perfil cuando inicias
                sesión con Google OAuth.
              </li>
              <li>
                <strong>Datos de calendario:</strong> accedemos a tu Google
                Calendar para crear eventos de reserva y verificar
                disponibilidad.
              </li>
              <li>
                <strong>Información de reservas:</strong> datos de las citas
                agendadas, incluyendo nombre y correo electrónico de los
                clientes que reservan contigo.
              </li>
              <li>
                <strong>Configuración de perfil:</strong> tu disponibilidad
                horaria, tipos de evento y preferencias de zona horaria.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              2. Cómo usamos tu información
            </h2>
            <p className="mb-4">Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcionar y mantener el servicio de reservas</li>
              <li>
                Crear eventos en tu Google Calendar cuando se confirma una
                reserva
              </li>
              <li>
                Verificar tu disponibilidad y evitar conflictos de horario
              </li>
              <li>
                Enviar notificaciones por correo electrónico sobre reservas y
                recordatorios
              </li>
              <li>Mostrar tu página pública de reservas a tus clientes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              3. Compartición de datos
            </h2>
            <p className="mb-4">
              <strong>
                No vendemos ni compartimos tu información personal con terceros
              </strong>{' '}
              para fines de marketing.
            </p>
            <p className="mb-4">
              Solo compartimos información en los siguientes casos:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Con Google:</strong> para la autenticación y
                sincronización con Google Calendar.
              </li>
              <li>
                <strong>Con Resend:</strong> para el envío de correos
                electrónicos de confirmación y recordatorio.
              </li>
              <li>
                <strong>Página pública:</strong> tu nombre, foto y tipos de
                evento son visibles en tu página pública de reservas.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              4. Seguridad de los datos
            </h2>
            <p className="mb-4">
              Implementamos medidas de seguridad para proteger tu información:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Conexiones cifradas mediante HTTPS</li>
              <li>Autenticación segura con OAuth 2.0 de Google</li>
              <li>Base de datos protegida con acceso restringido</li>
              <li>
                No almacenamos contraseñas (usamos autenticación de Google)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Tus derechos</h2>
            <p className="mb-4">Tienes derecho a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acceder a tu información personal</li>
              <li>Corregir datos inexactos</li>
              <li>Eliminar tu cuenta y todos los datos asociados</li>
              <li>
                Revocar el acceso a tu Google Calendar desde{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  la configuración de tu cuenta de Google
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Cookies</h2>
            <p className="mb-4">
              Utilizamos cookies esenciales para mantener tu sesión iniciada. No
              utilizamos cookies de seguimiento ni publicidad.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              7. Cambios en esta política
            </h2>
            <p className="mb-4">
              Podemos actualizar esta política de privacidad ocasionalmente. Te
              notificaremos sobre cambios significativos publicando la nueva
              política en esta página.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          CalendAI.
        </div>
      </footer>
    </div>
  )
}
