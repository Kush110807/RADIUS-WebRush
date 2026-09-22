import { useEffect, useState } from 'react'
import { loadArchive } from '../data/archiveRepository'
import type { DataPayload } from '../types/receipts'

type ArchiveState =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: DataPayload; error: null }
  | { status: 'error'; data: null; error: string }

export type ArchiveLoadMode = 'idle' | 'immediate'

export function useArchiveData(mode: ArchiveLoadMode = 'immediate'): ArchiveState {
  const [state, setState] = useState<ArchiveState>(() => (
    mode === 'immediate'
      ? { status: 'loading', data: null, error: null }
      : { status: 'idle', data: null, error: null }
  ))

  useEffect(() => {
    if (state.status === 'ready') return
    let active = true
    let idleId: number | null = null
    let timeoutId: number | null = null

    const start = () => {
      if (!active) return
      setState((current) => current.status === 'ready' ? current : { status: 'loading', data: null, error: null })
      loadArchive()
        .then((data) => {
          if (active) setState({ status: 'ready', data, error: null })
        })
        .catch((error: unknown) => {
          if (!active) return
          const message = error instanceof Error ? error.message : 'The archive could not be loaded.'
          setState({ status: 'error', data: null, error: message })
        })
    }

    const browser = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (mode === 'immediate') {
      start()
    } else if (typeof browser.requestIdleCallback === 'function') {
      idleId = browser.requestIdleCallback(start, { timeout: 650 })
    } else {
      timeoutId = window.setTimeout(start, 220)
    }

    return () => {
      active = false
      if (idleId != null) browser.cancelIdleCallback?.(idleId)
      if (timeoutId != null) window.clearTimeout(timeoutId)
    }
  }, [mode])

  return state
}
