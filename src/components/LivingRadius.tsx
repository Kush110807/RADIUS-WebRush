import { memo, useId, useMemo, type CSSProperties } from 'react'
import { Home, ScanLine } from 'lucide-react'
import { motion } from 'motion/react'
import type { LifeReceipt, ThreadId } from '../types/receipts'
import { chapters, chapterColors } from '../data/chapters'
import { metricSpecs, threads } from '../lib/metrics'
import { visualRadius } from '../lib/radius'
import { fmtDate } from '../lib/formatters'
import { useReducedMotion } from '../hooks/useReducedMotion'

const shortMetricLabel = (label: string) => {
  const replacements: Record<string, string> = {
    'Distance travelled': 'Distance',
    'Places visited': 'Places',
    'Detected movement on foot': 'On foot',
    'Time at home': 'Home time',
    'Time at study locations': 'Study time',
    'Incoming calls': 'Calls in',
    'Outgoing calls': 'Calls out',
    'Incoming SMS': 'SMS in',
    'Outgoing SMS': 'SMS out',
    'Self-reported social level': 'Social level',
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
  const glowId = useId().replace(/:/g, '')
  const radius = visualRadius(receipt.radiusScore)
  const baseline = visualRadius(baselineScore)
  const chapter = chapters.find((item) => item.id === receipt.chapter)
  const currentColor = chapterColors[receipt.chapter]
  const threadMeta = threads.find((item) => item.id === thread)!

  const signature = useMemo(() => {
    const specs = metricSpecs[thread]
      .map((spec) => {
        const raw = receipt[spec.key]
        const value = typeof raw === 'number' ? raw : null
        const reference = baselineMedians[String(spec.key)] ?? null
        if (value == null || reference == null || reference === 0) return null
        return {
          key: String(spec.key),
          label: shortMetricLabel(spec.label),
          delta: ((value - reference) / Math.abs(reference)) * 100,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item != null)
      .slice(0, 5)

    return specs.map((item, index) => {
      const count = specs.length
      const angle = count <= 1 ? -Math.PI / 2 : -Math.PI / 2 + (Math.PI * 2 * index) / count
      const length = 70 + Math.min(52, Math.abs(item.delta) * 0.7)
      const x1 = 250 + Math.cos(angle) * 48
      const y1 = 250 + Math.sin(angle) * 48
      const x2 = 250 + Math.cos(angle) * length
      const y2 = 250 + Math.sin(angle) * length
      return { ...item, x1, y1, x2, y2 }
    })
  }, [baselineMedians, receipt, thread])

  const currentScore = receipt.radiusScore
  const deltaVsBaseline = currentScore == null || baselineScore === 0
    ? null
    : ((currentScore - baselineScore) / baselineScore) * 100
  const fingerprintVisible = showFingerprint && signature.length > 0

  return (
    <motion.figure layoutId="living-radius" className="radius-figure radius-figure-final" aria-labelledby="radius-title radius-caption">
      <div className="radius-canvas-shell">
        <svg viewBox="0 0 500 500" role="img" aria-labelledby="radius-title radius-desc">
          <title id="radius-title">Living radius for {fmtDate(receipt.date)}</title>
          <desc id="radius-desc">
            The outer cyan ring shows the Before reference score of {Math.round(baselineScore)} out of 100.
            The inner chapter ring shows {currentScore == null ? 'no score' : `${Math.round(currentScore)} out of 100`} for {fmtDate(receipt.date)}.
            The centre marks Home. This is a visual storytelling score rather than a physical distance measurement.
          </desc>
          <defs>
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <g className="radius-grid" aria-hidden="true">
            {[62, 106, 150, 194].map((r) => <circle key={r} cx="250" cy="250" r={r} />)}
            <line x1="250" y1="34" x2="250" y2="466" />
            <line x1="34" y1="250" x2="466" y2="250" />
            <text x="250" y="24" textAnchor="middle">N</text>
            <text x="250" y="486" textAnchor="middle">S</text>
            <text x="18" y="255" textAnchor="middle">W</text>
            <text x="482" y="255" textAnchor="middle">E</text>
            <text x="258" y="188">60</text>
            <text x="258" y="144">80</text>
            <text x="258" y="100">100</text>
          </g>

          <circle cx="250" cy="250" r={baseline} className="radius-before-fill" />
          <circle cx="250" cy="250" r={baseline} className="radius-before-ring" filter={`url(#${glowId})`} />
          <circle cx="250" cy={250 - baseline} r="4" className="radius-before-dot" />
          <g className="radius-before-label" transform={`translate(250 ${250 - baseline - 14})`}>
            <text textAnchor="middle" y="-11">{Math.round(baselineScore)} /100</text>
            <text textAnchor="middle" y="5">BEFORE</text>
          </g>

          <motion.circle
            cx="250"
            cy="250"
            initial={{ r: radius }}
            animate={{ r: radius }}
            transition={quiet ? { duration: 0 } : { type: 'spring', stiffness: 105, damping: 24 }}
            className="radius-current-fill"
            style={{ fill: currentColor }}
          />
          <motion.circle
            cx="250"
            cy="250"
            initial={{ r: radius }}
            animate={{ r: radius }}
            transition={quiet ? { duration: 0 } : { type: 'spring', stiffness: 105, damping: 24 }}
            fill="transparent"
            stroke={currentColor}
            strokeWidth="3"
            className="radius-current-ring"
            filter={`url(#${glowId})`}
          />
          {currentScore != null && (
            <g className="radius-current-label" transform={`translate(250 ${Math.max(88, 250 - radius - 14)})`}>
              <text textAnchor="middle" y="-11">{Math.round(currentScore)} /100</text>
              <text textAnchor="middle" y="5">{chapter?.name.toUpperCase() ?? 'CURRENT'}</text>
            </g>
          )}

          {fingerprintVisible && (
            <g className="signal-signature" aria-hidden="true">
              {signature.map((item, index) => (
                <g key={item.key}>
                  <motion.line
                    x1={item.x1}
                    y1={item.y1}
                    initial={quiet ? false : { x2: item.x1, y2: item.y1 }}
                    animate={{ x2: item.x2, y2: item.y2 }}
                    transition={quiet ? { duration: 0 } : { duration: 0.28, delay: index * 0.03 }}
                    stroke={threadMeta.color}
                    strokeWidth="1.25"
                    opacity="0.56"
                  />
                  <circle cx={item.x2} cy={item.y2} r="3" fill={threadMeta.color} opacity="0.85" />
                </g>
              ))}
            </g>
          )}

          <circle cx="250" cy="250" r="34" className="home-core-final" />
          <foreignObject x="226" y="218" width="48" height="48" className="home-icon-foreign">
            <div className="home-icon-wrap"><Home size={18} aria-hidden="true" /><span>HOME</span></div>
          </foreignObject>
        </svg>
      </div>

      <figcaption id="radius-caption" className="radius-summary-card">
        <div className="radius-summary-main">
          <div className="score-side before"><strong>{Math.round(baselineScore)}</strong><span>/100</span><b>Before</b><small>reference median</small></div>
          <span className="score-arrow" aria-hidden="true">→</span>
          <div className="score-side current" style={{ '--current': currentColor } as CSSProperties}>
            <strong>{currentScore == null ? '—' : Math.round(currentScore)}</strong><span>/100</span><b>{chapter?.name ?? 'Current'}</b><small>{fmtDate(receipt.date, false)}</small>
          </div>
        </div>
        <div className="radius-summary-delta">
          <strong>{deltaVsBaseline == null ? '—' : `${Math.abs(Math.round(deltaVsBaseline))}%`}</strong>
          <div><b>{deltaVsBaseline == null ? 'No comparison' : deltaVsBaseline < 0 ? 'Smaller world' : 'Broader world'}</b><span>{deltaVsBaseline == null ? 'No comparable radius was recorded.' : `${deltaVsBaseline < 0 ? 'narrower' : 'wider'} than the Before reference.`}</span></div>
        </div>
      </figcaption>

      <div className="radius-controls-row">
        <p className="radius-score-note">Score 0–100 · visual storytelling measure, not kilometres or a clinical metric.</p>
        <button
          type="button"
          className={`fingerprint-toggle ${fingerprintVisible ? 'on' : ''}`}
          onClick={onToggleFingerprint}
          aria-pressed={showFingerprint}
          style={{ '--thread': threadMeta.color } as CSSProperties}
        >
          <ScanLine size={15} aria-hidden="true" />
          {showFingerprint ? 'Hide' : 'Show'} {threadMeta.label.toLowerCase()} fingerprint
        </button>
      </div>

      {showFingerprint && signature.length === 0 && (
        <p className="fingerprint-empty">No comparable {threadMeta.label.toLowerCase()} evidence was recorded on this day.</p>
      )}

      {fingerprintVisible && (
        <div className="signature-legend" aria-label={`${threadMeta.label} values compared with the Before median`}>
          {signature.map((item) => (
            <span key={item.key}><b>{item.label}</b><em>{Math.abs(Math.round(item.delta))}% {item.delta >= 0 ? 'above' : 'below'} Before</em></span>
          ))}
        </div>
      )}
    </motion.figure>
  )
}

export default memo(LivingRadius)
