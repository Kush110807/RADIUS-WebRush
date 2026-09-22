import { motion } from 'motion/react'
import { ArrowRight, Home } from 'lucide-react'
import type { LandingSummary } from '../../data/landingSummary'

export default function LandingView({
  summary,
  reduceMotion,
  onPrepare,
  onEnter,
}: {
  summary: LandingSummary
  reduceMotion: boolean
  onPrepare?: () => void
  onEnter: () => void
}) {
  const beforeRadius = summary.beforeRadius
  const collapseRadius = summary.firstLockdownRadius
  const collapseRatio = Math.max(0.25, Math.min(0.88, collapseRadius / Math.max(1, beforeRadius)))
  const reduction = Math.max(0, Math.round((1 - collapseRadius / Math.max(1, beforeRadius)) * 100))

  return (
    <main id="main-content" className="landing landing-v2">
      <section className="hero-copy hero-copy-v2" aria-labelledby="hero-title">
        <p className="eyebrow">Your life, in receipts · {summary.participant}</p>
        <h1 id="hero-title">How far can<br />a life <em>shrink?</em></h1>
        <p className="hero-tagline">The year a life folded inward.</p>
        <p className="hero-support">Four years. {summary.days.toLocaleString()} recorded days. One anonymous student. Thousands of digital traces turned into a navigable story.</p>
        <button className="primary-cta" type="button" onPointerEnter={onPrepare} onFocus={onPrepare} onTouchStart={onPrepare} onClick={onEnter}>
          Enter the story <ArrowRight aria-hidden="true" />
        </button>
        <div className="radius-key-wrap radius-key-v2-wrap">
          <p className="radius-key-title">How to read the radius</p>
          <ul className="radius-key radius-key-v2" aria-label="How to read the living radius">
            <li><i className="key-large" aria-hidden="true" /><b>Larger circle</b><span>Broader recorded physical world</span></li>
            <li><i className="key-small" aria-hidden="true" /><b>Smaller circle</b><span>More contracted recorded world</span></li>
            <li><i className="key-dotted" aria-hidden="true" /><b>Faint guides</b><span>Visual reference only — not kilometres</span></li>
            <li><i className="key-drag" aria-hidden="true" /><b>Drag through time</b><span>Watch the storytelling score change</span></li>
          </ul>
        </div>
      </section>

      <motion.section
        className="hero-visual hero-visual-v2"
        aria-label={`The median living-radius score contracts from ${Math.round(beforeRadius)} before March 2020 to ${Math.round(collapseRadius)} during the first lockdown period, a ${reduction} percent reduction.`}
      >
        <div className="landing-radius-v2" aria-hidden="true">
          <div className="landing-radius-guides-v2"><i /><i /><i /></div>
          <div className="landing-axis-v2 horizontal" /><div className="landing-axis-v2 vertical" />
          <div className="landing-before-ring-v2" />
          <span className="landing-ring-label-v2 before"><small>Before</small><b>{Math.round(beforeRadius)}</b><em>/100</em></span>
          <motion.div
            className="landing-collapse-ring-v2"
            style={{ width: `${collapseRatio * 72}%`, height: `${collapseRatio * 72}%` }}
            initial={reduceMotion ? false : { scale: 1.5, opacity: 0.15 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          />
          <span className="landing-ring-label-v2 first-lockdown" style={{ top: `${50 - collapseRatio * 36}%` }}><small>First lockdown</small><b>{Math.round(collapseRadius)}</b><em>/100</em></span>
          <div className="landing-home-v2"><Home size={20} /><span>HOME</span></div>
        </div>

        <div className="landing-insight-v2">
          <p>A smaller world</p>
          <div className="landing-compare-v2">
            <span><small>Before</small><b>{Math.round(beforeRadius)}</b><em>/100</em></span>
            <i aria-hidden="true">→</i>
            <span className="first-lockdown"><small>First lockdown</small><b>{Math.round(collapseRadius)}</b><em>/100</em></span>
          </div>
          <div className="landing-reduction-v2"><strong>{reduction}%</strong><span><b>smaller than Before</b><small>median living-radius score</small></span></div>
        </div>
        <p className="landing-score-explainer"><strong>Living-radius score (0–100)</strong> — a visual storytelling measure, not physical distance.</p>
      </motion.section>

      <footer className="landing-footer">
        <span>Observed change, not causal diagnosis.</span>
        <span>One participant · recorded signals · four chapters</span>
      </footer>
    </main>
  )
}
