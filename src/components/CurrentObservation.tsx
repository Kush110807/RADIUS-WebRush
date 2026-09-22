import { useMemo, useState, type CSSProperties } from 'react'
import { motion } from 'motion/react'
import { ArrowDown, ArrowUp, ChevronRight, Info, Minus, ScanSearch } from 'lucide-react'
import type { DataPayload, LifeReceipt, ThreadId } from '../types/receipts'
import { chapters } from '../data/chapters'
import { comparisonFromPct, comparisonText, fmtDate } from '../lib/formatters'
import { metricSpecs, threads } from '../lib/metrics'
import { useReducedMotion } from '../hooks/useReducedMotion'

function chapterComparison(receipt: LifeReceipt, data: DataPayload) {
  const base = data.chapterMedians.before
  const here = data.chapterMedians[receipt.chapter]

  if (receipt.chapter === 'before') {
    return 'This chapter supplies the benchmark for the later story, but individual days still vary around that median. The radius therefore compares the selected Before-day with the chapter median instead of hiding that within-chapter variation.'
  }

  const describe = (label: string, value: number | null, reference: number | null) => {
    const copy = comparisonText(value, reference, 'Before')
    if (copy === 'No baseline comparison') return `${label} has no comparable Before median`
    if (copy === 'At Before median') return `${label} is at the Before median`
    return `${label} is ${copy}`
  }

  if (receipt.chapter === 'collapse') {
    return `The contraction is visible across the mobility signals: ${describe('median travel', here.distanceKm, base.distanceKm)}, ${describe('home time', here.homeHours, base.homeHours)}, and ${describe('places visited', here.placesVisited, base.placesVisited)}.`
  }
  if (receipt.chapter === 'adaptation') {
    return `The routine stabilises in a smaller recorded world: ${describe('median travel', here.distanceKm, base.distanceKm)}, ${describe('places visited', here.placesVisited, base.placesVisited)}, and ${describe('home time', here.homeHours, base.homeHours)}.`
  }
  return `The recorded world expands again: ${describe('median travel', here.distanceKm, base.distanceKm)}, ${describe('places visited', here.placesVisited, base.placesVisited)}, and ${describe('home time', here.homeHours, base.homeHours)}. Not every signal returns to its earlier median.`
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

  const observationSnapshot = useMemo(() => {
    const cards = [
      receipt.radiusScore == null ? null : {
        key: 'radius', label: 'Living radius', value: `${Math.round(receipt.radiusScore)}/100`,
        delta: comparisonText(receipt.radiusScore, baseline.radiusScore ?? data.normalisation.baselineRadiusScore, 'Before'),
      },
      receipt.distanceKm == null ? null : {
        key: 'distance', label: 'Distance', value: `${receipt.distanceKm.toFixed(2)} km`,
        delta: comparisonText(receipt.distanceKm, baseline.distanceKm, 'Before'),
      },
      receipt.placesVisited == null ? null : {
        key: 'places', label: 'Places', value: `${receipt.placesVisited}`,
        delta: comparisonText(receipt.placesVisited, baseline.placesVisited, 'Before'),
      },
      receipt.homeHours == null ? null : {
        key: 'home', label: 'Home time', value: `${receipt.homeHours.toFixed(1)} h`,
        delta: comparisonText(receipt.homeHours, baseline.homeHours, 'Before'),
      },
    ]
    return cards.filter((card): card is NonNullable<typeof card> => card != null)
  }, [baseline, data.normalisation.baselineRadiusScore, receipt])

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
          <section className="observation-section-v2 observation-snapshot-v3">
            <div className="observation-snapshot-head-v3">
              <p className="section-kicker-v2">Selected day at a glance</p>
              <small>Compared with the Before median</small>
            </div>
            <div className="observation-stat-grid-v3">
              {observationSnapshot.map((item) => (
                <div className="observation-stat-v3" key={item.key}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.delta}</small>
                </div>
              ))}
            </div>
          </section>
          <section className="observation-section-v2 observation-story-v3">
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
              const direction = signal.delta == null ? 'none' : Math.abs(signal.delta) < 0.5 ? 'flat' : signal.delta > 0 ? 'up' : 'down'
              const DeltaIcon = direction === 'up' ? ArrowUp : direction === 'down' ? ArrowDown : Minus
              return (
                <div className="signal-row-v2" key={signal.key}>
                  <div><strong>{signal.label}</strong>{signal.qualification && <small>{signal.qualification}</small>}</div>
                  <b>{signal.value}</b>
                  <span className={`signal-delta-v2 ${direction}`}>
                    <DeltaIcon size={13} aria-hidden="true" />
                    {comparisonFromPct(signal.delta, 'Before')}
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
