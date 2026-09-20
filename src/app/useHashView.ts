import { useCallback, useEffect, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

export type AppView = 'landing' | 'story' | 'archive' | 'methodology'

const parseHash = (): AppView => {
  if (typeof window === 'undefined') return 'landing'
  switch (window.location.hash) {
    case '#story': return 'story'
    case '#archive': return 'archive'
    case '#methodology': return 'methodology'
    default: return 'landing'
  }
}

const hashForView = (view: AppView) => view === 'landing' ? '' : `#${view}`

export function useHashView() {
  const [view, setView] = useState<AppView>(parseHash)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const sync = () => setView(parseHash())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const navigate = useCallback((next: AppView) => {
    const hash = hashForView(next)
    if (hash) {
      if (window.location.hash !== hash) window.location.hash = hash
    } else {
      history.pushState(null, '', `${window.location.pathname}${window.location.search}`)
      setView('landing')
    }
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [reduceMotion])

  return { view, navigate, reduceMotion }
}
