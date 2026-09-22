import { useMemo, useState, type ChangeEvent } from 'react'
import type { LifeReceipt } from '../types/receipts'
import { chapterColors } from '../data/chapters'
import { fmtDate } from '../lib/formatters'

const DAY_MS = 86_400_000
const stamp = (date: string) => new Date(`${date}T12:00:00Z`).getTime()

export default function TimeScrubber({
  records,
  index,
  onChange,
}: {
  records: LifeReceipt[]
  index: number
  onChange: (next: number) => void
}) {
  const current = records[index]
  const [active, setActive] = useState(false)
  const denominator = Math.max(1, records.length - 1)
  const pct = (index / denominator) * 100

  const { march, density, yearLabels, chapterBands } = useMemo(() => {
    const positionForDate = (target: string) => {
      const found = records.findIndex((record) => record.date >= target)
      const resolved = found < 0 ? records.length - 1 : found
      return (resolved / Math.max(1, records.length - 1)) * 100
    }

    const densityMarks = Array.from({ length: 72 }, (_, i) => {
      const start = Math.floor((i * records.length) / 72)
      const end = Math.max(start + 1, Math.floor(((i + 1) * records.length) / 72))
      const slice = records.slice(start, end)
      const first = stamp(slice[0].date)
      const last = stamp(slice[slice.length - 1].date)
      const calendarDays = Math.max(1, Math.round((last - first) / DAY_MS) + 1)
      const coverage = Math.min(1, slice.length / calendarDays)
      return { left: (i / 71) * 100, coverage }
    })

    const bands = ['before', 'collapse', 'adaptation', 'reopening'].flatMap((chapter) => {
      const start = records.findIndex((record) => record.chapter === chapter)
      if (start < 0) return []
      let end = start
      while (end + 1 < records.length && records[end + 1].chapter === chapter) end += 1
      return [{
        chapter: chapter as LifeReceipt['chapter'],
        left: (start / Math.max(1, records.length - 1)) * 100,
        width: Math.max(0.5, ((end - start + 1) / Math.max(1, records.length - 1)) * 100),
      }]
    })

    return {
      march: positionForDate('2020-03-01'),
      density: densityMarks,
      chapterBands: bands,
      yearLabels: [
        { label: '2018', left: 0 },
        { label: '2019', left: positionForDate('2019-01-01') },
        { label: '2020', left: positionForDate('2020-01-01') },
        { label: '2021', left: positionForDate('2021-01-01') },
        { label: '2022', left: positionForDate('2022-01-01') },
      ],
    }
  }, [records])

  return (
    <section className="scrubber" aria-label="Timeline control">
      <div className="scrubber-top">
        <span>{fmtDate(current.date)}</span>
        <span>Day {index + 1} of {records.length}</span>
      </div>

      <div className={`range-wrap ${active ? 'is-active' : ''} ${pct < 4 ? 'bubble-start' : pct > 96 ? 'bubble-end' : ''}`}>
        <div
          className="scrub-bubble"
          aria-hidden="true"
          style={{ left: `${pct}%`, borderColor: chapterColors[current.chapter] }}
        >
          <b>{fmtDate(current.date, false)}</b>
          <em>{current.radiusScore == null ? 'No radius' : `Radius ${Math.round(current.radiusScore)}`}</em>
        </div>

        <div className="range-track" aria-hidden="true">
          <span className="range-fill" style={{ width: `${pct}%` }} />
          <span className="density-marks">
            {density.map((mark, markIndex) => (
              <i
                key={markIndex}
                style={{ left: `${mark.left}%`, opacity: 0.12 + mark.coverage * 0.48 }}
              />
            ))}
          </span>
          <span className="disruption" style={{ left: `${march}%` }}>
            <b>Mar 2020</b>
          </span>
        </div>

        <div className="chapter-bands" aria-hidden="true">
          {chapterBands.map((band) => (
            <i
              key={band.chapter}
              style={{ left: `${band.left}%`, width: `${band.width}%`, background: chapterColors[band.chapter] }}
            />
          ))}
        </div>

        <input
          aria-label="Life-receipt date"
          aria-describedby="timeline-help"
          aria-valuetext={`${fmtDate(current.date)}, ${current.chapter} chapter, radius ${current.radiusScore == null ? 'unavailable' : Math.round(current.radiusScore)}`}
          type="range"
          min="0"
          max={records.length - 1}
          step="1"
          value={index}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value))}
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
          onPointerDown={() => setActive(true)}
          onPointerUp={() => setActive(false)}
          onPointerCancel={() => setActive(false)}
        />
        <span className="sr-only" id="timeline-help">Use arrow keys for nearby recorded days. Home and End jump to the first and last record.</span>
      </div>

      <div className="year-labels" aria-hidden="true">
        {yearLabels.map((year) => (
          <span key={year.label} style={{ left: `${year.left}%` }}>{year.label}</span>
        ))}
      </div>
    </section>
  )
}
