import { Check, type LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'
import { threads } from '../lib/metrics'
import type { ThreadId } from '../types/receipts'

type ThreadMeta = (typeof threads)[number] & { icon: LucideIcon }

function coverageLabel(thread: ThreadMeta, count: number) {
  if (thread.id === 'emotion') return `${count.toLocaleString()} survey days`
  return `${count.toLocaleString()} recorded days`
}

export default function ThreadSelector({
  value,
  onChange,
  counts,
}: {
  value: ThreadId
  onChange: (v: ThreadId) => void
  counts?: Record<ThreadId, number>
}) {
  return (
    <section className="evidence-explorer-v2" aria-labelledby="evidence-explorer-title">
      <div className="evidence-explorer-head-v2">
        <div>
          <p className="eyebrow">Evidence explorer</p>
          <h2 id="evidence-explorer-title">Choose a lens</h2>
        </div>
        <p>Select a lens to change the evidence beside the chart. Counts show days with usable data.</p>
      </div>

      <div className="thread-grid-v2" role="group" aria-label="Evidence threads">
        {threads.map((thread) => {
          const Icon = thread.icon
          const active = value === thread.id
          const count = counts?.[thread.id]
          return (
            <button
              key={thread.id}
              type="button"
              aria-pressed={active}
              className={`thread-card-v2 ${active ? 'is-active' : ''}`}
              onClick={() => onChange(thread.id)}
              style={{ '--thread': thread.color } as CSSProperties}
              title={`${thread.label}: ${thread.description}${count == null ? '' : `. ${coverageLabel(thread, count)} with usable evidence.`}`}
            >
              <span className="thread-icon-v2" aria-hidden="true"><Icon size={22} /></span>
              <span className="thread-copy-v2">
                <strong>{thread.label}</strong>
                <small>{thread.shortDescription}</small>
              </span>
              {count != null && (
                <span className="thread-coverage-v2" aria-label={`${coverageLabel(thread, count)} with usable ${thread.label.toLowerCase()} evidence`}>
                  <b>{count.toLocaleString()}</b>
                  <small>{thread.id === 'emotion' ? 'survey days' : 'days'}</small>
                </span>
              )}
              <span className="thread-state-v2" aria-hidden="true">{active ? <Check size={16} /> : <i />}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
