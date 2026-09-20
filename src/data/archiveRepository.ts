import type { DataPayload } from '../types/receipts'

let cachedArchive: DataPayload | null = null
let inflightArchive: Promise<DataPayload> | null = null

function assertArchiveShape(payload: unknown): asserts payload is DataPayload {
  if (!payload || typeof payload !== 'object') throw new Error('Archive payload is not an object.')
  const candidate = payload as Partial<DataPayload>
  if (candidate.participant !== 'Anonymous 37') throw new Error('Unexpected archive participant.')
  if (!Array.isArray(candidate.records) || candidate.records.length !== 1227) {
    throw new Error('Archive records are incomplete.')
  }
}

/**
 * Loads the compact, already-processed archive from a static asset.
 * The dataset stays outside the initial JS bundle and is cached after first load.
 */
export function loadArchive(): Promise<DataPayload> {
  if (cachedArchive) return Promise.resolve(cachedArchive)
  if (inflightArchive) return inflightArchive

  const url = `${import.meta.env.BASE_URL}data/anonymous37.json`
  inflightArchive = fetch(url, { cache: 'force-cache' })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Archive request failed (${response.status}).`)
      const payload: unknown = await response.json()
      assertArchiveShape(payload)
      cachedArchive = payload
      return payload
    })
    .finally(() => {
      inflightArchive = null
    })

  return inflightArchive
}
