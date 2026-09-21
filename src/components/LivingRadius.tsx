import { memo, useId, useMemo } from 'react'
import { motion } from 'motion/react'
import type { LifeReceipt, ThreadId } from '../types/receipts'
import { chapterColors } from '../data/chapters'
import { metricSpecs, threads } from '../lib/metrics'
import { visualRadius, threadPulse } from '../lib/radius'
import { fmtDate } from '../lib/formatters'
import { useReducedMotion } from '../hooks/useReducedMotion'

const shortMetricLabel = (label: string) => {
  const replacements: Record<string, string> = {
    'Distance travelled': 'Distance',
    'Places visited': 'Places',
    'Detected movement on foot': 'On foot',
    'Time at home': 'Home',
    'Time at study locations': 'Study',
    'Incoming calls': 'Calls in',
    'Outgoing calls': 'Calls out',
    'Incoming SMS': 'SMS in',
    'Outgoing SMS': 'SMS out',
    'Self-reported social level': 'Social',
    'Detected conversation': 'Conversation',
    'Model-estimated sleep': 'Sleep',
    'Phone unlocks': 'Unlocks',
    'Background applications observed': 'Apps observed',
    'Self-reported stress': 'Stress',
    'Photographic Affect Meter': 'Affect',
  }
  return replacements[label] ?? label
}

