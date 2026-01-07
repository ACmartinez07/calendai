export function getTimezones() {
  const timezones = Intl.supportedValuesOf('timeZone')

  return timezones.map((tz) => {
    const formatter = new Intl.DateTimeFormat('es', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    })

    const parts = formatter.formatToParts(new Date())
    const offset = parts.find((p) => p.type === 'timeZoneName')?.value || ''

    return {
      value: tz,
      label: `${tz.replace(/_/g, ' ')} (${offset})`,
    }
  })
}

export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
