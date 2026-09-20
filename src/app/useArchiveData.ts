import { useEffect, useState } from 'react'
import { loadArchive } from '../data/archiveRepository'
import type { DataPayload } from '../types/receipts'

type ArchiveState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: DataPayload; error: null }
  | { status: 'error'; data: null; error: string }

export function useArchiveData(): ArchiveState {
  const [state, setState] = useState<ArchiveState>({ status: 'loading', data: null, error: null })

  useEffect(() => {
    let active = true
    loadArchive()
      .then((data) => {
        if (active) setState({ status: 'ready', data, error: null })
      })
      .catch((error: unknown) => {
        if (!active) return
        const message = error instanceof Error ? error.message : 'The archive could not be loaded.'
        setState({ status: 'error', data: null, error: message })
      })
    return () => { active = false }
  }, [])

  return state
}