function LivingRadius({
  receipt,
  trail,
  thread,
  baselineScore,
  baselineMedians,
  showFingerprint,
  onToggleFingerprint,
  scrubbing = false,
}: {
  receipt: LifeReceipt
  trail: LifeReceipt[]
  thread: ThreadId
  baselineScore: number
  baselineMedians: Record<string, number | null>
  showFingerprint: boolean
  onToggleFingerprint: () => void
  scrubbing?: boolean
}) {
  const reduce = useReducedMotion()
  const quiet = reduce || scrubbing
  const filterId = useId().replace(/:/g, '')
  const radius = visualRadius(receipt.radiusScore)
  const baseline = visualRadius(baselineScore)
  const accent = threads.find((item) => item.id === thread)?.color ?? chapterColors[receipt.chapter]
  const pulse = threadPulse(receipt, thread)
  const threadLabel = threads.find((item) => item.id === thread)?.label ?? thread

  const nodes = useMemo(() => {
    const recordedPlaces = receipt.placesVisited
    if (recordedPlaces == null || recordedPlaces <= 0) return []
    const count = Math.min(8, Math.round(recordedPlaces))
    return Array.from({ length: count }, (_, index) => {
      const angle = (Math.PI * 2 * index) / count - 0.8
      const nodeRadius = radius + 18 + (index % 2) * 8
      return {
        x: 250 + Math.cos(angle) * nodeRadius,
        y: 250 + Math.sin(angle) * nodeRadius,
        r: 2.4 + (index % 3) * 0.7,
      }
    })
  }, [receipt.placesVisited, radius])

  const trailPoints = trail
    .filter((item) => item.radiusScore != null)
    .map((item, index, filtered) => {
      const angle = -2.25 + (index / Math.max(1, filtered.length - 1)) * 1.3
      const trailRadius = visualRadius(item.radiusScore)
      return `${250 + Math.cos(angle) * trailRadius},${250 + Math.sin(angle) * trailRadius}`
    })
    .join(' ')

  const signature = useMemo(() => {
    const specs = metricSpecs[thread]
      .map((spec) => {
        const raw = receipt[spec.key]
        const value = typeof raw === 'number' ? raw : null
        const reference = baselineMedians[String(spec.key)] ?? null
        if (value == null || reference == null || reference <= 0) return null
        const ratio = Math.max(0, Math.min(2, value / reference))
        return {
          key: String(spec.key),
          label: shortMetricLabel(spec.label),
          ratio,
          delta: ((value - reference) / reference) * 100,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item != null)
      .slice(0, 5)

    return specs.map((item, index) => {
      const count = specs.length
      const angle = count === 1
        ? -Math.PI / 2
        : count === 2
          ? [-Math.PI * 0.78, -Math.PI * 0.22][index]
          : -Math.PI / 2 + (Math.PI * 2 * index) / count
      const inner = 43
      const referenceRadius = 94
      const currentRadius = 48 + item.ratio * 46
      const x1 = 250 + Math.cos(angle) * inner
      const y1 = 250 + Math.sin(angle) * inner
      const x2 = 250 + Math.cos(angle) * currentRadius
      const y2 = 250 + Math.sin(angle) * currentRadius
      const refX = 250 + Math.cos(angle) * referenceRadius
      const refY = 250 + Math.sin(angle) * referenceRadius
      const perpX = Math.cos(angle + Math.PI / 2) * 5
      const perpY = Math.sin(angle + Math.PI / 2) * 5
      return {
        ...item,
        x1,
        y1,
        x2,
        y2,
        refX1: refX - perpX,
        refY1: refY - perpY,
        refX2: refX + perpX,
        refY2: refY + perpY,
      }
    })
  }, [baselineMedians, receipt, thread])

  const deltaVsBaseline = receipt.radiusScore == null || baselineScore === 0
    ? null
    : ((receipt.radiusScore - baselineScore) / baselineScore) * 100

  const fingerprintVisible = showFingerprint && signature.length > 0

  return (
    <motion.figure layoutId="living-radius" className="radius-figure" aria-labelledby="radius-title radius-caption">
      <svg viewBox="0 0 500 500" role="img" aria-labelledby="radius-title radius-desc">
        <title id="radius-title">Living radius for {fmtDate(receipt.date)}</title>
        <desc id="radius-desc">
          A visual storytelling radius based on distance travelled, places visited, movement on foot and time away from home.
          Current score {receipt.radiusScore ?? 'unavailable'} out of 100. The dotted circular reference is the pre-lockdown median,
          score {Math.round(baselineScore)}. The solid circle is larger on days with a broader recorded physical world and smaller
          on days with a contracted one.
          {fingerprintVisible
            ? ` Thin spokes compare recorded values in the selected ${thread} thread with their pre-lockdown medians; small crossbars mark the reference level.`
            : ' The thread fingerprint comparison is currently hidden.'}
        </desc>
        <defs>
          <filter id={filterId}><feGaussianBlur stdDeviation="7" /></filter>
        </defs>

        <circle cx="250" cy="250" r="208" className="orbit outer" />
        <circle cx="250" cy="250" r="160" className="orbit" />
        {trailPoints && <polyline points={trailPoints} className="trail" />}

        <circle cx="250" cy="250" r={baseline} className="baseline-ring" />
        <text
          x="250"
          y={250 - baseline - 9}
          textAnchor="middle"
          className="svg-reference-label"
        >
          BEFORE REFERENCE · {Math.round(baselineScore)}
        </text>

        <motion.circle
          cx="250"
          cy="250"
          initial={{ r: radius }}
          animate={{ r: radius, opacity: receipt.radiusScore == null ? 0.03 : 0.13 + 0.14 * ((pulse ?? 0) / 100) }}
          transition={quiet ? { duration: 0 } : { type: 'spring', stiffness: 95, damping: 22 }}
          fill={accent}
          filter={`url(#${filterId})`}
        />
        <motion.circle
          cx="250"
          cy="250"
          initial={{ r: radius }}
          animate={{ r: radius }}
          transition={quiet ? { duration: 0 } : { type: 'spring', stiffness: 95, damping: 22 }}
          fill="transparent"
          stroke={chapterColors[receipt.chapter]}
          strokeWidth="2.6"
          strokeDasharray={receipt.radiusScore == null ? '4 8' : undefined}
          opacity={receipt.radiusScore == null ? 0.4 : 1}
          className="main-boundary"
        />

        {fingerprintVisible && (
          <g className="signal-signature" aria-hidden="true">
            {signature.map((item, index) => (
              <g key={item.key}>
                <motion.line
                  x1={item.x1}
                  y1={item.y1}
                  animate={{ x2: item.x2, y2: item.y2 }}
                  initial={quiet ? false : { x2: item.x1, y2: item.y1 }}
                  transition={quiet ? { duration: 0 } : { duration: 0.3, delay: index * 0.02, ease: 'easeOut' }}
                  stroke={accent}
                  strokeWidth="1"
                  opacity="0.4"
                />
                <line x1={item.refX1} y1={item.refY1} x2={item.refX2} y2={item.refY2} className="signature-reference" />
                <motion.circle
                  cx={item.x2}
                  cy={item.y2}
                  r="2.6"
                  fill={accent}
                  initial={quiet ? false : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.72, scale: 1 }}
                  transition={quiet ? { duration: 0 } : { delay: 0.06 + index * 0.02 }}
                />
              </g>
            ))}
          </g>
        )}

        <g className="place-nodes" aria-hidden="true">
          {nodes.map((node, index) => (
            <motion.circle
              key={`${receipt.date}-${index}`}
              initial={quiet ? false : { opacity: 0, scale: 0.4 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{ delay: quiet ? 0 : index * 0.02 }}
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill={chapterColors[receipt.chapter]}
            />
          ))}
        </g>

        <circle cx="250" cy="250" r="36" className="home-core" />
        <text x="250" y="236" textAnchor="middle" className="svg-kicker">LIVING RADIUS</text>
        <text x="250" y="272" textAnchor="middle" className="svg-score">{receipt.radiusScore == null ? '—' : Math.round(receipt.radiusScore)}</text>
        <text x="250" y="288" textAnchor="middle" className="svg-meta">/100</text>
      </svg>

      <figcaption id="radius-caption" className="radius-caption">
        <span className="radius-legend-item primary">
          <i className="glyph-solid" style={{ borderColor: chapterColors[receipt.chapter] }} aria-hidden="true" />
          Recorded radius this day
        </span>
        <span className="radius-legend-item">
          <i className="glyph-dotted" aria-hidden="true" />
          Before reference ({Math.round(baselineScore)})
        </span>
        {deltaVsBaseline != null && (
          <span className={deltaVsBaseline < 0 ? 'radius-delta contracted' : 'radius-delta expanded'}>
            {Math.abs(Math.round(deltaVsBaseline))}% {deltaVsBaseline < 0 ? 'narrower' : 'wider'} than Before
          </span>
        )}
      </figcaption>

      <p className="radius-score-note">A visual storytelling score, not a scientific or clinical measurement.</p>

      <div className="fingerprint-block">
        <button
          type="button"
          className={`fingerprint-toggle ${fingerprintVisible ? 'on' : ''}`}
          onClick={onToggleFingerprint}
          aria-pressed={showFingerprint}
          style={{ '--thread': accent } as React.CSSProperties}
        >
          <i aria-hidden="true" />
          {showFingerprint ? 'Hide' : 'Show'} {threadLabel.toLowerCase()} fingerprint
        </button>

        {showFingerprint && signature.length === 0 && (
          <p className="fingerprint-empty">No comparable {threadLabel.toLowerCase()} evidence was recorded on this day.</p>
        )}

        {fingerprintVisible && (
          <div className="signature-legend" aria-label={`${threadLabel} values compared with the Before median`}>
            {signature.map((item) => (
              <span key={item.key}>
                <b>{item.label}</b>
                <em>{Math.abs(Math.round(item.delta))}% {item.delta >= 0 ? 'above' : 'below'}</em>
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.figure>
  )
}

export default memo(LivingRadius)
