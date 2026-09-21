import { motion } from 'motion/react'
import { ChevronRight, ScanSearch } from 'lucide-react'
import type { DataPayload, LifeReceipt, ThreadId } from '../types/receipts'
import { chapters } from '../data/chapters'
import { fmtDate } from '../lib/formatters'
import { metricSpecs, threads } from '../lib/metrics'
import { useReducedMotion } from '../hooks/useReducedMotion'
import ReceiptCard from './ReceiptCard'

function chapterComparison(receipt: LifeReceipt, data: DataPayload) {
  const base = data.chapterMedians.before
  const here = data.chapterMedians[receipt.chapter]

  if (receipt.chapter === 'before') {
    return `Reference pattern: ${base.distanceKm?.toFixed(2)} km travelled, ${base.placesVisited?.toFixed(0)} places visited, ${base.movementMinutes?.toFixed(0)} minutes on foot and ${base.homeHours?.toFixed(2)} hours at home on a median recorded day.`
  }

  const distancePct = base.distanceKm && here.distanceKm != null
    ? Math.round(((here.distanceKm - base.distanceKm) / base.distanceKm) * 100)
    : null
  const homeDiff = base.homeHours != null && here.homeHours != null
    ? here.homeHours - base.homeHours
    : null
  const placesDiff = base.placesVisited != null && here.placesVisited != null
    ? here.placesVisited - base.placesVisited
    : null

  if (receipt.chapter === 'collapse') {
    return `Compared with Before, median travel is ${distancePct == null ? 'lower' : `${Math.abs(distancePct)}% lower`}; home time is ${homeDiff == null ? 'higher' : `${homeDiff.toFixed(1)} hours higher`}; and the median number of places falls by ${Math.abs(placesDiff ?? 0).toFixed(0)}.`
  }

  if (receipt.chapter === 'adaptation') {
    return `Compared with Before, the median day still reaches only ${here.placesVisited?.toFixed(0)} places and about ${here.movementMinutes?.toFixed(0)} minutes on foot, while home time remains ${homeDiff?.toFixed(1)} hours higher.`
  }

  return `Compared with Before, the median day returns to ${here.placesVisited?.toFixed(0)} places, reaches ${here.distanceKm?.toFixed(2)} km of travel, and records about ${here.movementMinutes?.toFixed(0)} minutes on foot.`
}

function dailyPattern(receipt: LifeReceipt, thread: ThreadId, baseline: Record<string, number | null>) {
  const comparisons = metricSpecs[thread].flatMap((spec) => {
    const raw = receipt[spec.key]
    const value = typeof raw === 'number' ? raw : null
    const reference = baseline[String(spec.key)] ?? null
    if (value == null || reference == null || reference === 0) return []
    const delta = ((value - reference) / Math.abs(reference)) * 100
    return [{ label: spec.label, delta }]
  })

  if (!comparisons.length) {
    return `This day does not contain enough comparable ${threads.find((item) => item.id === thread)?.label.toLowerCase()} evidence for a daily pattern link.`
  }

  if (thread === 'movement') {
    const home = comparisons.find((item) => item.label === 'Time at home')
    const outward = comparisons.filter((item) => ['Distance travelled', 'Places visited', 'Detected movement on foot'].includes(item.label))
    if (home && home.delta > 10 && outward.length >= 2 && outward.every((item) => item.delta < -10)) {
      return 'Connected receipts: outward movement is below the Before median while time at home moves in the opposite direction.'
    }
  }

  const below = comparisons.filter((item) => item.delta < -10).length
  const above = comparisons.filter((item) => item.delta > 10).length
  const near = comparisons.length - below - above
  const parts = [
    below ? `${below} below` : '',
    above ? `${above} above` : '',
    near ? `${near} near` : '',
  ].filter(Boolean)

  return `Connected receipts: ${parts.join(', ')} the Before median across ${comparisons.length} comparable ${thread} signal${comparisons.length === 1 ? '' : 's'} recorded today.`
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
  const count = Math.min(3, metricSpecs[thread].length)
  const reduce = useReducedMotion()
  const pattern = dailyPattern(receipt, thread, data.chapterMedians.before)

  return (
    <aside className="observation" aria-label="Current observation">
      <motion.div
        key={receipt.chapter}
        className="observation-block observation-what"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.01 : 0.24 }}
      >
        <p className="eyebrow">{fmtDate(receipt.date)}</p>
        <p className="observation-step">What happened</p>
        <h2>{chapter.status}</h2>
        <p className="observation-copy">{chapter.observation}</p>
      </motion.div>

      <div className="observation-block observation-support">
        <p className="observation-step">What supports it</p>
        <p className="chapter-compare">{chapterComparison(receipt, data)}</p>
        <div className="pattern-link">
          <span>Signal connection</span>
          <p>{pattern}</p>
        </div>

        <div className="receipt-stack" aria-label={`${thread} supporting receipts`}>
          {Array.from({ length: count }, (_, index) => (
            <motion.div
              key={`${thread}-${index}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0.01 : 0.2, delay: reduce ? 0 : index * 0.045 }}
            >
              <ReceiptCard
                receipt={receipt}
                thread={thread}
                baseline={data.chapterMedians.before}
                compact={index > 0}
                metricIndex={index}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="observation-block observation-limits">
        <p className="observation-step">Interpretation limits</p>
        <p className="qualification">{chapter.interpretation}</p>
      </div>

      <button className="evidence-button" type="button" onClick={onEvidence}>
        <ScanSearch size={18} aria-hidden="true" />
        Show the evidence
        <ChevronRight size={15} aria-hidden="true" />
      </button>
    </aside>
  )
}
