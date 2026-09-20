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
}: {
  receipt: LifeReceipt
  trail: LifeReceipt[]
  thread: ThreadId
  baselineScore: number
  baselineMedians: Record<string, number | null>
}) {
  const reduce = useReducedMotion()
  const filterId = useId().replace(/:/g, '')
  const radius = visualRadius(receipt.radiusScore)
  const baseline = visualRadius(baselineScore)
  const accent = threads.find((item) => item.id === thread)?.color ?? chapterColors[receipt.chapter]
  const pulse = threadPulse(receipt, thread)

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
        r: 3 + (index % 3),
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

  return (
    <motion.figure layoutId="living-radius" className="radius-figure" aria-labelledby="radius-title radius-caption">
      <svg viewBox="0 0 500 500" role="img" aria-labelledby="radius-title radius-desc">
        <title id="radius-title">Living radius for {fmtDate(receipt.date)}</title>
        <desc id="radius-desc">
          A visual storytelling radius based on distance travelled, places visited, movement on foot and time away from home.
          Current score {receipt.radiusScore ?? 'unavailable'} out of 100. The dotted circular reference is the pre-lockdown median.
          Thin spokes compare recorded values in the selected {thread} thread with their pre-lockdown medians; small crossbars mark the reference level.
        </desc>
        <defs>
          <filter id={filterId}><feGaussianBlur stdDeviation="7" /></filter>
        </defs>

        <circle cx="250" cy="250" r="208" className="orbit outer" />
        <circle cx="250" cy="250" r="160" className="orbit" />
        <circle cx="250" cy="250" r={baseline} className="baseline-ring" />
        {trailPoints && <polyline points={trailPoints} className="trail" />}

        <motion.circle
          cx="250"
          cy="250"
          animate={{ r: radius, opacity: receipt.radiusScore == null ? 0.03 : 0.11 + 0.15 * ((pulse ?? 0) / 100) }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 95, damping: 22 }}
          fill={accent}
          filter={`url(#${filterId})`}
        />
        <motion.circle
          cx="250"
          cy="250"
          animate={{ r: radius }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 95, damping: 22 }}
          fill="transparent"
          stroke={chapterColors[receipt.chapter]}
          strokeWidth="1.6"
          strokeDasharray={receipt.radiusScore == null ? '4 8' : undefined}
          opacity={receipt.radiusScore == null ? 0.35 : 1}
          className="main-boundary"
        />

        <g className="signal-signature" aria-hidden="true">
          {signature.map((item, index) => (
            <g key={item.key}>
              <motion.line
                x1={item.x1}
                y1={item.y1}
                animate={{ x2: item.x2, y2: item.y2 }}
                initial={reduce ? false : { x2: item.x1, y2: item.y1 }}
                transition={reduce ? { duration: 0 } : { duration: 0.35, delay: index * 0.025, ease: 'easeOut' }}
                stroke={accent}
                strokeWidth="1.2"
                opacity="0.58"
              />
              <line x1={item.refX1} y1={item.refY1} x2={item.refX2} y2={item.refY2} className="signature-reference" />
              <motion.circle
                cx={item.x2}
                cy={item.y2}
                r="3.2"
                fill={accent}
                initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 0.9, scale: 1 }}
                transition={reduce ? { duration: 0 } : { delay: 0.08 + index * 0.025 }}
              />
            </g>
          ))}
        </g>

        {nodes.map((node, index) => (
          <motion.circle
            key={`${receipt.date}-${index}`}
            initial={reduce ? false : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduce ? 0 : index * 0.025 }}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill={chapterColors[receipt.chapter]}
          />
        ))}

        <circle cx="250" cy="250" r="33" className="home-core" />
        <circle cx="250" cy="250" r="4" fill={accent} />
        <text x="250" y="238" textAnchor="middle" className="svg-kicker">LIVING RADIUS</text>
        <text x="250" y="270" textAnchor="middle" className="svg-score">{receipt.radiusScore == null ? '—' : Math.round(receipt.radiusScore)}</text>
        <text x="250" y="289" textAnchor="middle" className="svg-meta">visual score · /100</text>
      </svg>

      <figcaption id="radius-caption">
        <span><i style={{ background: accent }} /> {signature.length ? `${thread} fingerprint` : `No ${thread} comparison this day`}</span>
        <span>Dotted circle = Before median</span>
        {deltaVsBaseline != null && (
          <span className={deltaVsBaseline < 0 ? 'radius-delta contracted' : 'radius-delta expanded'}>
            {Math.abs(Math.round(deltaVsBaseline))}% {deltaVsBaseline < 0 ? 'narrower' : 'wider'} than Before median
          </span>
        )}
      </figcaption>

      {signature.length > 0 && (
        <div className="signature-legend" aria-label={`${thread} values compared with the Before median`}>
          {signature.map((item) => (
            <span key={item.key}>
              <b>{item.label}</b>
              <em>{Math.abs(Math.round(item.delta))}% {item.delta >= 0 ? 'above' : 'below'}</em>
            </span>
          ))}
        </div>
      )}
    </motion.figure>
  )
}

export default memo(LivingRadius)
