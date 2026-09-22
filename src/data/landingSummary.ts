/**
 * Small first-paint payload derived from public/data/anonymous37.json.
 * Keeping this summary in the JS bundle lets the landing page render before
 * the 1,227-record archive is fetched and parsed.
 */
export const landingSummary = {
  participant: 'Anonymous 37',
  days: 1227,
  beforeRadius: 39.05,
  firstLockdownRadius: 14.5,
} as const

export type LandingSummary = typeof landingSummary
