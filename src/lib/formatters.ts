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

export const signedPct = (value: number | null, median: number | null) => {
  if (value == null || median == null || median === 0 || !Number.isFinite(value) || !Number.isFinite(median)) return null
  const result = ((value - median) / Math.abs(median)) * 100
  return Number.isFinite(result) ? result : null
}

export type MedianContext = 'chapter' | 'Before'

const medianLabel = (context: MedianContext) => context === 'Before' ? 'Before median' : 'chapter median'

/**
 * Human-readable comparison language shared across Story, receipts and drawers.
 * A tolerance below half a percentage point avoids contradictory "0% above/below" labels.
 */
export const comparisonFromPct = (
  pct: number | null,
  context: MedianContext = 'chapter',
  tolerancePct = 0.5,
) => {
  if (pct == null || !Number.isFinite(pct)) return 'No baseline comparison'
  if (Math.abs(pct) < tolerancePct) return `At ${medianLabel(context)}`
  const rounded = Math.max(1, Math.abs(Math.round(pct)))
  return `${rounded}% ${pct > 0 ? 'above' : 'below'} ${medianLabel(context)}`
}

export const comparisonText = (
  value: number | null,
  median: number | null,
  context: MedianContext = 'chapter',
  tolerancePct = 0.5,
) => comparisonFromPct(signedPct(value, median), context, tolerancePct)

/** @deprecated Use comparisonFromPct/comparisonText with an explicit median context. */
export const pctText = (pct: number | null) => comparisonFromPct(pct, 'chapter')
