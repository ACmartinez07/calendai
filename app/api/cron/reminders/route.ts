import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { resend, FROM_EMAIL } from '@/lib/email'
import { BookingReminderEmail } from '@/emails/booking-reminder'
import { format, addHours } from 'date-fns'
import { es } from 'date-fns/locale'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const now = new Date()
    const in24Hours = addHours(now, 24)
    const in25Hours = addHours(now, 25)

    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        startTime: {
          gte: in24Hours,
          lt: in25Hours,
        },
      },
      include: {
        eventType: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    console.log(`Found ${bookings.length} bookings for reminders`)

    let sent = 0
    let failed = 0

    for (const booking of bookings) {
      const formattedDate = format(
        booking.startTime,
        "EEEE, d 'de' MMMM 'de' yyyy",
        { locale: es }
      )
      const formattedTime = format(booking.startTime, 'h:mm a')

      try {
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: booking.guestEmail,
          subject: `Recordatorio: ${booking.eventType.title} mañana`,
          react: BookingReminderEmail({
            guestName: booking.guestName,
            hostName: booking.eventType.user.name || 'Tu anfitrión',
            eventTitle: booking.eventType.title,
            date: formattedDate,
            time: formattedTime,
            duration: booking.eventType.duration,
          }),
        })

        if (error) {
          console.log(
            `Failed to send reminder to ${booking.guestEmail}:`,
            error
          )
          failed++
        } else {
          console.log(`Reminder sent to ${booking.guestEmail}`)
          sent++
        }
      } catch (err) {
        console.error(`Error sending reminder to ${booking.guestEmail}:`, err)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      total: bookings.length,
      sent,
      failed,
    })
  } catch (error) {
    console.error('Error in reminders cron:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
