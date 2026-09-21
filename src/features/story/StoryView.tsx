import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { BookOpen } from 'lucide-react'
import type { AppView } from '../../app/useHashView'
import type { ChapterId, DataPayload, ThreadId } from '../../types/receipts'
import { chapters } from '../../data/chapters'
import { fmtDate } from '../../lib/formatters'
import { chapterAnchors } from '../../lib/anchors'
import { metricSpecs } from '../../lib/metrics'
import { useTimeline } from '../../hooks/useTimeline'
import LivingRadius from '../../components/LivingRadius'
import ChapterNavigator from '../../components/ChapterNavigator'
import TimeScrubber from '../../components/TimeScrubber'
import ThreadSelector from '../../components/ThreadSelector'
import CurrentObservation from '../../components/CurrentObservation'
import EvidenceDrawer from '../../components/EvidenceDrawer'

export default function StoryView({
  data,
  reduceMotion,
  onNavigate,
}: {
  data: DataPayload
  reduceMotion: boolean
  onNavigate: (view: AppView) => void
}) {
  const [index, setIndex] = useState(0)
  const [thread, setThread] = useState<ThreadId>('movement')
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [showFingerprint, setShowFingerprint] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const scrubTimer = useRef<number | null>(null)
  const { current, previous } = useTimeline(data.records, index)

  const chapterStart = useMemo(() => chapterAnchors(data.records), [data.records])
  const evidenceCounts = useMemo(() => {
    const ids = Object.keys(metricSpecs) as ThreadId[]
    return Object.fromEntries(ids.map((id) => {
      const count = data.records.filter((record) => metricSpecs[id].some((spec) => typeof record[spec.key] === 'number')).length
      return [id, count]
    })) as Record<ThreadId, number>
  }, [data.records])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnnouncement(`Selected ${fmtDate(current.date)}, ${current.chapter} chapter, radius score ${current.radiusScore ?? 'unavailable'}.`)
    }, 180)
    return () => window.clearTimeout(timer)
  }, [current.date, current.chapter, current.radiusScore])

  useEffect(() => () => {
    if (scrubTimer.current) window.clearTimeout(scrubTimer.current)
  }, [])

  const handleScrub = useCallback((next: number) => {
    setIndex(next)
    setScrubbing(true)
    if (scrubTimer.current) window.clearTimeout(scrubTimer.current)
    scrubTimer.current = window.setTimeout(() => setScrubbing(false), 220)
  }, [])

  const toggleFingerprint = useCallback(() => setShowFingerprint((value) => !value), [])

  const selectChapter = (chapter: ChapterId) => {
    const nextIndex = chapterStart[chapter]
    if (nextIndex >= 0) setIndex(nextIndex)
  }

  const chapter = chapters.find((item) => item.id === current.chapter)

  return (
    <motion.main id="main-content" className={`story chapter-${current.chapter}`} key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="story-grid">
        <ChapterNavigator active={current.chapter} onSelect={selectChapter} />
        <motion.section layoutId={reduceMotion ? undefined : 'radius-frame'} className="visual-stage" aria-labelledby="story-date">
          <div className="visual-heading visual-heading-final">
            <div>
              <p className="eyebrow">Living radius</p>
              <h1 id="story-date">{chapter?.name}</h1>
              <p>{fmtDate(current.date)} · Explore how the recorded world changes through time.</p>
            </div>
            <span className="visual-score-pill">
              <b>{current.radiusScore == null ? '—' : Math.round(current.radiusScore)}</b>
              <small>/100</small>
            </span>
          </div>
          <LivingRadius
            receipt={current}
            trail={previous}
            thread={thread}
            baselineScore={data.normalisation.baselineRadiusScore}
            baselineMedians={data.chapterMedians.before}
            showFingerprint={showFingerprint}
            onToggleFingerprint={toggleFingerprint}
            scrubbing={scrubbing}
          />
          <ThreadSelector value={thread} onChange={setThread} counts={evidenceCounts} />
        </motion.section>
        <CurrentObservation receipt={current} thread={thread} data={data} onEvidence={() => setEvidenceOpen(true)} />
      </div>
      <TimeScrubber records={data.records} index={index} onChange={handleScrub} />
      <nav className="story-footer" aria-label="Secondary navigation">
        <button type="button" onClick={() => onNavigate('archive')}><BookOpen size={16} aria-hidden="true" />Explore all receipts</button>
        <span>{data.range.start} → {data.range.end}</span>
        <button type="button" onClick={() => onNavigate('methodology')}>How the radius works</button>
      </nav>
      <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      <EvidenceDrawer open={evidenceOpen} onClose={() => setEvidenceOpen(false)} receipt={current} thread={thread} data={data} />
    </motion.main>
  )
}
