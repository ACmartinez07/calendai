import { google } from 'googleapis'
import { prisma } from '@/lib/db'

// Crear cliente OAuth2
function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  )
}

// Obtener tokens del usuario
async function getUserTokens(userId: string) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'google',
    },
  })

  if (!account) {
    return null
  }

  return {
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  }
}

// Actualizar tokens en la base de datos
async function updateUserTokens(
  userId: string,
  tokens: {
    access_token?: string | null
    refresh_token?: string | null
    expiry_date?: number | null
  }
) {
  await prisma.account.updateMany({
    where: {
      userId,
      provider: 'google',
    },
    data: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiry_date
        ? Math.floor(tokens.expiry_date / 1000)
        : undefined,
    },
  })
}

// Obtener cliente autenticado de Calendar
export async function getCalendarClient(userId: string) {
  const tokens = await getUserTokens(userId)

  if (!tokens || !tokens.access_token) {
    return null
  }

  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials(tokens)

  // Manejar refresh automático de tokens
  oauth2Client.on('tokens', async (newTokens) => {
    await updateUserTokens(userId, {
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token ?? tokens.refresh_token,
      expiry_date: newTokens.expiry_date,
    })
  })

  return google.calendar({ version: 'v3', auth: oauth2Client })
}

// Crear evento en Google Calendar
export async function createCalendarEvent(
  userId: string,
  event: {
    title: string
    description?: string
    startTime: Date
    endTime: Date
    attendeeEmail: string
    attendeeName: string
    timezone: string
  }
) {
  const calendar = await getCalendarClient(userId)

  if (!calendar) {
    console.log('No calendar client available for user:', userId)
    return null
  }

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: event.title,
        description: event.description || `Cita con ${event.attendeeName}`,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: event.timezone,
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: event.timezone,
        },
        attendees: [
          {
            email: event.attendeeEmail,
            displayName: event.attendeeName,
          },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      },
    })

    return response.data
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return null
  }
}

// Eliminar evento de Google Calendar
export async function deleteCalendarEvent(userId: string, eventId: string) {
  const calendar = await getCalendarClient(userId)

  if (!calendar) {
    return false
  }

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    })
    return true
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return false
  }
}

interface BusyTime {
  start: Date
  end: Date
  isAllDay: boolean
}

// Obtener eventos ocupados (para verificar disponibilidad)
export async function getBusyTimes(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<BusyTime[]> {
  const calendar = await getCalendarClient(userId)

  if (!calendar) {
    return []
  }

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = response.data.items || []

    return events
      .filter((event) => {
        if (event.status === 'cancelled') return false

        const selfAttendee = event.attendees?.find((a) => a.self)
        if (selfAttendee?.responseStatus === 'declined') return false

        return true
      })
      .map((event): BusyTime | null => {
        const startDateTime = event.start?.dateTime
        const startDateOnly = event.start?.date
        const endDateTime = event.end?.dateTime
        const endDateOnly = event.end?.date

        // Eventos de todo el día usan 'date', eventos normales usan 'dateTime'
        const isAllDay = !startDateTime

        if (isAllDay && startDateOnly && endDateOnly) {
          return {
            start: new Date(`${startDateOnly}T00:00:00`),
            end: new Date(`${endDateOnly}T00:00:00`),
            isAllDay: true,
          }
        } else if (startDateTime && endDateTime) {
          return {
            start: new Date(startDateTime),
            end: new Date(endDateTime),
            isAllDay: false,
          }
        }

        return null
      })
      .filter((event): event is BusyTime => event !== null)
  } catch (error) {
    console.error('Error fetching busy times:', error)
    return []
  }
}

// Verificar si un slot está disponible en Google Calendar
export async function isSlotAvailable(
  userId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const busyTimes = await getBusyTimes(
    userId,
    new Date(startTime.getTime() - 60000),
    new Date(endTime.getTime() + 60000)
  )

  for (const busy of busyTimes) {
    // Si es evento de todo el día, bloquear todo el día
    if (busy.isAllDay) {
      const slotDate = startTime.toDateString()
      const busyDate = busy.start.toDateString()
      if (slotDate === busyDate) {
        return false
      }
      continue
    }

    // Verificar conflicto normal
    if (
      (startTime >= busy.start && startTime < busy.end) ||
      (endTime > busy.start && endTime <= busy.end) ||
      (startTime <= busy.start && endTime >= busy.end)
    ) {
      return false
    }
  }

  return true
}
