import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import { threads } from '../lib/metrics'
import type { ThreadId } from '../types/receipts'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function ThreadSelector({ value, onChange }: { value: ThreadId; onChange: (v: ThreadId) => void }) {
  const reduce = useReducedMotion()

  return (
    <nav className="thread-strip" aria-label="Evidence threads">
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
  )
}
