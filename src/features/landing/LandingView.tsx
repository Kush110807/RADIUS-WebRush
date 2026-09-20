import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import type { DataPayload } from '../../types/receipts'

export default function LandingView({
  data,
  reduceMotion,
  onEnter,
}: {
  data: DataPayload
  reduceMotion: boolean
  onEnter: () => void
}) {
  const beforeRadius = data.chapterMedians.before.radiusScore ?? data.normalisation.baselineRadiusScore
  const collapseRadius = data.chapterMedians.collapse.radiusScore ?? beforeRadius
  const collapseRatio = Math.max(0.28, Math.min(0.9, collapseRadius / beforeRadius))

  return (
    <motion.main
      id="main-content"
      className="landing"
      key="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.985 }}
    >
      <section className="hero-copy" aria-labelledby="hero-title">
        <p className="eyebrow">Your life, in receipts · Anonymous 37</p>
        <h1 id="hero-title">How far can<br />a life <em>shrink?</em></h1>
        <p className="hero-tagline">The year a life folded inward.</p>
        <p className="hero-support">Four years. 1,227 days. One anonymous student. Thousands of digital traces.</p>
        <button className="primary-cta" type="button" onClick={onEnter}>
          Enter the archive <ArrowRight aria-hidden="true" />
        </button>
        <span className="quiet-instruction">Drag through four years of digital traces</span>
      </section>

      <motion.section
        layoutId={reduceMotion ? undefined : 'radius-frame'}
        className="hero-visual"
        aria-label={`The median visual radius contracts from ${Math.round(beforeRadius)} before March 2020 to ${Math.round(collapseRadius)} during the first lockdown period.`}
      >
        <div className="hero-radius-field" aria-hidden="true">
          <div className="hero-gridline hero-gridline-a" />
          <div className="hero-gridline hero-gridline-b" />
          <div className="hero-reference-ring"><span>BEFORE</span><b>{Math.round(beforeRadius)}</b></div>
          <motion.div
            className="hero-collapse-ring"
            style={{ width: `${collapseRatio * 100}%`, height: `${collapseRatio * 100}%` }}
            initial={reduceMotion ? false : { scale: 2.15, opacity: 0.12 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1.25, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>FIRST LOCKDOWN</span><b>{Math.round(collapseRadius)}</b>
          </motion.div>
          <div className="hero-home-core">HOME</div>
        </div>
        <div className="hero-caption">
          <strong><span>{Math.round(beforeRadius)}</span><i aria-hidden="true">→</i><span>{Math.round(collapseRadius)}</span></strong>
          <b>median living-radius score</b>
          <span>Before → first lockdown · visual storytelling score</span>
        </div>
      </motion.section>

      <footer className="landing-footer">
        <span>Observed change, not causal diagnosis.</span>
        <span>One signature interaction: drag the living radius through time ↓</span>
      </footer>
    </motion.main>
  )
}
