import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Button,
} from '@react-email/components'

interface BookingNotificationEmailProps {
  hostName: string
  guestName: string
  guestEmail: string
  eventTitle: string
  date: string
  time: string
  duration: number
  notes?: string
  dashboardUrl: string
}

export function BookingNotificationEmail({
  hostName,
  guestName,
  guestEmail,
  eventTitle,
  date,
  time,
  duration,
  notes,
  dashboardUrl,
}: BookingNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Nueva reserva: {eventTitle} con {guestName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📅 Nueva Reserva</Heading>

          <Text style={text}>Hola {hostName},</Text>

          <Text style={text}>
            <strong>{guestName}</strong> ha agendado una cita contigo.
          </Text>

          <Section style={detailsBox}>
            <Heading as="h2" style={h2}>
              {eventTitle}
            </Heading>

            <Row>
              <Column>
                <Text style={label}>📅 Fecha</Text>
                <Text style={value}>{date}</Text>
              </Column>
            </Row>

            <Row>
              <Column>
                <Text style={label}>🕐 Hora</Text>
                <Text style={value}>
                  {time} ({duration} minutos)
                </Text>
              </Column>
            </Row>

            <Row>
              <Column>
                <Text style={label}>👤 Cliente</Text>
                <Text style={value}>{guestName}</Text>
              </Column>
            </Row>

            <Row>
              <Column>
                <Text style={label}>✉️ Email</Text>
                <Text style={value}>{guestEmail}</Text>
              </Column>
            </Row>

            {notes && (
              <Row>
                <Column>
                  <Text style={label}>📝 Notas del cliente</Text>
                  <Text style={value}>{notes}</Text>
                </Column>
              </Row>
            )}
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Ver en Dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Este email fue enviado por CalendAI - Sistema de Reservas
            Inteligente
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '8px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 20px',
}

const h2 = {
  color: '#3b82f6',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const detailsBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const label = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
}

const value = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '0 0 16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0 0 8px',
}

export default BookingNotificationEmail
