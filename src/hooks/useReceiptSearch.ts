import { useMemo } from 'react'
import type { ChapterId, LifeReceipt, ThreadId } from '../types/receipts'
import { metricSpecs, threads } from '../lib/metrics'
import { fmtDate } from '../lib/formatters'
import { unusualScore } from '../lib/connections'

const chapterAliases: Record<ChapterId, string> = {
  before: 'before pre lockdown campus earlier pattern',
  collapse: 'collapse first lockdown march 2020 contraction',
  adaptation: 'adaptation covid smaller routine 2020 2021',
  reopening: 'reopening recovery expansion 2021 2022',
}

export function useReceiptSearch(
  records: LifeReceipt[],
  query: string,
  chapter: ChapterId | 'all',
  thread: ThreadId | 'all',
  sort: 'date-desc' | 'date-asc' | 'unusual',
  baseline: Record<string, number | null>,
) {
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    const relevantKeys = thread === 'all' ? [] : metricSpecs[thread].map((metric) => metric.key)

    const filtered = records.filter((receipt) => {
      if (chapter !== 'all' && receipt.chapter !== chapter) return false
      if (thread !== 'all' && !relevantKeys.some((key) => receipt[key] != null)) return false
      if (!q) return true

      const availableTerms = threads.flatMap((item) => {
        const available = metricSpecs[item.id].filter((metric) => receipt[metric.key] != null)
        if (!available.length) return []
        return [item.label, ...available.map((metric) => metric.label)]
      })
      const aliases = [
        receipt.incomingMessages != null || receipt.outgoingMessages != null ? 'sms messages texts' : '',
        receipt.incomingCalls != null || receipt.outgoingCalls != null ? 'calls phone calls' : '',
        receipt.backgroundAppsObserved != null ? 'apps applications background apps' : '',
        receipt.covidResponses ? 'covid pandemic questionnaire' : '',
        chapterAliases[receipt.chapter],
      ]
      const haystack = [
        receipt.date,
        fmtDate(receipt.date).toLowerCase(),
        receipt.chapter,
        receipt.date.slice(0, 4),
        ...availableTerms,
        ...aliases,
      ].join(' ').toLowerCase()
      return haystack.includes(q)
    })

    return [...filtered].sort((a, b) => {
      if (sort === 'date-asc') return a.date.localeCompare(b.date)
      if (sort === 'date-desc') return b.date.localeCompare(a.date)
      return unusualScore(b, baseline) - unusualScore(a, baseline)
    })
  }, [records, query, chapter, thread, sort, baseline])
}
