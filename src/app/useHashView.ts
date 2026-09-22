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
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  const navigate = useCallback((next: AppView) => {
    if (next === view) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    const hash = hashForView(next)
    const nextUrl = `${window.location.pathname}${window.location.search}${hash}`
    history.pushState(null, '', nextUrl)
    setView(next)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [view])

  return { view, navigate, reduceMotion }
}
