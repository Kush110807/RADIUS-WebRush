import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion } from 'motion/react'
import { threads } from '../lib/metrics'
import type { ThreadId } from '../types/receipts'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function ThreadSelector({ value, onChange }: { value: ThreadId; onChange: (v: ThreadId) => void }) {
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
    <div className={`thread-strip-wrap ${edges.start ? 'fade-start' : ''} ${edges.end ? 'fade-end' : ''}`}>
      <p className="thread-strip-label" id="thread-strip-label">Filter the evidence thread</p>
      <nav className="thread-strip" aria-labelledby="thread-strip-label" ref={stripRef}>
        {threads.map((thread) => {
          const Icon = thread.icon
          const active = value === thread.id
          return (
            <button
              key={thread.id}
              type="button"
              aria-pressed={active}
              className={`thread-chip ${active ? 'active' : ''}`}
              onClick={() => onChange(thread.id)}
              style={{ '--thread': thread.color } as CSSProperties}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{thread.label}</span>
              {active && (
                <motion.span
                  layoutId="thread-dot"
                  className="thread-dot"
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 28 }}
                />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
