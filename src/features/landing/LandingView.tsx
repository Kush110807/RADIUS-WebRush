import { motion } from 'motion/react'
import { ArrowRight, Home } from 'lucide-react'
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
  const reduction = Math.max(0, Math.round((1 - collapseRadius / beforeRadius) * 100))

  return (
    <motion.main
      id="main-content"
      className="landing landing-final"
      key="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.985 }}
    >
      <section className="hero-copy" aria-labelledby="hero-title">
        <p className="eyebrow">Your life, in receipts · Anonymous 37</p>
        <h1 id="hero-title">How far can<br />a life <em>shrink?</em></h1>
        <p className="hero-tagline">The year a life folded inward.</p>
        <p className="hero-support">Four years. 1,227 recorded days. One anonymous student. Thousands of digital traces turned into a navigable story.</p>
        <button className="primary-cta" type="button" onClick={onEnter}>
          Enter the story <ArrowRight aria-hidden="true" />
        </button>
        <div className="radius-key-wrap">
          <p className="radius-key-title">How to read the radius</p>
          <ul className="radius-key" aria-label="How to read the living radius">
            <li><i className="key-large" aria-hidden="true" /><b>Larger circle</b><span>Broader recorded physical world</span></li>
            <li><i className="key-small" aria-hidden="true" /><b>Smaller circle</b><span>More contracted recorded world</span></li>
            <li><i className="key-dotted" aria-hidden="true" /><b>Dotted guides</b><span>Reference scale, not kilometres</span></li>
            <li><i className="key-drag" aria-hidden="true" /><b>Drag through time</b><span>Watch the score expand and contract</span></li>
          </ul>
        </div>
      </section>

      <motion.section
        layoutId={reduceMotion ? undefined : 'radius-frame'}
        className="hero-visual hero-visual-final"
        aria-label={`The median living-radius score contracts from ${Math.round(beforeRadius)} before March 2020 to ${Math.round(collapseRadius)} during the first lockdown period, a ${reduction} percent reduction.`}
      >
        <div className="hero-visual-heading" aria-hidden="true">
          <span>Living radius</span>
          <small>A visual trace of a changing life</small>
        </div>
        <div className="hero-radius-field hero-radius-final" aria-hidden="true">
          <span className="hero-compass north">N</span><span className="hero-compass east">E</span><span className="hero-compass south">S</span><span className="hero-compass west">W</span>
          <div className="hero-crosshair horizontal" /><div className="hero-crosshair vertical" />
          <div className="hero-scale hero-scale-one" /><div className="hero-scale hero-scale-two" /><div className="hero-scale hero-scale-three" />
          <div className="hero-reference-ring hero-reference-final">
            <span className="ring-label ring-label-before"><b>{Math.round(beforeRadius)}</b><small>/100 · BEFORE</small></span>
          </div>
          <motion.div
            className="hero-collapse-ring hero-collapse-final"
            style={{ width: `${collapseRatio * 100}%`, height: `${collapseRatio * 100}%` }}
            initial={reduceMotion ? false : { scale: 1.7, opacity: 0.18 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1.15, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="ring-label ring-label-collapse"><b>{Math.round(collapseRadius)}</b><small>/100 · FIRST LOCKDOWN</small></span>
          </motion.div>
          <div className="hero-home-core hero-home-final"><Home size={19} /><span>HOME</span></div>
        </div>
        <div className="hero-insight-card">
          <p>A smaller world</p>
          <div className="hero-comparison"><span><b>{Math.round(beforeRadius)}</b><small>/100</small><em>Before</em></span><i>→</i><span className="collapse"><b>{Math.round(collapseRadius)}</b><small>/100</small><em>First lockdown</em></span></div>
          <div className="hero-reduction"><strong>{reduction}%</strong><span><b>smaller world</b><small>median living-radius score</small></span></div>
        </div>
      </motion.section>

      <footer className="landing-footer">
        <span>Observed change, not causal diagnosis.</span>
        <span>Score 0–100 · visual storytelling measure · not physical distance</span>
      </footer>
    </motion.main>
  )
}
