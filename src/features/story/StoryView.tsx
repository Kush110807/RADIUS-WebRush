import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { BookOpen } from 'lucide-react'
import type { AppView } from '../../app/useHashView'
import type { ChapterId, DataPayload, ThreadId } from '../../types/receipts'
import { chapters, chapterColors } from '../../data/chapters'
import { fmtDate } from '../../lib/formatters'
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
  const { current, previous } = useTimeline(data.records, index)

  const chapterStart = useMemo(
    () => Object.fromEntries(
      chapters.map((chapter) => [chapter.id, data.records.findIndex((record) => record.chapter === chapter.id)]),
    ) as Record<ChapterId, number>,
    [data.records],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnnouncement(`Selected ${fmtDate(current.date)}, ${current.chapter} chapter, radius score ${current.radiusScore ?? 'unavailable'}.`)
    }, 180)
    return () => window.clearTimeout(timer)
  }, [current.date, current.chapter, current.radiusScore])

  const selectChapter = (chapter: ChapterId) => {
    const nextIndex = chapterStart[chapter]
    if (nextIndex >= 0) setIndex(nextIndex)
  }

  return (
    <motion.main id="main-content" className={`story chapter-${current.chapter}`} key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="story-grid">
        <ChapterNavigator active={current.chapter} onSelect={selectChapter} />
        <motion.section layoutId={reduceMotion ? undefined : 'radius-frame'} className="visual-stage" aria-labelledby="story-date">
          <div className="visual-heading">
            <div>
              <p className="eyebrow">Living radius · {chapters.find((chapter) => chapter.id === current.chapter)?.name}</p>
              <h1 id="story-date">{fmtDate(current.date)}</h1>
            </div>
            <span style={{ borderColor: chapterColors[current.chapter] }}>
              {current.radiusScore == null ? 'No radius' : `${Math.round(current.radiusScore)} / 100`}
            </span>
          </div>
          <LivingRadius
            receipt={current}
            trail={previous}
            thread={thread}
            baselineScore={data.normalisation.baselineRadiusScore}
            baselineMedians={data.chapterMedians.before}
          />
          <ThreadSelector value={thread} onChange={setThread} />
        </motion.section>
        <CurrentObservation receipt={current} thread={thread} data={data} onEvidence={() => setEvidenceOpen(true)} />
      </div>
      <TimeScrubber records={data.records} index={index} onChange={setIndex} />
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
