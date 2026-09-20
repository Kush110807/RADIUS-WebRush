const longDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export const fmtDate = (date: string, long = true) => {
  const value = new Date(`${date}T12:00:00`)
  return (long ? longDateFormatter : shortDateFormatter).format(value)
}

export const num = (value: number | null, suffix = '', digits = 0) =>
  value == null ? 'No record' : `${value.toFixed(digits)}${suffix}`

export const signedPct = (value: number | null, baseline: number | null) => {
  if (value == null || baseline == null || baseline === 0) return null
  return ((value - baseline) / baseline) * 100
}

export const pctText = (pct: number | null) =>
  pct == null
    ? 'No baseline comparison'
    : `${Math.abs(Math.round(pct))}% ${pct >= 0 ? 'above' : 'below'} baseline`
