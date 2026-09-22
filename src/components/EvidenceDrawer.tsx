import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import type { DataPayload, LifeReceipt, ThreadId } from '../types/receipts'
import { metricSpecs, threads } from '../lib/metrics'
import { comparisonText, fmtDate } from '../lib/formatters'
import { chapters, chapterColors } from '../data/chapters'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function EvidenceDrawer({
  open,
  onClose,
  receipt,
  thread,
  data,
}: {
  open: boolean
  onClose: () => void
  receipt: LifeReceipt
  thread: ThreadId
  data: DataPayload
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLElement | null>(null)
  const restoreRef = useRef<HTMLElement | null>(null)
  const reduce = useReducedMotion()
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && matchMedia('(max-width: 560px)').matches)

  useEffect(() => {
    const query = matchMedia('(max-width: 560px)')
    const sync = () => setMobile(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => closeRef.current?.focus())

    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusables = [...panelRef.current.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.hasAttribute('disabled'))
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handle)
    return () => {
      window.removeEventListener('keydown', handle)
      document.body.style.overflow = oldOverflow
      restoreRef.current?.focus()
    }
  }, [open, onClose])

  const median = data.chapterMedians[receipt.chapter]
  const before = data.chapterMedians.before
  const chapter = chapters.find((item) => item.id === receipt.chapter)!
  const threadMeta = threads.find((item) => item.id === thread)!

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="drawer-backdrop"
            aria-label="Close evidence drawer"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="evidence-title"
            className="evidence-drawer"
            style={{ '--chapter': chapterColors[receipt.chapter], '--thread': threadMeta.color } as CSSProperties}
            initial={reduce ? { opacity: 0 } : mobile ? { y: '100%' } : { x: '100%' }}
            animate={reduce ? { opacity: 1 } : { x: 0, y: 0 }}
            exit={reduce ? { opacity: 0 } : mobile ? { y: '100%' } : { x: '100%' }}
            transition={reduce ? { duration: 0.08 } : { type: 'spring', stiffness: 220, damping: 28 }}
          >
            <header>
              <div>
                <p className="eyebrow">Evidence file</p>
                <h2 id="evidence-title">{fmtDate(receipt.date)}</h2>
              </div>
              <button ref={closeRef} type="button" onClick={onClose} className="icon-button" aria-label="Close evidence"><X aria-hidden="true" /></button>
            </header>

            <div className="drawer-chapter">
              <span>{chapter.number} · {chapter.name}</span>
              <p>{chapter.interpretation}</p>
            </div>

            <div className="drawer-snapshot" aria-label="Radius comparison">
              <span><small>Daily radius</small><b>{receipt.radiusScore == null ? '—' : Math.round(receipt.radiusScore)}</b></span>
              <span><small>Chapter median</small><b>{median.radiusScore == null ? '—' : Math.round(median.radiusScore)}</b></span>
              <span><small>Before median</small><b>{before.radiusScore == null ? '—' : Math.round(before.radiusScore)}</b></span>
            </div>
            <p className="drawer-score-note">Radius values are visual storytelling scores derived from recorded mobility signals, not clinical or scientific assessments.</p>

            <section>
              <h3><i aria-hidden="true" />{threadMeta.label} thread</h3>
              <div className="evidence-table">
                {metricSpecs[thread].map((metric) => {
                  const raw = receipt[metric.key]
                  const value = typeof raw === 'number' ? raw : null
                  const chapterMedian = median[String(metric.key)] ?? null
                  return (
                    <div key={String(metric.key)}>
                      <div>
                        <span>{metric.label}</span>
                        <small>Source: {metric.source}</small>
                        {metric.qualification && <small>{metric.qualification}</small>}
                      </div>
                      <strong>{value == null ? 'No record' : `${value.toFixed(metric.digits ?? 0)}${metric.unit}`}</strong>
                      <em>{comparisonText(value, chapterMedian, 'chapter')}</em>
                    </div>
                  )
                })}
              </div>
            </section>

            {receipt.covidResponses && (
              <section className="context-note">
                <h3>Period context</h3>
                <p>A COVID-specific EMA answer exists for this day. RADIUS keeps it as contextual evidence but does not convert it into a causal claim.</p>
              </section>
            )}

            <section className="method-note">
              <h3>Why these records are connected</h3>
              <p>The daily receipts share the same anonymous participant and calendar day. The living radius combines mobility-related sensing only; survey responses remain separately labelled self-reports.</p>
            </section>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
