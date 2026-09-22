import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { motion } from 'motion/react'
import AppShell from './app/AppShell'
import { useArchiveData } from './app/useArchiveData'
import { useHashView, type AppView } from './app/useHashView'
import { landingSummary } from './data/landingSummary'
import LandingView from './features/landing/LandingView'

const loadStoryView = () => import('./features/story/StoryView')
const loadArchiveView = () => import('./features/archive/ArchiveView')
const loadMethodologyView = () => import('./features/methodology/MethodologyView')
const StoryView = lazy(loadStoryView)
const ArchiveView = lazy(loadArchiveView)
const MethodologyView = lazy(loadMethodologyView)

function LoadingState() {
  return <main id="main-content" className="system-state" role="status"><div><span className="system-orbit" aria-hidden="true" /><p className="eyebrow">RADIUS archive</p><h1>Opening 1,227 days…</h1><p>Preparing the recorded days needed for this view.</p></div></main>
}

function ErrorState({ message }: { message: string }) {
  return <main id="main-content" className="system-state" role="alert"><div><p className="eyebrow">Archive unavailable</p><h1>The receipts could not be opened.</h1><p>{message}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div></main>
}

function ViewEntrance({ view, reduceMotion, children }: { view: AppView; reduceMotion: boolean; children: ReactNode }) {
  return (
    <motion.div
      key={view}
      className="view-frame"
      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const { view, navigate, reduceMotion } = useHashView()
  const archive = useArchiveData(view === 'landing' ? 'idle' : 'immediate')

  // Keep the landing bundle lean, then warm the next likely view after first paint.
  // Secondary Story destinations are warmed only after Story itself is usable.
  useEffect(() => {
    let idleId: number | null = null
    let timeoutId: number | null = null
    const warm = () => {
      if (view === 'landing') void loadStoryView()
      if (view === 'story') {
        void loadArchiveView()
        void loadMethodologyView()
      }
    }
    const browser = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }
    if (typeof browser.requestIdleCallback === 'function') idleId = browser.requestIdleCallback(warm, { timeout: 650 })
    else timeoutId = window.setTimeout(warm, 180)
    return () => {
      if (idleId != null) browser.cancelIdleCallback?.(idleId)
      if (timeoutId != null) window.clearTimeout(timeoutId)
    }
  }, [view])

  let screen: ReactNode
  if (view === 'landing') {
    screen = <LandingView summary={landingSummary} reduceMotion={reduceMotion} onPrepare={() => { void loadStoryView() }} onEnter={() => navigate('story')} />
  } else if (archive.status === 'error') {
    screen = <ErrorState message={archive.error} />
  } else if (archive.status !== 'ready') {
    screen = <LoadingState />
  } else if (view === 'story') {
    screen = <Suspense fallback={<LoadingState />}><StoryView data={archive.data} reduceMotion={reduceMotion} onNavigate={navigate} /></Suspense>
  } else if (view === 'archive') {
    screen = <Suspense fallback={<LoadingState />}><ArchiveView data={archive.data} onBack={() => navigate('story')} /></Suspense>
  } else {
    screen = <Suspense fallback={<LoadingState />}><MethodologyView data={archive.data} onBack={() => navigate('story')} /></Suspense>
  }

  return (
    <AppShell view={view} onNavigate={navigate}>
      <ViewEntrance view={view} reduceMotion={reduceMotion}>{screen}</ViewEntrance>
    </AppShell>
  )
}
