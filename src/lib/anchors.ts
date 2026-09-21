import type { ChapterId, LifeReceipt } from '../types/receipts'
import { metricSpecs } from './metrics'

const movementKeys = metricSpecs.movement.map((spec) => spec.key)

const evidenceCoverage = (receipt: LifeReceipt) =>
  movementKeys.filter((key) => typeof receipt[key] === 'number').length

const median = (values: number[]) => {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
}

/**
 * Deterministic representative day per chapter.
 *
 * Chapter buttons should open on a day that actually reads as typical for that
 * chapter instead of the first calendar day, which is often sparse. The anchor
 * is derived only from the verified archive: the chapter's own median living
 * radius, then the best movement-evidence coverage, then the closest score, then
 * the earliest date. No event is invented or hard-coded.
 */
export function chapterAnchors(records: LifeReceipt[]): Record<ChapterId, number> {
  const anchors = {} as Record<ChapterId, number>
  const chapterIds: ChapterId[] = ['before', 'collapse', 'adaptation', 'reopening']

  for (const chapter of chapterIds) {
    const indices = records.reduce<number[]>((acc, record, index) => {
      if (record.chapter === chapter) acc.push(index)
      return acc
    }, [])

    if (!indices.length) {
      anchors[chapter] = 0
      continue
    }

    const scored = indices.filter((index) => records[index].radiusScore != null)
    const target = median(scored.map((index) => records[index].radiusScore as number))

    if (target == null) {
      anchors[chapter] = indices[0]
      continue
    }

    const bestCoverage = Math.max(...scored.map((index) => evidenceCoverage(records[index])))
    const candidates = scored.filter((index) => evidenceCoverage(records[index]) === bestCoverage)

    let best = candidates[0]
    let bestDistance = Math.abs((records[best].radiusScore as number) - target)
    for (const index of candidates) {
      const distance = Math.abs((records[index].radiusScore as number) - target)
      if (distance < bestDistance) {
        best = index
        bestDistance = distance
      }
    }

    anchors[chapter] = best
  }

  return anchors
}
