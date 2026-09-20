import { useMemo, type ChangeEvent } from 'react'
import type { LifeReceipt } from '../types/receipts'
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
  const pct = (index / (records.length - 1)) * 100

  const { march, density, yearLabels } = useMemo(() => {
    const positionForDate = (target: string) => {
      const found = records.findIndex((record) => record.date >= target)
      const resolved = found < 0 ? records.length - 1 : found
      return (resolved / (records.length - 1)) * 100
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

    return {
      march: positionForDate('2020-03-01'),
      density: densityMarks,
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
        <span>{index + 1} / {records.length} recorded days</span>
      </div>

      <div className="range-wrap">
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

        <input
          aria-label="Life-receipt date"
          aria-valuetext={`${fmtDate(current.date)}, ${current.chapter} chapter`}
          type="range"
          min="0"
          max={records.length - 1}
          value={index}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value))}
        />
      </div>

      <div className="year-labels" aria-hidden="true">
        {yearLabels.map((year) => (
          <span key={year.label} style={{ left: `${year.left}%` }}>{year.label}</span>
        ))}
      </div>
    </section>
  )
}
