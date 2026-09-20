import { useState, type ChangeEvent, type CSSProperties } from 'react'
import { Search, X, Inbox } from 'lucide-react'
import type { ChapterId, DataPayload, LifeReceipt, ThreadId } from '../../types/receipts'
import { chapters, chapterColors } from '../../data/chapters'
import { threads, metricSpecs, type MetricSpec } from '../../lib/metrics'
import { useReceiptSearch } from '../../hooks/useReceiptSearch'
import { fmtDate } from '../../lib/formatters'
import EvidenceDrawer from '../../components/EvidenceDrawer'

export default function ArchiveExplorer({ data, onBack }: { data: DataPayload; onBack: () => void }) {
  const [query, setQuery] = useState('')
  const [chapter, setChapter] = useState<ChapterId | 'all'>('all')
  const [thread, setThread] = useState<ThreadId | 'all'>('all')
  const [sort, setSort] = useState<'date-desc' | 'date-asc' | 'unusual'>('date-desc')
  const [selected, setSelected] = useState<LifeReceipt | null>(null)
  const results = useReceiptSearch(data.records, query, chapter, thread, sort, data.chapterMedians.before)
  const visible = results.slice(0, 180)
  const activeThread: ThreadId = thread === 'all' ? 'movement' : thread
  const previewSpecs: MetricSpec[] = thread === 'all'
    ? [metricSpecs.movement[0], metricSpecs.attention[0], metricSpecs.emotion[0]]
    : metricSpecs[thread].slice(0, 3)

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to archive results</a>
      <main className="archive-view" id="main-content">
        <header className="archive-header">
          <div>
            <button className="text-button" type="button" onClick={onBack}>← Story mode</button>
            <p className="eyebrow">Anonymous 37 · evidence archive</p>
            <h1>Browse the receipts.</h1>
            <p>Search and inspect the daily records behind the story. No raw contact identifiers, coordinates, or message contents are exposed.</p>
          </div>
          <span className="archive-count" aria-live="polite">{results.length.toLocaleString()} days</span>
        </header>

        <section className="archive-controls" aria-label="Archive filters">
          <label className="search-box">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search receipts</span>
            <input
              value={query}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
              placeholder="Search date, year, chapter or metric…"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} aria-hidden="true" /></button>
            )}
          </label>

          <div className="archive-thread-row" aria-label="Filter by evidence thread">
            <button type="button" className={thread === 'all' ? 'active' : ''} onClick={() => setThread('all')}>All threads</button>
            {threads.map((item) => {
              const Icon = item.icon
              return (
                <button
                  type="button"
                  key={item.id}
                  className={thread === item.id ? 'active' : ''}
                  aria-pressed={thread === item.id}
                  onClick={() => setThread(item.id)}
                  style={{ '--thread': item.color } as CSSProperties}
                >
                  <Icon size={15} aria-hidden="true" />{item.label}
                </button>
              )
            })}
          </div>

          <div className="filter-row">
            <label>
              <span>Chapter</span>
              <select value={chapter} onChange={(event: ChangeEvent<HTMLSelectElement>) => setChapter(event.target.value as ChapterId | 'all')}>
                <option value="all">All chapters</option>
                {chapters.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label>
              <span>Sort</span>
              <select value={sort} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSort(event.target.value as typeof sort)}>
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="unusual">Largest deviation vs Before</option>
              </select>
            </label>
          </div>
        </section>

        {visible.length === 0 ? (
          <section className="empty-state" role="status">
            <Inbox aria-hidden="true" />
            <h2>No receipts found</h2>
            <p>Try a broader date, chapter, or evidence thread.</p>
            <button type="button" onClick={() => { setQuery(''); setChapter('all'); setThread('all') }}>Clear filters</button>
          </section>
        ) : (
          <section className="archive-grid" aria-label="Receipt results">
            {visible.map((receipt) => {
              const score = receipt.radiusScore
              const glyphSize = score == null ? 22 : 24 + Math.min(100, Math.max(0, score)) * 0.38
              const chapter = chapters.find((item) => item.id === receipt.chapter)!
              return (
                <button
                  type="button"
                  className="archive-card"
                  key={receipt.date}
                  aria-label={`Open ${fmtDate(receipt.date)} receipt, ${chapter.name} chapter`}
                  onClick={() => setSelected(receipt)}
                  style={{ '--chapter': chapterColors[receipt.chapter] } as CSSProperties}
                >
                  <div className="archive-card-head">
                    <span>{fmtDate(receipt.date, false)}</span>
                    <span>{chapter.name}</span>
                  </div>
                  <div className="archive-card-body">
                    <span className="archive-radius-glyph" aria-hidden="true">
                      <i style={{ width: glyphSize, height: glyphSize }} />
                      <b>{score == null ? '—' : Math.round(score)}</b>
                      <small>radius</small>
                    </span>
                    <div className="archive-metrics">
                      {previewSpecs.map((spec) => {
                        const raw = receipt[spec.key]
                        const value = typeof raw === 'number' ? raw : null
                        return (
                          <span key={String(spec.key)}>
                            <small>{spec.label}</small>
                            <strong>{value == null ? '—' : `${value.toFixed(spec.digits ?? 0)}${spec.unit}`}</strong>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </button>
              )
            })}
          </section>
        )}

        {results.length > visible.length && (
          <p className="archive-limit">Showing the first {visible.length} results for performance. Refine your search to inspect a specific period.</p>
        )}
        {selected && (
          <EvidenceDrawer open={Boolean(selected)} onClose={() => setSelected(null)} receipt={selected} thread={activeThread} data={data} />
        )}
      </main>
    </>
  )
}
