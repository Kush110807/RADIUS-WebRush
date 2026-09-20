import { motion } from 'motion/react'
import { ExternalLink, ScanSearch } from 'lucide-react'
import type { DataPayload, LifeReceipt, ThreadId } from '../types/receipts'
import { chapters } from '../data/chapters'
import { fmtDate } from '../lib/formatters'
import { metricSpecs } from '../lib/metrics'
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

  return (
    <aside className="observation" aria-label="Current observation">
      <motion.div
        key={receipt.chapter}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.01 : 0.24 }}
      >
        <p className="eyebrow">{fmtDate(receipt.date)}</p>
        <h2>{chapter.status}</h2>
        <p className="observation-copy">{chapter.observation}</p>
        <p className="chapter-compare">{chapterComparison(receipt, data)}</p>
        <p className="qualification">{chapter.interpretation}</p>
      </motion.div>

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

      <button className="evidence-button" onClick={onEvidence}>
        <ScanSearch size={18} aria-hidden="true" />
        Show the evidence
        <ExternalLink size={14} aria-hidden="true" />
      </button>
    </aside>
  )
}
