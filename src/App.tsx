import { lazy, Suspense } from 'react'
import { AnimatePresence } from 'motion/react'
import AppShell from './app/AppShell'
import { useArchiveData } from './app/useArchiveData'
import { useHashView } from './app/useHashView'
import LandingView from './features/landing/LandingView'
import StoryView from './features/story/StoryView'

const ArchiveView = lazy(() => import('./features/archive/ArchiveView'))
const MethodologyView = lazy(() => import('./features/methodology/MethodologyView'))

function LoadingState() {
  return <main id="main-content" className="system-state" role="status"><div><span className="system-orbit" aria-hidden="true" /><p className="eyebrow">RADIUS archive</p><h1>Opening 1,227 days…</h1><p>Loading the compact static evidence archive.</p></div></main>
}

function ErrorState({ message }: { message: string }) {
  return <main id="main-content" className="system-state" role="alert"><div><p className="eyebrow">Archive unavailable</p><h1>The receipts could not be opened.</h1><p>{message}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div></main>
}

export default function App() {
  const archive = useArchiveData()
  const { view, navigate, reduceMotion } = useHashView()

  if (archive.status === 'loading') return <AppShell view={view} onNavigate={navigate}><LoadingState /></AppShell>
  if (archive.status === 'error') return <AppShell view={view} onNavigate={navigate}><ErrorState message={archive.error} /></AppShell>

  const data = archive.data
  return (
    <AppShell view={view} onNavigate={navigate}>
      <AnimatePresence mode="wait">
        {view === 'landing' && <LandingView data={data} reduceMotion={reduceMotion} onEnter={() => navigate('story')} />}
        {view === 'story' && <StoryView data={data} reduceMotion={reduceMotion} onNavigate={navigate} />}
        {view === 'archive' && (
          <Suspense fallback={<LoadingState />}><ArchiveView data={data} onBack={() => navigate('story')} /></Suspense>
        )}
        {view === 'methodology' && (
          <Suspense fallback={<LoadingState />}><MethodologyView data={data} onBack={() => navigate('story')} /></Suspense>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
