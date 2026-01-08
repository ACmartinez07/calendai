import { resend, FROM_EMAIL } from './email'
import { BookingConfirmationEmail } from '@/emails/booking-confirmation'
import { BookingNotificationEmail } from '@/emails/booking-notification'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SendBookingEmailsParams {
  booking: {
    guestName: string
    guestEmail: string
    guestNotes: string | null
    startTime: Date
  }
  eventType: {
    title: string
    duration: number
  }
  host: {
    name: string | null
    email: string | null
  }
}

export async function sendBookingConfirmationEmails({
  booking,
  eventType,
  host,
}: SendBookingEmailsParams) {
  const formattedDate = format(
    booking.startTime,
    "EEEE, d 'de' MMMM 'de' yyyy",
    { locale: es }
  )
  const formattedTime = format(booking.startTime, 'h:mm a')
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard/bookings`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.guestEmail,
      subject: `Cita confirmada: ${eventType.title} con ${host.name}`,
      react: BookingConfirmationEmail({
        guestName: booking.guestName,
        hostName: host.name || 'Tu anfitrión',
        eventTitle: eventType.title,
        date: formattedDate,
        time: formattedTime,
        duration: eventType.duration,
        notes: booking.guestNotes || undefined,
      }),
    })

    if (error) {
      console.log('No se pudo enviar email al cliente:', error.message)
    } else {
      console.log('Email enviado al cliente:', booking.guestEmail)
    }
  } catch (err) {
    console.log('Error enviando email al cliente:', err)
  }

  if (host.email) {
    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: host.email,
        subject: `Nueva reserva: ${eventType.title} con ${booking.guestName}`,
        react: BookingNotificationEmail({
          hostName: host.name || 'Anfitrión',
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          eventTitle: eventType.title,
          date: formattedDate,
          time: formattedTime,
          duration: eventType.duration,
          notes: booking.guestNotes || undefined,
          dashboardUrl,
        }),
      })

      if (error) {
        console.log('No se pudo enviar email al anfitrión:', error.message)
      } else {
        console.log('Email enviado al anfitrión:', host.email)
      }
    } catch (err) {
      console.log('Error enviando email al anfitrión:', err)
    }
  }

  return { success: true }
}
