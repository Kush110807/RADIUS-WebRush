import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import { ChevronRight, Info, ScanSearch } from 'lucide-react'
import type { DataPayload, LifeReceipt, ThreadId } from '../types/receipts'
import { chapters } from '../data/chapters'
import { fmtDate } from '../lib/formatters'
import { metricSpecs, threads } from '../lib/metrics'
import { useReducedMotion } from '../hooks/useReducedMotion'

function chapterComparison(receipt: LifeReceipt, data: DataPayload) {
  const base = data.chapterMedians.before
  const here = data.chapterMedians[receipt.chapter]

  if (receipt.chapter === 'before') {
    return 'This chapter is the reference pattern used to compare later periods.'
  }

  const distancePct = base.distanceKm && here.distanceKm != null
    ? Math.round(((here.distanceKm - base.distanceKm) / base.distanceKm) * 100)
    : null
  const homeDiff = base.homeHours != null && here.homeHours != null ? here.homeHours - base.homeHours : null
  const placesDiff = base.placesVisited != null && here.placesVisited != null ? here.placesVisited - base.placesVisited : null

  if (receipt.chapter === 'collapse') {
    return `Median travel is ${distancePct == null ? 'lower' : `${Math.abs(distancePct)}% lower`} than Before${homeDiff == null ? '' : `, while home time is ${Math.abs(homeDiff).toFixed(1)} hours higher`}${placesDiff == null ? '' : ` and places visited fall by ${Math.abs(placesDiff).toFixed(0)}`}.`
  }
  if (receipt.chapter === 'adaptation') {
    return `The routine stays narrower than Before, with fewer places reached and more time concentrated close to home.`
  }
  return 'The recorded world expands again, though not every signal returns to its earlier pattern.'
}

function formatMetric(value: number, unit: string, digits = 0) {
  return `${value.toFixed(digits)}${unit}`
}

export default function CurrentObservation({
  receipt,
  thread,
  data,
  onEvidence,
}: {
  receipt: LifeReceipt
  thread: ThreadId
  data: DataPayload
  onEvidence: () => void
}) {
  const chapter = chapters.find((item) => item.id === receipt.chapter)!
  const reduce = useReducedMotion()
  const threadMeta = threads.find((item) => item.id === thread)!
  const baseline = data.chapterMedians.before

  const signals = metricSpecs[thread].flatMap((spec) => {
    const raw = receipt[spec.key]
    const value = typeof raw === 'number' ? raw : null
    const reference = baseline[String(spec.key)] ?? null
    if (value == null) return []
    const delta = reference == null || reference === 0 ? null : ((value - reference) / Math.abs(reference)) * 100
    return [{
      key: String(spec.key),
      label: spec.label,
      value: formatMetric(value, spec.unit, spec.digits ?? 0),
      delta,
    }]
  }).slice(0, 4)

  return (
    <aside className="observation observation-final" aria-label="Current observation" style={{ '--thread': threadMeta.color } as CSSProperties}>
      <div className="observation-tabs" role="presentation">
        <span className="active">Observation</span>
        <span>Evidence</span>
        <span>Context</span>
      </div>

      <motion.div
        key={receipt.chapter}
        className="observation-hero"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.01 : 0.24 }}
      >
        <p className="eyebrow">{fmtDate(receipt.date)} · {chapter.name}</p>
        <h2>{chapter.status}</h2>
        <p>{chapter.observation}</p>
      </motion.div>

      <section className="observation-section">
        <div className="observation-section-title">
          <span className="observation-section-icon">{(() => { const Icon = threadMeta.icon; return <Icon size={15} aria-hidden="true" /> })()}</span>
          <div><p>Selected thread</p><h3>{threadMeta.label}</h3></div>
        </div>
        <p className="thread-definition">{threadMeta.description}.</p>
        <div className="signal-list" aria-label={`${threadMeta.label} signals on this date`}>
          {signals.length ? signals.map((signal) => (
            <div className="signal-row" key={signal.key}>
              <span><b>{signal.label}</b><small>{signal.delta == null ? 'No Before comparison' : `${Math.abs(Math.round(signal.delta))}% ${signal.delta >= 0 ? 'above' : 'below'} Before`}</small></span>
              <strong>{signal.value}</strong>
            </div>
          )) : <p className="signal-empty">No {threadMeta.label.toLowerCase()} signals were recorded on this date.</p>}
        </div>
      </section>

      <section className="observation-section observation-meaning">
        <p className="section-kicker">What this adds to the story</p>
        <p>{chapterComparison(receipt, data)}</p>
      </section>

      <section className="observation-section observation-limits-final">
        <div className="limit-title"><Info size={15} aria-hidden="true" /><span>Interpretation limits</span></div>
        <p>{chapter.interpretation}</p>
      </section>

      <button className="evidence-button evidence-button-final" type="button" onClick={onEvidence}>
        <ScanSearch size={18} aria-hidden="true" />
        Open source evidence
        <ChevronRight size={15} aria-hidden="true" />
      </button>
    </aside>
  )
}
