import { useMemo, useState, type CSSProperties } from 'react'
import { motion } from 'motion/react'
import { ArrowDown, ArrowUp, ChevronRight, Info, Minus, ScanSearch } from 'lucide-react'
import type { DataPayload, LifeReceipt, ThreadId } from '../types/receipts'
import { chapters } from '../data/chapters'
import { fmtDate } from '../lib/formatters'
import { metricSpecs, threads } from '../lib/metrics'
import { useReducedMotion } from '../hooks/useReducedMotion'

function chapterComparison(receipt: LifeReceipt, data: DataPayload) {
  const base = data.chapterMedians.before
  const here = data.chapterMedians[receipt.chapter]

  if (receipt.chapter === 'before') {
    return 'This chapter is the reference pattern used to compare the later periods.'
  }

  const distancePct = base.distanceKm && here.distanceKm != null
    ? Math.round(((here.distanceKm - base.distanceKm) / base.distanceKm) * 100)
    : null
  const homeDiff = base.homeHours != null && here.homeHours != null ? here.homeHours - base.homeHours : null
  const placesDiff = base.placesVisited != null && here.placesVisited != null ? here.placesVisited - base.placesVisited : null

  if (receipt.chapter === 'collapse') {
    return `Median travel is ${distancePct == null ? 'lower' : `${Math.abs(distancePct)}% lower`} than Before${homeDiff == null ? '' : `, home time is ${Math.abs(homeDiff).toFixed(1)} hours higher`}${placesDiff == null ? '' : `, and places visited fall by ${Math.abs(placesDiff).toFixed(0)}`}.`
  }
  if (receipt.chapter === 'adaptation') {
    return 'The routine remains narrower than Before while a different day-to-day pattern stabilises.'
  }
  return 'The recorded world expands again, although not every signal returns to its earlier pattern.'
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
  const [activeTab, setActiveTab] = useState<'observation' | 'evidence' | 'context'>('observation')

  const signals = useMemo(() => metricSpecs[thread].flatMap((spec) => {
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
      qualification: spec.qualification,
    }]
  }).slice(0, 5), [baseline, receipt, thread])

  const tabs = [
    { id: 'observation' as const, label: 'Observation' },
    { id: 'evidence' as const, label: 'Evidence' },
    { id: 'context' as const, label: 'Context' },
  ]

  return (
    <aside className="observation observation-v2" aria-label="Current observation" style={{ '--thread': threadMeta.color } as CSSProperties}>
      <div className="observation-tabs-v2" role="tablist" aria-label="Story detail views">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`observation-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`observation-panel-${tab.id}`}
            className={activeTab === tab.id ? 'is-active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'observation' && (
        <div id="observation-panel-observation" role="tabpanel" aria-labelledby="observation-tab-observation" className="observation-panel-v2">
          <motion.div
            key={`${receipt.chapter}-${receipt.date}`}
            className="observation-hero-v2"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.22 }}
          >
            <p className="eyebrow">{fmtDate(receipt.date)} · {chapter.name}</p>
            <h2>{chapter.status}</h2>
            <p>{chapter.observation}</p>
          </motion.div>
          <section className="observation-section-v2">
            <p className="section-kicker-v2">What this adds to the story</p>
            <p>{chapterComparison(receipt, data)}</p>
          </section>
        </div>
      )}

      {activeTab === 'evidence' && (
        <div id="observation-panel-evidence" role="tabpanel" aria-labelledby="observation-tab-evidence" className="observation-panel-v2">
          <div className="panel-intro-v2">
            <p className="section-kicker-v2" style={{ color: threadMeta.color }}>{threadMeta.label} evidence</p>
            <p>{threadMeta.description}. Values below compare this recorded day with the Before median when a comparable reference exists.</p>
          </div>
          <div className="signal-list-v2">
            {signals.length ? signals.map((signal) => {
              const direction = signal.delta == null ? 'none' : Math.abs(signal.delta) < 5 ? 'flat' : signal.delta > 0 ? 'up' : 'down'
              const DeltaIcon = direction === 'up' ? ArrowUp : direction === 'down' ? ArrowDown : Minus
              return (
                <div className="signal-row-v2" key={signal.key}>
                  <div><strong>{signal.label}</strong>{signal.qualification && <small>{signal.qualification}</small>}</div>
                  <b>{signal.value}</b>
                  <span className={`signal-delta-v2 ${direction}`}>
                    <DeltaIcon size={13} aria-hidden="true" />
                    {signal.delta == null ? 'No baseline' : Math.abs(signal.delta) < 5 ? 'Near Before' : `${Math.abs(Math.round(signal.delta))}% ${signal.delta > 0 ? 'above' : 'below'}`}
                  </span>
                </div>
              )
            }) : <p className="empty-evidence-v2">No usable {threadMeta.label.toLowerCase()} evidence is recorded for this day.</p>}
          </div>
          <button className="evidence-button evidence-button-v2" type="button" onClick={onEvidence}>
            <ScanSearch size={18} aria-hidden="true" />
            Open source evidence
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      {activeTab === 'context' && (
        <div id="observation-panel-context" role="tabpanel" aria-labelledby="observation-tab-context" className="observation-panel-v2">
          <section className="context-card-v2">
            <Info size={18} aria-hidden="true" />
            <div>
              <p className="section-kicker-v2">How to read this chapter</p>
              <p>{chapter.interpretation}</p>
            </div>
          </section>
          <section className="observation-section-v2">
            <p className="section-kicker-v2">Selected evidence lens</p>
            <h3 style={{ color: threadMeta.color }}>{threadMeta.label}</h3>
            <p>{threadMeta.description}. Changing the lens changes the supporting evidence, not the living-radius score itself.</p>
          </section>
          <section className="observation-section-v2 quiet-v2">
            <p className="section-kicker-v2">Interpretation limit</p>
            <p>RADIUS describes patterns in one anonymous participant's recorded traces. It does not diagnose wellbeing or establish why a change occurred.</p>
          </section>
        </div>
      )}
    </aside>
  )
}
