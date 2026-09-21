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
          Enter the story <ArrowRight aria-hidden="true" />
        </button>
        <div className="radius-key-wrap">
          <p className="radius-key-title">How to read the radius</p>
          <ul className="radius-key" aria-label="How to read the living radius">
            <li><i className="key-large" aria-hidden="true" /><b>Larger circle</b><span>Broader recorded physical world that day</span></li>
            <li><i className="key-small" aria-hidden="true" /><b>Smaller circle</b><span>More contracted recorded world</span></li>
            <li><i className="key-dotted" aria-hidden="true" /><b>Dotted ring</b><span>Typical recorded day before March 2020</span></li>
            <li><i className="key-drag" aria-hidden="true" /><b>Drag through time</b><span>See how the recorded radius changes</span></li>
          </ul>
        </div>
      </section>

      <motion.section
        layoutId={reduceMotion ? undefined : 'radius-frame'}
        className="hero-visual"
        aria-label={`The median visual radius contracts from ${Math.round(beforeRadius)} before March 2020 to ${Math.round(collapseRadius)} during the first lockdown period.`}
      >
        <div className="hero-radius-field" aria-hidden="true">
          <div className="hero-gridline hero-gridline-a" />
          <div className="hero-gridline hero-gridline-b" />
          <div className="hero-reference-ring"><span>BEFORE · {Math.round(beforeRadius)}</span><b aria-hidden="true">{Math.round(beforeRadius)}</b></div>
          <motion.div
            className="hero-collapse-ring"
            style={{ width: `${collapseRatio * 100}%`, height: `${collapseRatio * 100}%` }}
            initial={reduceMotion ? false : { scale: 2.15, opacity: 0.12 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1.25, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>FIRST LOCKDOWN · {Math.round(collapseRadius)}</span><b aria-hidden="true">{Math.round(collapseRadius)}</b>
          </motion.div>
          <div className="hero-home-core">HOME</div>
        </div>
        <div className="hero-caption">
          <strong><span>{Math.round(beforeRadius)}</span><i aria-hidden="true">→</i><span>{Math.round(collapseRadius)}</span></strong>
          <b>Median living-radius score</b>
          <span>Before → first lockdown</span>
          <small>Visual storytelling score</small>
        </div>
      </motion.section>

      <footer className="landing-footer">
        <span>Observed change, not causal diagnosis.</span>
        <span>One signature interaction: drag the living radius through time ↓</span>
      </footer>
    </motion.main>
  )
}
