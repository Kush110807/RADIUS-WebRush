import { memo, useMemo, type CSSProperties } from 'react'
import { motion } from 'motion/react'
import { ChevronDown, ChevronUp, Home } from 'lucide-react'
import type { LifeReceipt, ThreadId } from '../types/receipts'
import { chapterColors } from '../data/chapters'
import { metricSpecs, threads } from '../lib/metrics'
import { fmtDate } from '../lib/formatters'
import { useReducedMotion } from '../hooks/useReducedMotion'

const clamp = (min: number, max: number, value: number) => Math.max(min, Math.min(max, value))

function compactMetricLabel(label: string) {
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
  const currentScore = receipt.radiusScore
  const baselineRadius = 174
  const currentRadius = currentScore == null || baselineScore <= 0
    ? 72
    : clamp(60, 192, baselineRadius * (currentScore / baselineScore))
  const isReference = receipt.chapter === 'before'
  const currentColor = chapterColors[receipt.chapter]
  const threadMeta = threads.find((item) => item.id === thread)!

  const deltaVsBaseline = currentScore == null || baselineScore === 0
    ? null
    : ((currentScore - baselineScore) / baselineScore) * 100

  const fingerprint = useMemo(() => metricSpecs[thread].flatMap((spec) => {
    const raw = receipt[spec.key]
    const value = typeof raw === 'number' ? raw : null
    const reference = baselineMedians[String(spec.key)] ?? null
    if (value == null || reference == null || reference === 0) return []
    const delta = ((value - reference) / Math.abs(reference)) * 100
    return [{ key: String(spec.key), label: compactMetricLabel(spec.label), delta }]
  }).slice(0, 5), [baselineMedians, receipt, thread])

  const deltaCopy = deltaVsBaseline == null
    ? 'No comparable radius score'
    : Math.abs(deltaVsBaseline) < 2
      ? 'Near the Before reference'
      : `${Math.abs(Math.round(deltaVsBaseline))}% ${deltaVsBaseline < 0 ? 'smaller' : 'larger'} than Before`

  return (
    <motion.figure layoutId="living-radius" className="radius-v2" aria-labelledby="radius-v2-title radius-v2-caption">
      <div className="radius-statebar-v2" aria-hidden="true">
        <span className="reference"><i /> <b>Before</b><strong>{Math.round(baselineScore)}<small>/100</small></strong></span>
        {!isReference && <span className="current" style={{ '--current': currentColor } as CSSProperties}><i /> <b>{receipt.chapter === 'collapse' ? 'First lockdown' : receipt.chapter}</b><strong>{currentScore == null ? '—' : Math.round(currentScore)}<small>/100</small></strong></span>}
      </div>

      <div className="radius-canvas-v2">
        <svg viewBox="0 0 500 500" role="img" aria-labelledby="radius-v2-title radius-v2-desc">
          <title id="radius-v2-title">Living radius for {fmtDate(receipt.date)}</title>
          <desc id="radius-v2-desc">
            The Before reference score is {Math.round(baselineScore)} out of 100.
            {isReference
              ? ' This selected day is in the Before reference chapter, so only the reference ring is shown.'
              : ` The selected day score is ${currentScore ?? 'unavailable'} out of 100. The current ring is scaled relative to the Before reference.`}
            This is a visual storytelling score, not physical distance.
          </desc>

          <circle cx="250" cy="250" r="208" className="radius-v2-guide outer" />
          <circle cx="250" cy="250" r="132" className="radius-v2-guide" />
          <circle cx="250" cy="250" r="82" className="radius-v2-guide" />
          <line x1="38" y1="250" x2="462" y2="250" className="radius-v2-axis" />
          <line x1="250" y1="38" x2="250" y2="462" className="radius-v2-axis" />
          <text x="250" y="30" textAnchor="middle" className="radius-v2-compass">N</text>
          <text x="470" y="255" textAnchor="middle" className="radius-v2-compass">E</text>
          <text x="250" y="482" textAnchor="middle" className="radius-v2-compass">S</text>
          <text x="30" y="255" textAnchor="middle" className="radius-v2-compass">W</text>

          <circle
            cx="250"
            cy="250"
            r={baselineRadius}
            className={`radius-v2-baseline ${isReference ? 'is-reference' : ''}`}
          />

          {!isReference && (
            <motion.circle
              cx="250"
              cy="250"
              fill="transparent"
              stroke={currentColor}
              strokeWidth="3"
              initial={quiet ? false : { r: baselineRadius, opacity: 0.25 }}
              animate={{ r: currentRadius, opacity: currentScore == null ? 0.35 : 1 }}
              transition={quiet ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 20 }}
              className="radius-v2-current"
            />
          )}

          {!isReference && currentScore != null && (
            <motion.circle
              cx="250"
              cy="250"
              fill={currentColor}
              initial={quiet ? false : { r: baselineRadius, opacity: 0 }}
              animate={{ r: currentRadius, opacity: 0.055 }}
              transition={quiet ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 20 }}
            />
          )}

          <circle cx="250" cy="250" r="42" className="radius-v2-home" />
          <foreignObject x="218" y="214" width="64" height="74" className="radius-v2-home-object">
            <div className="radius-v2-home-label">
              <Home size={22} aria-hidden="true" />
              <span>HOME</span>
            </div>
          </foreignObject>
        </svg>
      </div>

      <figcaption id="radius-v2-caption" className="radius-summary-v2">
        {isReference ? (
          <div className="radius-reference-summary-v2">
            <p>Reference chapter</p>
            <strong>{Math.round(baselineScore)}<small>/100</small></strong>
            <span>This ring is the Before benchmark used throughout the story.</span>
          </div>
        ) : (
          <>
            <div className="radius-score-compare-v2">
              <span><small>Before</small><b>{Math.round(baselineScore)}</b><em>/100</em></span>
              <i aria-hidden="true">→</i>
              <span className="current" style={{ '--current': currentColor } as CSSProperties}><small>{receipt.chapter === 'collapse' ? 'First lockdown' : receipt.chapter}</small><b>{currentScore == null ? '—' : Math.round(currentScore)}</b><em>/100</em></span>
            </div>
            <div className="radius-takeaway-v2">
              <strong>{deltaCopy}</strong>
              <span>Living-radius score · visual storytelling measure, not physical distance.</span>
            </div>
          </>
        )}
      </figcaption>

      <section className="fingerprint-v2" aria-label={`${threadMeta.label} evidence differences`}>
        <button type="button" className="fingerprint-toggle-v2" onClick={onToggleFingerprint} aria-expanded={showFingerprint}>
          <span><i style={{ background: threadMeta.color }} />{threadMeta.label} differences vs Before</span>
          {showFingerprint ? <ChevronUp size={17} aria-hidden="true" /> : <ChevronDown size={17} aria-hidden="true" />}
        </button>
        {showFingerprint && (
          <div className="fingerprint-panel-v2">
            {fingerprint.length ? fingerprint.map((item) => {
              const abs = Math.min(100, Math.abs(item.delta))
              const near = Math.abs(item.delta) < 5
              return (
                <div className="fingerprint-row-v2" key={item.key}>
                  <span>{item.label}</span>
                  <div className="fingerprint-track-v2" aria-hidden="true"><i style={{ width: `${Math.max(4, abs)}%`, background: threadMeta.color }} /></div>
                  <b className={near ? 'near' : item.delta > 0 ? 'up' : 'down'}>{near ? '≈ Before' : `${item.delta > 0 ? '↑' : '↓'} ${Math.abs(Math.round(item.delta))}%`}</b>
                </div>
              )
            }) : <p>No comparable {threadMeta.label.toLowerCase()} signals are recorded for this day.</p>}
            <small>Bars show the magnitude of change. Arrows show whether the recorded value is above or below the Before median.</small>
          </div>
        )}
      </section>
    </motion.figure>
  )
}

export default memo(LivingRadius)
