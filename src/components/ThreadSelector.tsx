import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { threads } from '../lib/metrics'
import type { ThreadId } from '../types/receipts'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function ThreadSelector({
  value,
  onChange,
  counts,
}: {
  value: ThreadId
  onChange: (v: ThreadId) => void
  counts?: Partial<Record<ThreadId, number>>
}) {
  const reduce = useReducedMotion()
  const stripRef = useRef<HTMLDivElement | null>(null)
  const [edges, setEdges] = useState({ start: false, end: false })

  const syncEdges = () => {
    const node = stripRef.current
    if (!node) return
    const max = node.scrollWidth - node.clientWidth
    setEdges({ start: node.scrollLeft > 4, end: max > 4 && node.scrollLeft < max - 4 })
  }

  useEffect(() => {
    syncEdges()
    const node = stripRef.current
    if (!node) return
    node.addEventListener('scroll', syncEdges, { passive: true })
    window.addEventListener('resize', syncEdges)
    return () => {
      node.removeEventListener('scroll', syncEdges)
      window.removeEventListener('resize', syncEdges)
    }
  }, [])

  useEffect(() => {
    const node = stripRef.current?.querySelector<HTMLElement>('.thread-chip.active')
    node?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
    const timer = window.setTimeout(syncEdges, 320)
    return () => window.clearTimeout(timer)
  }, [value, reduce])

  return (
    <section className={`thread-strip-wrap ${edges.start ? 'fade-start' : ''} ${edges.end ? 'fade-end' : ''}`} aria-labelledby="thread-strip-label">
      <div className="thread-strip-heading">
        <div>
          <p className="thread-strip-kicker">Evidence explorer</p>
          <h2 id="thread-strip-label">Filter the evidence thread</h2>
        </div>
        <p>Select a lens to change the signals explained in the chart and observation panel.</p>
      </div>
      <nav className="thread-strip" aria-label="Evidence threads" ref={stripRef}>
        {threads.map((thread) => {
          const Icon = thread.icon
          const active = value === thread.id
          const count = counts?.[thread.id]
          return (
            <button
              key={thread.id}
              type="button"
              aria-pressed={active}
              className={`thread-chip ${active ? 'active' : ''}`}
              onClick={() => onChange(thread.id)}
              style={{ '--thread': thread.color } as CSSProperties}
            >
              <span className="thread-icon" aria-hidden="true"><Icon size={19} /></span>
              <span className="thread-copy">
                <span className="thread-name-row">
                  <strong>{thread.label}</strong>
                  {count != null && <small>{count}</small>}
                </span>
                <em>{thread.shortDescription ?? thread.description}</em>
              </span>
              <span className="thread-state" aria-hidden="true">
                {active ? <Check size={15} /> : <span />}
              </span>
              {active && (
                <motion.span
                  layoutId="thread-active-rail"
                  className="thread-active-rail"
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </nav>
    </section>
  )
}
